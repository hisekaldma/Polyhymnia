var Polyhymnia = Polyhymnia || {};

Polyhymnia.validate = function(rules, instruments) {
  'use strict';

  var noteType = Polyhymnia.noteType;
  var symbolType = Polyhymnia.symbolType;

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

  function symbol(type, start, end) {
    rules.symbols.push({
      type:  type,
      start: start,
      end:   end
    });
  }

  function error(message, start, end) {
    // Remove symbols within error
    rules.symbols = rules.symbols.filter(function(symbol) {
      return !(symbol.start >= start && symbol.end <= end);
    });

    // Add error
    rules.errors.push({ error: message, start: start, end: end });    
    rules.symbols.push({ type: 'error', error: message, start: start, end: end });
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
        error('There is no instrument ' + instrument.name, instrument.start, instrument.end);
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
          error(reference.name + ' cannot reference itself', reference.start, reference.end);
          reference.invalid = true;
        } else {
          validateRule(childRule, path + '/' + reference.name);
        }
      } else {
        error('There is no rule ' + reference.name, reference.start, reference.end);
        reference.invalid = true;
      }
    }
  }  
};