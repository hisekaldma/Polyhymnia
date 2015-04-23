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
  var index = 0;

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
    index++;
    step(ruleTree);
  };

  this.reset = function() {
    resetState(ruleTree);
  };

  this.setRules = function(rules) {
    var oldRuleTree = ruleTree;
    ruleDictionary = {};

    // Build the tree that will be evaluated each bar
    if (rules.length > 1) {
      rules.forEach(function(rule) {
        ruleDictionary[rule.name] = rule;
      });

      // If we have more than one rule, find the starting point
      ruleTree = buildTree(ruleDictionary[startRule]);      
    } else {
      // Otherwise, just start with the only rule
      ruleTree = buildTree(rules[0]);
    }

    // Fast-forward to where we were to allow hot-swapping the rules while playing
    index = index % ruleTree.length;
    for (var i = 0; i < index; i++) {
      step(ruleTree);
    }
  };

  function buildTree(rule) {
    // If we can't find the rule, return an empty node, so we can keep playing
    if (!rule) {
      return { name: '', definitions: [], length: 0 };
    }

    var node = { name: rule.name, definitions: [] };

    rule.definitions.forEach(function(definition) {
      var length = 0;
      if (definition.sequence) {
        // Sequence definition, find its children recursively
        var children = [];
        definition.sequence.forEach(function(reference) {
          var child;
          if (reference.invalid) {
            child = buildTree();
          } else {
            var rule = ruleDictionary[reference.name];
            child = buildTree(rule);
          }
          child.start = reference.start;
          child.end   = reference.end;
          children.push(child);
        });

        // Calculate the length of the sequence
        length = children.reduce(function(sum, child) {
          return sum + child.length;
        }, 0);
        node.definitions.push({ condition: definition.condition, instrument: definition.instrument, sequence: children, index: 0, length: length });
      } else if (definition.pattern) {
        // Pattern definition, just add it
        length = definition.pattern.length;
        node.definitions.push({ condition: definition.condition, instrument: definition.instrument, pattern: definition.pattern, index: 0, length: length });
      }
    });

    // Calculate the length of the rule
    node.length = node.definitions.reduce(function(longest, definition) {
      return longest > definition.length ? longest : definition.length;
    }, 0);

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

  function getCurrentBar(node, instrument) {
    // Get all definitions whose conditions apply
    var definitions = getValidDefinitions(node.definitions);

    // Go through all definitions and evaluate them
    var references = [];
    var patterns  = [];
    definitions.forEach(function(definition) {
      var inst;
      // Instruments are overriden by parent instruments
      if (instrument) {
        inst = instrument;
      } else if (definition.instrument) {
        inst = definition.instrument.name;
      }

      if (definition.sequence) {
        // Sequence definition
        references.push({
          name:  definition.sequence[definition.index].name,
          start: definition.sequence[definition.index].start,
          end:   definition.sequence[definition.index].end
        });
        var child = getCurrentBar(definition.sequence[definition.index], inst);
        child.references.forEach(function(p) { references.push(p); });
        child.patterns.forEach(function(p) { patterns.push(p); });
      } else if (definition.pattern) {
        // Pattern definition
        var midiNotes = definition.pattern[definition.index].map(toMidi);
        patterns.push({ instrument: inst, pattern: midiNotes });
      }
    });

    return { references: references, patterns: patterns };
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
};