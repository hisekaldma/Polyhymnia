var Polyhymnia = Polyhymnia || {};

Polyhymnia.noteType = {
  PAUSE:          'pause',
  NOTE:           'note',
  CHORD:          'chord',
  DRUM:           'drum'
};

Polyhymnia.parse = function(tokensToParse) {
  'use strict';

  var tokenType = Polyhymnia.tokenType;
  var noteType = Polyhymnia.noteType;

  var currentToken;
  var lookaheadToken;
  var tokensLeft = true;
  var tokens = tokensToParse.slice(0);
  var rules = [];
  var symbols = [];
  var errors = [];

  function error(message) {
    errors.push({
      error: message,
      start: currentToken.start,
      end:   currentToken.end
    });
    symbols.push({
      type:  'error',
      error: message,
      start: currentToken.start,
      end:   currentToken.end
    });
  }  

  function nextToken() {
    tokensLeft     = tokens.length > 0;
    currentToken   = tokens.length > 0 ? tokens.shift() : {};
    lookaheadToken = tokens.length > 0 ? tokens[0] : {};
  }

  function skipEmptyLines() {
    while (currentToken && currentToken.type == tokenType.EOL) {
      nextToken();
    }
  }

  function endOfRule() {
    if (!tokensLeft) {
      return true;
    } else if (currentToken.type == tokenType.EOL) {
      return true;
    } else if (currentToken.type == tokenType.NAME && lookaheadToken && lookaheadToken.type == tokenType.SINGLE_ARROW) {
      return true;
    } else {
      return false;
    }
  }

  // Name -> Definitions
  function parseRule() {
    var name = '';
    var definitions = [];

    if (currentToken.type == tokenType.NAME) {
      name = currentToken.value;
    } else {
      // ERROR: Expected rule name
      error('Rules must start with a name');
    }
    nextToken();

    if (currentToken.type !== tokenType.SINGLE_ARROW) {
      // ERROR: Expected ->
      error('Expected ->');
    }
    nextToken();

    if (currentToken.type == tokenType.EOL) {
      nextToken();
    }

    while (!endOfRule()) {
      definitions.push(parseDefinition());
      nextToken();
    }

    return { name: name, definitions: definitions };
  }

  // (Condition) Definition
  function parseDefinition() {
    var condition;

    if (currentToken.type == tokenType.LEFT_PAREN) {
      condition = parseCondition();
    }

    if (currentToken.type == tokenType.INSTRUMENT) {
      var pattern = parsePattern();
      return { condition: condition, instrument: pattern.instrument, pattern: pattern.pattern };
    } else if (currentToken.type == tokenType.NAME) {
      var sequence = parseSequence();
      return { condition: condition, sequence: sequence };
    } else {
      // ERROR: Expected a sequence or pattern
      error('Expected a sequence or pattern');
      return {};
    }
  }

  // Sequence
  function parseSequence() {
    var sequence = [];
    while (currentToken.type !== tokenType.EOL && tokensLeft) {
      if (currentToken.type == tokenType.NAME) {
        sequence.push(currentToken.value);
      } else {
        // ERROR: Expected rule name
        error('Expected a rule name');
        sequence.push('');
      }
      nextToken();
    }
    return sequence;
  }

  // Instrument: Pattern
  function parsePattern() {
    var instrument = currentToken.value;
    nextToken();

    var pattern = [];
    while (currentToken.type !== tokenType.EOL && tokensLeft) {
      pattern.push(parseNote());
    }

    return { instrument: instrument, pattern: pattern };
  }

  function parseNote() {
    var type;
    var value = '';
    var start = currentToken.start;
    var end = currentToken.end;
    var valid = true;

    if (currentToken.type == tokenType.NOTE) {
      type = noteType.NOTE;
      value = currentToken.value;
    } else if (currentToken.type == tokenType.CHORD) {
      type = noteType.CHORD;
      value = currentToken.value;
    } else if (currentToken.type == tokenType.DRUM_TRIGGER) {
      type = noteType.DRUM;
      value = currentToken.value;
    } else if (currentToken.type == tokenType.PAUSE) {
      type = noteType.PAUSE;
    } else {
      // ERROR: Expected note, chord, drum symbol or pause
      error('Expected a note, chord, drum symbol or pause');
      valid = false;
      type = noteType.PAUSE;
    }

    if (valid) {
      symbols.push({ type: 'note', start: start, end: end });
    }

    nextToken();
    return { type: type, value: value, start: start, end: end };
  }

  function parseCondition() {
    if (currentToken.type == tokenType.LEFT_PAREN) {
      nextToken();
    } else {
      // ERROR: Expected (
      error('Expected (');
    }
    
    var min;
    var max;
    var param;
    if (currentToken.type == tokenType.PARAM) {
      param = currentToken.value;
      nextToken();
      if (currentToken.type == tokenType.GREATER_THAN) {
        nextToken();
        if (currentToken.type == tokenType.NUMBER) {
          min = currentToken.value;
          nextToken();
        } else {
          // ERROR: Expected number
          error('Expected a number');
          return undefined;
        }
      } else if (currentToken.type == tokenType.LESS_THAN) {
        nextToken();
        if (currentToken.type == tokenType.NUMBER) {
          max = currentToken.value;
          nextToken();
        } else {
          // ERROR: Expected number
          error('Expected a number');
          return undefined;
        }
      } else {
        // ERROR: Expected < or >
        error('Expected < or >');
        return undefined;
      }
    } else if (currentToken.type == tokenType.NUMBER) {
      var number = currentToken.value;
      nextToken();
      if (currentToken.type == tokenType.GREATER_THAN) {
        max = number;
        nextToken();
        if (currentToken.type == tokenType.PARAM) {
          param = currentToken.value;
          nextToken();
          if (currentToken.type == tokenType.GREATER_THAN) {
            
            nextToken();
            if (currentToken.type == tokenType.NUMBER) {
              min = currentToken.value;
              nextToken();
            } else {
              // ERROR: Expected number
              error('Expected a number');
              return undefined;
            }
          }
        } else {
          // ERROR: Expected parameter
          error('Expected a parameter');
          return undefined;
        }
      } else if (currentToken.type == tokenType.LESS_THAN) {
        min = number;
        nextToken();
        if (currentToken.type == tokenType.PARAM) {
          param = currentToken.value;
          nextToken();
          if (currentToken.type == tokenType.LESS_THAN) {

            nextToken();
            if (currentToken.type == tokenType.NUMBER) {
              max = currentToken.value;
              nextToken();
            } else {
              // ERROR: Expected number
              error('Expected a number');
              return undefined;
            }
          }
        } else {
          // ERROR: Expected parameter
          error('Expected a parameter');
          return undefined;
        }
      } else {
        // ERROR: Expected < or >
        error('Expected < or >');
        return undefined;
      }
    } else {
      // ERROR: Expected number or parameter
      error('Expected a parameter or number');
      return undefined;
    }
    
    if (currentToken.type == tokenType.RIGHT_PAREN) {
      nextToken();
    } else {
      // ERROR: Expected )
      error('Expected )');
      return undefined;
    }

    return { param: param, min: min, max: max };
  }

  // Parse
  nextToken();
  skipEmptyLines();
  while (tokensLeft) {
    rules.push(parseRule());
    skipEmptyLines();
  }

  // Check that all rule references have definitions
  rules.forEach(function(rule) {
    rule.definitions.forEach(function(definition) {
      if (definition.sequence) {
        definition.sequence.forEach(function(name) {
          var found = false;
          for (var i = 0; i < rules.length; i++) {
            if (rules[i].name == name) {
              found = true;
            }
          }
          if (!found) {
            errors.push({ error: 'There is no rule ' + name });
          }
        });
      }
    });
  });

  rules.symbols = symbols;
  rules.errors = errors;
  return rules;  
};