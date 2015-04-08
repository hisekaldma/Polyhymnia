var Polyhymnia = Polyhymnia || {};

Polyhymnia.Generator = function() {
  'use strict';
  var noteType = Polyhymnia.noteType;
  var self = this;

  this.tonic = 'C';
  this.scale = 'major';

  var startRule = 'Play';
  var params = {};
  var ruleDictionary = null;
  var ruleTree = null;

  this.setParam = function(name, value) {
    params[name] = value;
  };

  this.getParam = function(name) {
    return params[name] || 0.0;
  };

  this.getCurrentBar = function() {
    return getCurrentBar(ruleTree);
  };

  this.step = function() {
    step(ruleTree);
  };

  this.reset = function() {
    resetState(ruleTree);
  };

  this.setRules = function(rules) {
    // Prepare for playing
    ruleDictionary = {};
    rules.forEach(function(rule) {
      ruleDictionary[rule.name] = rule;
    });
    var oldRuleTree = ruleTree;    
    ruleTree = buildTree(ruleDictionary[startRule]);

    // Copy state to allow replacing the rules while playing
    if (oldRuleTree) {
      copyState(oldRuleTree, ruleTree);
    }
  };

  function buildTree(rule) {
    // If we can't find the rule, return an empty node, so we can keep playing
    if (!rule) {
      return { name: '', definitions: [] };
    }

    var node = { name: rule.name, definitions: [] };

    rule.definitions.forEach(function(definition) {
      if (definition.sequence) {
        // Sequence definition, find its children recursively
        var children = [];
        definition.sequence.forEach(function(reference) {
          if (reference.invalid) {
            children.push(buildTree());
          } else {
            var rule = ruleDictionary[reference.name];
            children.push(buildTree(rule));
          }
        });
        node.definitions.push({ condition: definition.condition, sequence: children, index: 0 });
      } else if (definition.pattern) {
        // Pattern definition, just add it
        node.definitions.push({ condition: definition.condition, pattern: definition.pattern, instrument: definition.instrument.name, index: 0 });
      }
    });

    return node;
  }

  function step(node) {
    var finished = true;
    var length = 0;
    node.definitions.forEach(function(definition) {
      if (definition.sequence) {
        // Sequence definition, step it's current child
        var currentRule = definition.sequence[definition.index];
        var currentFinished = step(currentRule);
        if (currentFinished) {
          definition.index++;
        }
        length = definition.sequence.length;
      } else if (definition.pattern) {
        // Pattern definition, step current bar
        definition.index++;
        length = definition.pattern.length;
      }

      // Check if finished
      if (definition.index >= length) {
        definition.index = 0;          
      } else {
        finished = false;
      }
    });
    return finished;
  }

  function getCurrentBar(node) {
    // Get all definitions whose conditions apply
    var definitions = getValidDefinitions(node.definitions);

    // Go through all definitions and evaluate them
    var patterns = [];
    definitions.forEach(function(definition) {
      if (definition.sequence) {
        // Sequence definition
        var childPatterns = getCurrentBar(definition.sequence[definition.index]);
        childPatterns.forEach(function(p) { patterns.push(p); });
      } else if (definition.pattern) {
        // Pattern definition
        var midiNotes = definition.pattern[definition.index].map(toMidi);
        patterns.push({ instrument: definition.instrument, pattern: midiNotes });
      }
    });

    return patterns;
  }

  function copyState(oldNode, newNode) {
    for (var i = 0; i < oldNode.definitions.length; i++) {
      var oldDefinition = oldNode.definitions[i];
      var newDefinition = newNode.definitions.length > i ? newNode.definitions[i] : undefined;
      if (oldDefinition && newDefinition) {
        newDefinition.index = oldDefinition.index;
        if (oldDefinition.sequence && newDefinition.sequence) {
          var oldCurrent = oldDefinition.sequence[oldDefinition.index];
          var newCurrent = newDefinition.sequence[newDefinition.index];
          copyState(oldCurrent, newCurrent);
        }
      }
    }
  }

  function resetState(node) {
    node.definitions.forEach(function(definition) {
      definition.index = 0;
      if (definition.sequence) {
        definition.sequence.forEach(function(childNode) {
          resetState(childNode);
        });
      }
    });
  }

  function getValidDefinitions(definitions) {
    var validDefinitions = [];
    definitions.forEach(function(definition) {
      var condition = definition.condition;
      if (condition) {
        // Check if condition applies
        var param = self.getParam(condition.param);
        var min = condition.min !== undefined ? condition.min : -Infinity;
        var max = condition.max !== undefined ? condition.max : Infinity;
        if (min <= param && param < max) {
          validDefinitions.push(definition);
        }
      } else {
        // No condition, always valid
        validDefinitions.push(definition);
      }
    });
    return validDefinitions;
  }

  function toMidi(note) {
    var keys;
    switch (note.type) {
      case noteType.NOTE:
        keys = [Polyhymnia.Notes.fromName(note.note, note.octave)];
        break;
      case noteType.CHORD:
        keys = Polyhymnia.Chords.fromName(note.chord, note.note, note.octave);
        break;
      case noteType.DEGREE_NOTE:
        keys = [Polyhymnia.Scales.fromName(self.scale, self.tonic)[note.value - 1]];
        break;
      case noteType.DEGREE_CHORD:
        keys = Polyhymnia.Degrees.fromName(note.value, self.tonic, self.scale);
        break;
      case noteType.DRUM:
        keys = [Polyhymnia.Notes.fromName('C')];
        break;
      case noteType.PAUSE:
        keys = [undefined];
        break;
      default:
        keys = [undefined];
    }

    var velocity;
    if (typeof note.velocity === 'string') {
      velocity = Polyhymnia.Velocities.fromName(note.velocity);
    } else if (note.velocity) {
      velocity = note.velocity;
    } else if (note.value === 'X' || note.value === 'O') {
      velocity = 127; // Hard drum hits
    } else if (note.value === 'x' || note.value === 'o') {
      velocity = 64; // Soft drum hits
    } else {
      velocity = 72; // Default
    }

    var midiNotes = keys.map(function(k) {
      return {
        key:      k,
        velocity: velocity,
        start:    note.start,
        end:      note.end
      };
    });

    if (midiNotes.length == 1) {
      return midiNotes[0];
    } else {
      return midiNotes;
    }
  }

  function getRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
};