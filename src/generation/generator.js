var Polyhymnia = Polyhymnia || {};

Polyhymnia.Generator = function() {
  'use strict';
  var ruleType = Polyhymnia.ruleType;
  var self = this;

  this.instruments = {};

  var startRule = 'Play';
  var params = {};
  var ruleDictionary = null;
  var current = null;
  var parents = [];

  this.setParam = function(name, value) {
    params[name] = value;
  };

  this.getParam = function(name) {
    return params[name] || 0.0;
  };

  this.getNextRule = function() {
    if (!ruleDictionary) {
      return;
    }
    return step();
  };

  this.setRules = function(rules) {
    // Check that there are rules
    if (!rules || rules.length === 0) {
      throw new Error('No rules to play');
    } else {
      // Check that the start rule exists
      var hasStart = false;
      for (var i = 0; i < rules.length; i++) {
        if (rules[i].name == startRule)
          hasStart = true;
      }
      if (!hasStart)
        throw new Error('There is no rule named \'' + startRule + '\'');

      // Check that all instruments exist
      for (var r = 0; r < rules.length; r++) {
        for (var d = 0; d < rules[r].definitions.length; d++) {
          var instrument = rules[r].definitions[d].instrument;
          if (instrument && !self.instruments[instrument]) {
            throw new Error('There is no instrument named \'' + instrument + '\'');
          }
        }
      }
    }

    // Prepare for playing
    ruleDictionary = {};
    for (var j = 0; j < rules.length; j++) {
      ruleDictionary[rules[j].name] = rules[j];
    }
    current = {
      sequence: [startRule],
      index: -1
    };
  };

  function step() {
    current.index++;
    if (current.index < current.sequence.length) {
      // Still in sequence, evaluate the current rule
      var rule = ruleDictionary[current.sequence[current.index]];
      return evaluateRule(rule);
    } else {
      // We've reached the end of the sequence, go back up and step forward
      if (parents.length > 0) {
        current = parents.pop();
        return step();
      }
    }
  }

  function evaluateRule(rule) {
    var validDefinitions = getValidDefinitions(rule.definitions);

    if (rule.type == ruleType.SEQUENCE) {
      // Sequence rule, prepare for evaluating it
      if (current) {
        parents.push(current);
      }

      // Choose a sequence whose condition applies
      var randomDefinition = getRandom(validDefinitions);
      current = {
        sequence: randomDefinition.sequence,
        index: 0
      };

      // Evaluate the first child
      var child = ruleDictionary[current.sequence[current.index]];
      return evaluateRule(child);
    } else if (rule.type == ruleType.PATTERN) {
      // Pattern rule, get all patterns whose conditions apply
      var patterns = [];
      validDefinitions.forEach(function(definition) {
        patterns.push({ instrument: definition.instrument, pattern: definition.pattern });
      });
      return {
        name: rule.name,
        patterns: patterns
      };
    }
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

  function getRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
};