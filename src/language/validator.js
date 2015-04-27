var Polyhymnia = Polyhymnia || {};

Polyhymnia.validate = function(rules, instruments) {
  'use strict';

  var noteType   = Polyhymnia.noteType;
  var symbolType = Polyhymnia.symbolType;
  var Symbol     = Polyhymnia.Symbol;
  var Error      = Polyhymnia.Error;

  // Prepare for validation
  var ruleDict = {};
  rules.forEach(function(rule) {
    ruleDict[rule.name] = rule;
  });

  // Validate rules
  rules.forEach(function(rule) {
    validateRule(rule, rule.name);
  });

  // Sort symbols
  rules.symbols = rules.symbols.sort(function(a, b) {
    return a.start - b.start;
  });

  return rules;

  function createError(message, start, end) {
    // Remove symbols within error
    rules.symbols = rules.symbols.filter(function(symbol) {
      return !(symbol.start >= start && symbol.end <= end);
    });

    // Add error
    rules.errors.push(new Error(start, end, message));
    rules.symbols.push(new Symbol(symbolType.ERROR, start, end, message));
  }

  function validateRule(rule, path) {
    rule.definitions.forEach(function(definition) {
      if (definition.sequence) {
        // Check that references are valid
        definition.sequence.forEach(function(reference) {
          validateReference(reference, path);
        });
      } else if (definition.instrument) {
        // Check that the instrument is valid
        validateInstrument(definition.instrument);
      }
    });
  }

  function validateInstrument(instrument) {
    if (!instrument.invalid) {
      // Check that instrument exists
      if (instruments && !instruments[instrument.name]) {
        createError('There is no instrument called ' + instrument.name, instrument.start, instrument.end);
        instrument.invalid = true;
      }
    }
  }

  function validateReference(reference, path) {
    if (!reference.invalid) {
      // Check that reference exists
      var childRule = ruleDict[reference.name];
      if (childRule) {
        // Check that reference isn't circular
        if (path.indexOf(reference.name) !== -1) {
          createError(reference.name + ' cannot reference itself', reference.start, reference.end);
          reference.invalid = true;
        } else {
          validateRule(childRule, path + '/' + reference.name);
        }
      } else {
        createError('There is no rule called ' + reference.name, reference.start, reference.end);
        reference.invalid = true;
      }
    }
  }  
};