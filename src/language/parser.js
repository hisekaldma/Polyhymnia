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
  COMMENT:    'comment',
  ERROR:      'error'
};

Polyhymnia.Symbol = function(type, start, end, message) {
  'use strict';
  this.type    = type;
  this.start   = start;
  this.end     = end;
  this.message = message;
};

Polyhymnia.Error = function(start, end, message) {
  'use strict';
  this.start   = start;
  this.end     = end;
  this.message = message;
};

Polyhymnia.parse = function(tokensToParse, instruments) {
  'use strict';

  var tokenType  = Polyhymnia.tokenType;
  var noteType   = Polyhymnia.noteType;
  var symbolType = Polyhymnia.symbolType;
  var Symbol     = Polyhymnia.Symbol;
  var Error      = Polyhymnia.Error;

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
  

  function createSymbol(type, start, end) {
    start = start || currentToken.start;
    end   = end   || currentToken.end;
    symbols.push(new Symbol(type, start, end, ''));
  }

  function createError(message, start, end) {
    start = start || currentToken.start;
    end   = end   || currentToken.end;

    errors.push(new Error(start, end, message));
    if (start !== undefined && end !== undefined) {
      symbols.push(new Symbol(symbolType.ERROR, start, end, message));
    }
  }

  function nextToken() {
    tokensLeft     = tokens.length > 0;
    currentToken   = tokens.length > 0 ? tokens.shift() : {};
    lookaheadToken = tokens.length > 0 ? tokens[0] : {};

    // Skip over comments
    if (currentToken.type == tokenType.COMMENT) {
      createSymbol(symbolType.COMMENT);
      nextToken();
    }
  }

  function skipEmptyLines() {
    while (currentToken && currentToken.type == tokenType.EOL) {
      nextToken();
    }
  }

  function skipToNextRule() {
    while (!endOfRule() || currentToken.type == tokenType.EOL) {
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

    // Rules can be given a name with =, or they can be anonymous
    if (lookaheadToken && lookaheadToken.type == tokenType.EQUAL) {
      // Named rule
      if (currentToken.type == tokenType.NAME) {
        name = currentToken.value;
        createSymbol(symbolType.NAME);
      } else if (currentToken.type == tokenType.NOTE) {
        // ERROR: Name could be confused with note
        createError(currentToken.str + ' is not a valid name, since it\'s a note');
      } else if (currentToken.type == tokenType.CHORD) {
        // ERROR: Name could be confused with chord
        createError(currentToken.str + ' is not a valid name, since it\'s a chord');
      } else if (currentToken.type == tokenType.DEGREE_CHORD) {
        // ERROR: Name could be confused with degree chord
        createError(currentToken.str + ' is not a valid name, since it\'s a degree chord');
      } else if (currentToken.type == tokenType.DRUM_HIT) {
        // ERROR: Name could be confused with drum hit
        createError(currentToken.str + ' is not a valid name, since it\'s a drum hit');
      } else {
        // ERROR: Expected rule name
        createError(currentToken.str + ' is not a valid name');
      }
      nextToken();

      // Equals
      createSymbol(symbolType.EQUAL);
      nextToken();

      // Optional line break
      if (currentToken.type == tokenType.EOL) {
        nextToken();
      }
    }

    // Definitions
    while (!endOfRule()) {
      definitions.push(parseDefinition());
      nextToken();
    }

    return { name: name, definitions: definitions };
  }

  // (Condition) Instrument: Sequence | Pattern
  function parseDefinition() {
    var condition, instrument;

    // Condition is optional
    if (currentToken.type == tokenType.LEFT_PAREN) {
      condition = parseCondition();
    }

    // Instrument is optional
    if (currentToken.type == tokenType.INSTRUMENT) {
      instrument = parseInstrument();
    }

    // Decide if the definition is a pattern or sequence based on the first token
    switch (currentToken.type) {
      case tokenType.NOTE:
      case tokenType.CHORD:
      case tokenType.DEGREE_NOTE:
      case tokenType.DEGREE_CHORD:
      case tokenType.DRUM_HIT:
      case tokenType.PAUSE:
        var pattern = parsePattern();
        return { condition: condition, instrument: instrument, pattern: pattern };
      case tokenType.NAME:
        var sequence = parseSequence();
        return { condition: condition, instrument: instrument, sequence: sequence };
      default:
        // ERROR: Expected a sequence or pattern
        createError('Expected a sequence or pattern');
        return {};
    }
  }

  // Instrument
  function parseInstrument() {
    var instrument = {
      name:  currentToken.value,
      start: currentToken.start,
      end:   currentToken.end
    };

    createSymbol(symbolType.INSTRUMENT);
    nextToken();

    return instrument;
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
        createSymbol(symbolType.REFERENCE);
      } else {
        // ERROR: Expected rule name
        createError('Expected a rule name');
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

  // Note Note Note Note *
  function parsePattern() {
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

    return bars;
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
        createError('Expected a note, chord, drum hit or pause');
        valid = false;
        note.type = noteType.PAUSE;
    }

    if (valid) {
      createSymbol(symbolType.NOTE);
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
      createError('Expected a condition', start, end);
      return undefined;
    }

    createSymbol(symbolType.CONDITION, start, end);
    return { param: param, min: min, max: max };
  }
};