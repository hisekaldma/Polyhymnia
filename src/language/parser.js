var Polyhymnia = Polyhymnia || {};

Polyhymnia.noteType = {
  PAUSE:        'pause',
  NOTE:         'note',
  CHORD:        'chord',
  DEGREE_NOTE:  'degree note',
  DEGREE_CHORD: 'degree chord',
  DRUM:         'drum'
};

Polyhymnia.symbolType = {
  NAME:       'name',
  EQUAL:      'equal',
  REFERENCE:  'reference',
  INSTRUMENT: 'instrument',
  NOTE:       'note',
  CONDITION:  'condition',
  COMMENT:    'comment'
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
    start = start || currentToken.start;
    end   = end   || currentToken.end;

    errors.push({ error: message, start: start, end: end });
    if (start && end) {
      symbols.push({ type: 'error', error: message, start: start, end: end });
    }
  }

  function nextToken() {
    tokensLeft     = tokens.length > 0;
    currentToken   = tokens.length > 0 ? tokens.shift() : {};
    lookaheadToken = tokens.length > 0 ? tokens[0] : {};

    // Skip over comments
    if (currentToken.type == tokenType.COMMENT) {
      symbols.push({
        type:  'comment',
        start: currentToken.start,
        end:   currentToken.end
      });
      nextToken();
    }
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
    } else if (currentToken.type == tokenType.NAME && lookaheadToken && lookaheadToken.type == tokenType.EQUAL) {
      return true;
    } else {
      return false;
    }
  }

  // Name = Definitions
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

    if (currentToken.type == tokenType.EQUAL) {
      symbol(symbolType.EQUAL);
    } else {
      // ERROR: Expected =
      error('Expected =');
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
        sequence.push({
          name:  currentToken.value,
          start: currentToken.start,
          end:   currentToken.end
        });
        symbol(symbolType.REFERENCE);
      } else {
        // ERROR: Expected rule name
        error('Expected a rule name');
        sequence.push({
          name:  '',
          start: currentToken.start,
          end:   currentToken.end
        });
      }
      nextToken();
    }
    return sequence;
  }

  // Instrument: Note Note Note Note *
  function parsePattern() {
    var instrument = {
      name:  currentToken.value,
      start: currentToken.start,
      end:   currentToken.end
    };

    symbol(symbolType.INSTRUMENT);
    nextToken();

    var bar = [];
    var bars = [bar];
    while (currentToken.type !== tokenType.EOL && tokensLeft) {
      if (currentToken.type == tokenType.BAR) {
        // New bar
        bar = [];
        bars.push(bar);
        nextToken();
      } else {
        bar.push(parseNote());
      }
    }

    return { instrument: instrument, pattern: bars };
  }

  // C# | Cm7 | x | _
  function parseNote() {
    var note = {
      start: currentToken.start,
      end:   currentToken.end
    };
    var valid = true;

    switch (currentToken.type) {
      case tokenType.NOTE:
        note.type = noteType.NOTE;
        note.note = currentToken.note;
        note.octave = currentToken.octave;
        note.velocity = currentToken.velocity;
        break;
      case tokenType.CHORD:
        note.type = noteType.CHORD;
        note.note = currentToken.note;
        note.octave = currentToken.octave;
        note.chord = currentToken.chord;
        note.velocity = currentToken.velocity;
        break;
      case tokenType.DEGREE_NOTE:
        note.type = noteType.DEGREE_NOTE;
        note.value = currentToken.value;
        note.velocity = currentToken.velocity;
        break;
      case tokenType.DEGREE_CHORD:
        note.type = noteType.DEGREE_CHORD;
        note.value = currentToken.value;
        note.velocity = currentToken.velocity;
        break;
      case tokenType.DRUM_HIT:
        note.type = noteType.DRUM;
        note.value = currentToken.value;
        note.velocity = currentToken.velocity;
        break;
      case tokenType.PAUSE:
        note.type = noteType.PAUSE;
        break;
      default:
        // ERROR: Expected note, chord, drum hit or pause
        error('Expected a note, chord, drum hit or pause');
        valid = false;
        note.type = noteType.PAUSE;
    }

    if (valid) {
      symbol(symbolType.NOTE);
    }

    nextToken();
    return note;
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