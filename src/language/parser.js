var Polyhymnia = Polyhymnia || {};

Polyhymnia.ruleType = {
  SEQUENCE:       'sequence',
  PATTERN:        'pattern'
};

Polyhymnia.noteType = {
  PAUSE:          'pause',
  NOTE:           'note',
  CHORD:          'chord',
  DRUM:           'drum'
};

Polyhymnia.parse = function(tokensToParse) {
  'use strict';

  var tokenType = Polyhymnia.tokenType;
  var ruleType = Polyhymnia.ruleType;
  var noteType = Polyhymnia.noteType;

  var currentToken;
  var tokens = tokensToParse.slice(0);
  var rules = [];

  function exception(message) {
    var error = new Error(message);
    error.start = currentToken ? currentToken.start : 0;
    error.end = currentToken ? currentToken.end : 0;
    return error;
  }

  function nextToken() {
    currentToken = tokens.length > 0 ? tokens.shift() : undefined;
  }

  function skipEmptyLines() {
    while (currentToken && currentToken.type == tokenType.EOL) {
      nextToken();
    }
  }

  // Name -> Definitions | Name => Definitions
  function parseRule() {
    var name = '';
    if (currentToken.type == tokenType.NAME) {
      name = currentToken.value;
    } else {
      // ERROR: Expected rule name
      throw exception('Rules must start with a name');
    }
    nextToken(); // Name

    var type;
    if (currentToken && currentToken.type == tokenType.SINGLE_ARROW) {
      type = ruleType.SEQUENCE;
    } else if (currentToken && currentToken.type == tokenType.DOUBLE_ARROW) {
      type = ruleType.PATTERN;
    } else {
      // ERROR: Expected -> or =>
      throw exception('Expected -> or =>');
    }
    nextToken(); // -> =>

    var definitions = [];
    do {
      if (currentToken && currentToken.type == tokenType.EOL) {
        nextToken();
        if (currentToken && currentToken.type == tokenType.EOL) {
          nextToken();
          break;
        }
      }

      var definition;
      if (type == ruleType.SEQUENCE) {
        definition = parseSequenceDefinition();
      } else if (type == ruleType.PATTERN) {
        definition = parsePatternDefinition();
      }
      definitions.push(definition);
    } while (currentToken);

    return { type: type, name: name, definitions: definitions };
  }

  // (Condition) Sequence
  function parseSequenceDefinition() {
    if (currentToken === undefined) {
      throw exception('Expected a sequence');
    }

    var condition;
    if (currentToken.type == tokenType.LEFT_PAREN) {
      condition = parseCondition();
    }

    var sequence = [];
    while (currentToken && currentToken.type !== tokenType.EOL) {
      if (currentToken.type == tokenType.NAME) {
        sequence.push(currentToken.value);
      } else {
        // ERROR: Expected rule name
        throw exception('Expected a rule name');
      }
      nextToken();
    }

    return { condition: condition, sequence: sequence };
  }

  // (Condition) Instrument: Pattern
  function parsePatternDefinition() {
    if (currentToken === undefined) {
      throw exception('Expected a pattern');
    }

    var condition;
    if (currentToken.type == tokenType.LEFT_PAREN) {
      condition = parseCondition();
    }

    var instrument;
    if (currentToken && currentToken.type == tokenType.INSTRUMENT) {
      instrument = currentToken.value;
      nextToken();
    } else {
      // ERROR: Expected instrument
      throw exception('Expected an instrument name');
    }

    var pattern = [];
    while (currentToken && currentToken.type !== tokenType.EOL) {
      pattern.push(parseNote());
    }

    return { condition: condition, instrument: instrument, pattern: pattern };
  }

  function parseNote() {
    var type;
    var value = '';
    var start = currentToken.start;
    var end = currentToken.end;

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
      throw exception('Expected a note, chord, drum symbol or pause');
    }

    nextToken();
    return { type: type, value: value, start: start, end: end };
  }

  function parseCondition() {
    if (currentToken.type == tokenType.LEFT_PAREN) {
      nextToken();
    } else {
      // ERROR: Expected (
      throw exception('Expected (');
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
          throw exception('Expected a number');
        }
      } else if (currentToken.type == tokenType.LESS_THAN) {
        nextToken();
        if (currentToken.type == tokenType.NUMBER) {
          max = currentToken.value;
          nextToken();
        } else {
          // ERROR: Expected number
          throw exception('Expected a number');
        }
      } else {
        // ERROR: Expected < or >
        throw exception('Expected < or >');
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
              throw exception('Expected a number');
            }
          }
        } else {
          // ERROR: Expected parameter
          throw exception('Expected a parameter');
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
              throw exception('Expected a number');
            }
          }
        } else {
          // ERROR: Expected parameter
          throw exception('Expected a parameter');
        }
      } else {
        // ERROR: Expected < or >
        throw exception('Expected < or >');
      }
    } else {
      // ERROR: Expected number or parameter
      throw exception('Expected a parameter or number');
    }
    
    if (currentToken.type == tokenType.RIGHT_PAREN) {
      nextToken();
    } else {
      // ERROR: Expected )
      throw exception('Expected )');
    }

    return { param: param, min: min, max: max };
  }


  // Parse
  nextToken();
  skipEmptyLines();
  while (currentToken) {
    rules.push(parseRule());
    skipEmptyLines();
  }


  // Check that all rule references have definitions
  for (var r = 0; r < rules.length; r++) {
    var rule = rules[r];
    if (rule.type == ruleType.SEQUENCE) {
      for (var d = 0; d < rule.definitions.length; d++) {
        var sequence = rule.definitions[d].sequence;
        for (var s = 0; s < sequence.length; s++) {
          var name = sequence[s];
          var found = false;
          for (var i = 0; i < rules.length; i++) {
            if (rules[i].name == name) {
              found = true;
            }
          }
          if (!found) {
            throw new Error('There is no rule ' + name);
          }
        }
      }
    }
  }

  return rules;
};