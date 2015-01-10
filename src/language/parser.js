var Polyhymnia = Polyhymnia || {};

Polyhymnia.noteType = {
  PAUSE: 'pause',
  NOTE:  'note',
  CHORD: 'chord',
  DRUM:  'drum'
};

Polyhymnia.symbolType = {
  NAME:       'name',
  ARROW:      'arrow',
  REFERENCE:  'reference',
  INSTRUMENT: 'instrument',
  NOTE:       'note',
  CONDITION:  'condition'
};

Polyhymnia.parse = function(tokensToParse, instruments) {
  'use strict';

  var tokenType = Polyhymnia.tokenType;
  var noteType = Polyhymnia.noteType;
  var symbolType = Polyhymnia.symbolType;

  var currentToken;
  var lookaheadToken;
  var tokensLeft = true;
  var tokens = tokensToParse.slice(0);
  var rules = [];
  var symbols = [];
  var errors = [];

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

  function symbol(type, start, end) {
    symbols.push({
      type:  type,
      start: start || currentToken.start,
      end:   end   || currentToken.end
    });
  }

  function error(message, start, end) {
    errors.push({
      error: message,
      start: start || currentToken.start,
      end:   end   || currentToken.end
    });
    symbols.push({
      type:  'error',
      error: message,
      start: start || currentToken.start,
      end:   end   || currentToken.end
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
      symbol(symbolType.NAME);
    } else {
      // ERROR: Expected rule name
      error('Rules must start with a name');
    }
    nextToken();

    if (currentToken.type == tokenType.SINGLE_ARROW) {
      symbol(symbolType.ARROW);
    } else {
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

  // (Condition) Sequence | Pattern
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

  // A1 A2 A3 *
  function parseSequence() {
    var sequence = [];
    while (currentToken.type !== tokenType.EOL && tokensLeft) {
      if (currentToken.type == tokenType.NAME) {
        sequence.push(currentToken.value);
        symbol(symbolType.REFERENCE);
      } else {
        // ERROR: Expected rule name
        error('Expected a rule name');
        sequence.push('');
      }
      nextToken();
    }
    return sequence;
  }

  // Instrument: Note Note Note Note *
  function parsePattern() {
    var instrument = currentToken.value;

    // Check that instrument exists
    if (instruments && !instruments[instrument]) {
      error('There is no instrument ' + instrument );
    } else {
      symbol(symbolType.INSTRUMENT);
    }
    nextToken();

    var pattern = [];
    while (currentToken.type !== tokenType.EOL && tokensLeft) {
      pattern.push(parseNote());
    }

    return { instrument: instrument, pattern: pattern };
  }

  // C# | Cm7 | x | _
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
      symbol(symbolType.NOTE);
    }

    nextToken();
    return { type: type, value: value, start: start, end: end };
  }

  // (x > 0) | (0 > x) | (0 > x > 0) | (x < 0) | (0 < x) | (0 < x < 0)
  function parseCondition() {
    var start = currentToken.start;
    var end = currentToken.end;
    var condition = [];
    while (tokensLeft && currentToken.type !== tokenType.EOL) {
      condition.push(currentToken);
      end = currentToken.end;
      if (currentToken.type == tokenType.RIGHT_PAREN) {
        nextToken();
        break;
      }
      nextToken();
    }
    
    var min;
    var max;
    var param;
    if (condition.length == 5 &&
        condition[0].type == tokenType.LEFT_PAREN &&
        condition[1].type == tokenType.NUMBER &&
        condition[2].type == tokenType.GREATER_THAN &&
        condition[3].type == tokenType.PARAM &&
        condition[4].type == tokenType.RIGHT_PAREN) {
      max   = condition[1].value;
      param = condition[3].value;
    }
    else if (condition.length == 5 &&
        condition[0].type == tokenType.LEFT_PAREN &&
        condition[1].type == tokenType.NUMBER &&
        condition[2].type == tokenType.LESS_THAN &&
        condition[3].type == tokenType.PARAM &&
        condition[4].type == tokenType.RIGHT_PAREN) {
      min   = condition[1].value;
      param = condition[3].value;
    }
    else if (condition.length == 5 &&
        condition[0].type == tokenType.LEFT_PAREN &&
        condition[1].type == tokenType.PARAM &&
        condition[2].type == tokenType.GREATER_THAN &&
        condition[3].type == tokenType.NUMBER &&
        condition[4].type == tokenType.RIGHT_PAREN) {
      param = condition[1].value;
      min   = condition[3].value;
    }
    else if (condition.length == 5 &&
        condition[0].type == tokenType.LEFT_PAREN &&
        condition[1].type == tokenType.PARAM &&
        condition[2].type == tokenType.LESS_THAN &&
        condition[3].type == tokenType.NUMBER &&
        condition[4].type == tokenType.RIGHT_PAREN) {
      param = condition[1].value;
      max   = condition[3].value;
    }
    else if (condition.length == 7 &&
        condition[0].type == tokenType.LEFT_PAREN &&
        condition[1].type == tokenType.NUMBER &&
        condition[2].type == tokenType.LESS_THAN &&
        condition[3].type == tokenType.PARAM &&
        condition[4].type == tokenType.LESS_THAN &&
        condition[5].type == tokenType.NUMBER &&
        condition[6].type == tokenType.RIGHT_PAREN) {
      min   = condition[1].value;
      param = condition[3].value;
      max   = condition[5].value;
    }
    else if (condition.length == 7 &&
        condition[0].type == tokenType.LEFT_PAREN &&
        condition[1].type == tokenType.NUMBER &&
        condition[2].type == tokenType.GREATER_THAN &&
        condition[3].type == tokenType.PARAM &&
        condition[4].type == tokenType.GREATER_THAN &&
        condition[5].type == tokenType.NUMBER &&
        condition[6].type == tokenType.RIGHT_PAREN) {
      max   = condition[1].value;
      param = condition[3].value;
      min   = condition[5].value;
    }
    else {
      // ERROR: Expected condition
      error('Expected a condition', start, end);
      return undefined;
    }

    symbol(symbolType.CONDITION, start, end);
    return { param: param, min: min, max: max };
  } 
};