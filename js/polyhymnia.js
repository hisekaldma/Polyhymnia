/*!
 * Polyhymnia v0.3.0 (https://polyhymnia.io)
 *
 * Copyright (c) 2014-2015 Jonathan Hise Kaldma
 * Released under the MIT license
 */
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
    if (start !== undefined && end !== undefined) {
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
        symbol(symbolType.NAME);
      } else if (currentToken.type == tokenType.NOTE) {
        // ERROR: Name could be confused with note
        error(currentToken.str + ' is not a valid name, since it\'s a note');
      } else if (currentToken.type == tokenType.CHORD) {
        // ERROR: Name could be confused with chord
        error(currentToken.str + ' is not a valid name, since it\'s a chord');
      } else if (currentToken.type == tokenType.DEGREE_CHORD) {
        // ERROR: Name could be confused with degree chord
        error(currentToken.str + ' is not a valid name, since it\'s a degree chord');
      } else if (currentToken.type == tokenType.DRUM_HIT) {
        // ERROR: Name could be confused with drum hit
        error(currentToken.str + ' is not a valid name, since it\'s a drum hit');
      } else {
        // ERROR: Expected rule name
        error(currentToken.str + ' is not a valid name');
      }
      nextToken();

      // Equals
      symbol(symbolType.EQUAL);
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
        error('Expected a sequence or pattern');
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

    symbol(symbolType.INSTRUMENT);
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
var Polyhymnia = Polyhymnia || {};

Polyhymnia.tokenType = {
  NAME:           'name',
  NUMBER:         'number',
  INSTRUMENT:     'instrument',
  PAUSE:          'pause',
  NOTE:           'note',
  CHORD:          'chord',
  DEGREE_NOTE:    'degree note',
  DEGREE_CHORD:   'degree chord',
  DRUM_HIT:       'drum hit',
  BAR:            'bar',
  EQUAL:          'equal',
  LEFT_PAREN:     'left paren',
  RIGHT_PAREN:    'right paren',
  PARAM:          'param',
  LESS_THAN:      'less than',
  GREATER_THAN:   'greater than',
  COMMENT:        'comment',
  ERROR:          'error',
  EOL:            'eol'
};

Polyhymnia.tokenize = function(textToTokenize) {
  'use strict';

  var tokenType = Polyhymnia.tokenType;

  var NAME_PATTERN         = '[A-Z][a-zA-Z0-9_]*';
  var PARAM_PATTERN        = '[a-z][a-zA-Z0-9_]*';
  var INSTRUMENT_PATTERN   = NAME_PATTERN + ':';
  var NUMBER_PATTERN       = '-?(([1-9][0-9]*)|0)(\\.[0-9]*)?';
  var OCTAVE_PATTERN       = '(-2|-1|[0-8])?';
  var NOTE_PATTERN         = '([CDEFGAB][#b]?)' + OCTAVE_PATTERN;
  var CHORD_PATTERN        = NOTE_PATTERN + '((?:M|m|dom|aug|dim)7?)';
  var DEGREE_NOTE_PATTERN  = '([1-7])';
  var DEGREE_CHORD_PATTERN = '((?:(?:I|II|III|IV|V|VI|VII)\\+?|(?:i|ii|iii|iv|v|vi|vii)°?)7?)';
  var DRUM_PATTERN         = '([xXoO])';
  var VELOCITY_PATTERN     = '(\\.(?:(?:ppp|fff|pp|ff|mp|mf|p|f)|(?:12[0-7]|1[0-1][0-9]|[1-9][0-9]|[0-9])))?';

  var NEWLINE    = '\n';
  var SPACE      = ' ';
  var TAB        = '\t';
  var DELIMITERS = '()\n\t ';
  var COMMENT    = '*';

  var CTX_DEFAULT   = 'default';
  var CTX_CONDITION = 'condition';

  var namePattern           = new RegExp('^' + NAME_PATTERN +                            '$');
  var paramPattern          = new RegExp('^' + PARAM_PATTERN +                           '$');
  var instrumentPattern     = new RegExp('^' + INSTRUMENT_PATTERN +                      '$');
  var numberPattern         = new RegExp('^' + NUMBER_PATTERN +                          '$');
  var notePattern           = new RegExp('^' + NOTE_PATTERN +         VELOCITY_PATTERN + '$');
  var chordPattern          = new RegExp('^' + CHORD_PATTERN +        VELOCITY_PATTERN + '$');
  var degreeNotePattern     = new RegExp('^' + DEGREE_NOTE_PATTERN +  VELOCITY_PATTERN + '$');
  var degreeChordPattern    = new RegExp('^' + DEGREE_CHORD_PATTERN + VELOCITY_PATTERN + '$');
  var drumPattern           = new RegExp('^' + DRUM_PATTERN +         VELOCITY_PATTERN + '$');

  var text = textToTokenize.replace('\r', ''); // Handle weird Windows newlines
  var characters = text.split('');
  var tokens = [];
  var line = 1;
  var position = -1;
  var index = -1;
  var moreToRead;
  var currentChar;

  function nextChar() {
    index++;
    moreToRead = index < characters.length;
    if (moreToRead) {
      currentChar = characters[index];
      position++;
    }
  }

  function readText() {
    var s = '';
    while (moreToRead) {
      if (DELIMITERS.indexOf(currentChar) !== -1) {
        break;
      } else {
        s += currentChar;
        nextChar();
      }
    }
    return s;
  }

  function getOctave(octave) {
    return octave ? parseInt(octave) : undefined;
  }

  function getVelocity(velocity) {
    if (velocity) {
      var v = velocity.substr(1);
      var n = parseInt(v);
      return isNaN(n) ? v : n;
    }
    return undefined;
  }


  // Start tokenizing

  nextChar();

  var token;
  var lineBeforeReading;
  var positionBeforeReading;
  var context = CTX_DEFAULT;
  var str;
  var matches, octave, velocity;

  while (moreToRead) {
    str = undefined;
    token = undefined;
    lineBeforeReading = line;
    positionBeforeReading = position;
    
    if (currentChar == NEWLINE) {
      line++;
      token = { type: tokenType.EOL };
      context = CTX_DEFAULT;
      nextChar();
    } else if (currentChar == SPACE || currentChar == TAB) {
      nextChar();
    } else if (currentChar == '(') {
      token = { type: tokenType.LEFT_PAREN, str: '(' };
      context = CTX_CONDITION;
      nextChar();
    } else if (currentChar == ')') {
      token = { type: tokenType.RIGHT_PAREN, str: ')' };
      context = CTX_DEFAULT;
      nextChar();
    } else if (currentChar == COMMENT) {
        // Comment
        str = '';
        while (moreToRead && currentChar !== NEWLINE) {
          str += currentChar;
          nextChar();
        }
        token = { type: tokenType.COMMENT, value: str, str: str };
    } else {
      str = readText();
      if (context == CTX_CONDITION) {
        // Inside a condition
        if (str == '>') {
          token = { type: tokenType.GREATER_THAN, str: str };
        } else if (str == '<') {
          token = { type: tokenType.LESS_THAN, str: str };
        } else if (str.search(paramPattern) !== -1) {
          token = { type: tokenType.PARAM, value: str, str: str };
        } else if (str.search(numberPattern) !== -1) {
          token = { type: tokenType.NUMBER, value: parseFloat(str), str: str };
        } else {
          token = { type: tokenType.ERROR, value: str, str: str };
        }
      } else {
        // Not inside a condition
        if (str == '=') {
          token = { type: tokenType.EQUAL, str: str };
        } else if (str == '_') {
          token = { type: tokenType.PAUSE, str: str };
        } else if (str == '|') {
          token = { type: tokenType.BAR, str: str };
        }

        // Pattern steps have higher precedence
        else if (str.search(drumPattern) !== -1) {
          matches = str.match(drumPattern);
          velocity = getVelocity(matches[2]);
          token = { type: tokenType.DRUM_HIT, value: matches[1], velocity: velocity, str: str };
        } else if (str.search(notePattern) !== -1) {
          matches = str.match(notePattern);
          octave = getOctave(matches[2]);
          velocity = getVelocity(matches[3]);
          token = { type: tokenType.NOTE, note: matches[1], octave: octave, velocity: velocity, str: str };
        } else if (str.search(chordPattern) !== -1) {
          matches = str.match(chordPattern);
          octave = getOctave(matches[2]);
          velocity = getVelocity(matches[4]);
          token = { type: tokenType.CHORD, note: matches[1], octave: octave, chord: matches[3], velocity: velocity, str: str };
        } else if (str.search(degreeNotePattern) !== -1) {
          matches = str.match(degreeNotePattern);
          velocity = getVelocity(matches[2]);
          token = { type: tokenType.DEGREE_NOTE, value: matches[1], velocity: velocity, str: str };
        } else if (str.search(degreeChordPattern) !== -1) {
          matches = str.match(degreeChordPattern);
          velocity = getVelocity(matches[2]);
          token = { type: tokenType.DEGREE_CHORD, value: matches[1], velocity: velocity, str: str };
        } 

        // Names have lower precedence
        else if (str.search(namePattern) !== -1) {
          token = { type: tokenType.NAME, value: str };
        } else if (str.search(instrumentPattern) !== -1) {
          token = { type: tokenType.INSTRUMENT, value: str.substr(0, str.length - 1), str: str };
        } else {
          token = { type: tokenType.ERROR, value: str, str: str };
        }
      }
    }

    if (token !== undefined) {
      token.line = lineBeforeReading;
      token.start = positionBeforeReading;
      token.end = str ? positionBeforeReading + str.length : positionBeforeReading + 1;
      tokens.push(token);
    }
  }
  
  return tokens;
};
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
        error('There is no instrument called ' + instrument.name, instrument.start, instrument.end);
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
        error('There is no rule called ' + reference.name, reference.start, reference.end);
        reference.invalid = true;
      }
    }
  }  
};
var Polyhymnia = Polyhymnia || {};

Polyhymnia.Chords = (function() {
  'use strict';
  var self = {};

  var chords = {
    'M':      [0, 4, 7],
    'm':      [0, 3, 7],
    'M7':     [0, 4, 7, 11],
    'm7':     [0, 3, 7, 10],
    'dom7':   [0, 4, 7, 10],
    'aug':    [0, 4, 8],
    'aug7':   [0, 4, 8, 10],
    'dim':    [0, 3, 6],
    'dim7':   [0, 3, 6, 9]
  };

  // Gets the name of a chord
  self.toName = function(numbers) {
    numbers.forEach(function(value, i) {
      numbers[i] = value % 12;
    });

    for (var name in chords) {
      var chord = chords[name];
      if (chord.length == numbers.length) {
        var correct = true;
        for (var i = 0; i < chord.length; i++) {
          if (chord[i] != numbers[i]) {
            correct = false;
          }
        }
        if (correct) {
          return name;
        }
      }
    }
    return '';
  };

  // Gets the midi note numbers of a chord
  self.fromName = function(name, root, octave) {
    if (!root)
      root = 0; // If no root is provided, just use relative note numbers
    else
      root = Polyhymnia.Notes.fromName(root, octave);

    if (name in chords) {
      return chords[name].map(function(n) {
        return n + root;
      });
    } else {
      return [];
    }
  };

  return self;
})();
var Polyhymnia = Polyhymnia || {};

Polyhymnia.Degrees = (function() {
  'use strict';
  var self = {};

  var degrees = [
    'i',
    'ii',
    'iii',
    'iv',
    'v',
    'vi',
    'vii'
  ];

  var chords = {
    'maj':    [0, 4, 7],
    'min':    [0, 3, 7],
    'maj7':   [0, 4, 7, 11],
    'min7':   [0, 3, 7, 10],
    'aug':    [0, 4, 8],
    'aug7':   [0, 4, 8, 10],
    'dim':    [0, 3, 6],
    'dim7':   [0, 3, 6, 9]
  };

  // Generate scale degree chords for a midi number scale
  function generateChords(scale) {
    var c = {};
    function maj(val) { return val.toUpperCase(); }
    function min(val) { return val; }
    degrees.forEach(function(degree, index) {
      function toScale(n) { return n + scale[index]; }
      c[maj(degree)]        = chords.maj  .map(toScale); // Maj
      c[min(degree)]        = chords.min  .map(toScale); // Min
      c[maj(degree) + '7']  = chords.maj7 .map(toScale); // Maj 7th
      c[min(degree) + '7']  = chords.min7 .map(toScale); // Min 7th
      c[maj(degree) + '+']  = chords.aug  .map(toScale); // Aug
      c[maj(degree) + '+7'] = chords.aug7 .map(toScale); // Aug 7th
      c[min(degree) + '°']  = chords.dim  .map(toScale); // Dim
      c[min(degree) + '°7'] = chords.dim7 .map(toScale); // Dim 7th
    });
    return c;
  }

  // Gets the name of a scale degree chord
  self.toName = function(numbers, tonic, scale) {
    if (!scale)
      scale = Polyhymnia.Scales.fromName('major', tonic);
    else
      scale = Polyhymnia.Scales.fromName(scale, tonic);

    var octave = Math.floor(numbers[0] / 12);
    numbers.forEach(function(value, i) {
      numbers[i] = value - 12 * octave + 60;
    });

    var chords = generateChords(scale);
    for (var name in chords) {
      var degree = chords[name];
      if (degree.length == numbers.length) {
        var correct = true;
        for (var i = 0; i < degree.length; i++) {
          if (degree[i] != numbers[i]) {
            correct = false;
          }
        }
        if (correct) {
          return name;
        }
      }
    }
    return '';
  };

  // Gets the midi note numbers in a scale degree chord
  self.fromName = function(name, tonic, scale) {
    if (!scale)
      scale = Polyhymnia.Scales.fromName('major', tonic); // Default to major
    else
      scale = Polyhymnia.Scales.fromName(scale, tonic);

    var chords = generateChords(scale);
    if (name in chords) {
      return chords[name];
    } else {
      return [];
    }
  };

  return self;
})();
var Polyhymnia = Polyhymnia || {};

Polyhymnia.Notes = (function() {
  'use strict';
  var self = {};

  var notes = {
    'C':  0,  'B#': 0,
    'C#': 1,  'Db': 1,
    'D':  2,
    'D#': 3,  'Eb': 3,
    'E':  4,  'Fb': 4,
    'E#': 5,  'F':  5,
    'F#': 6,  'Gb': 6,
    'G':  7,
    'G#': 8,  'Ab': 8,
    'A':  9,
    'A#': 10, 'Bb': 10,
    'B':  11, 'Cb': 11
  };

  var notesReverse = {
    0: 'C',
    1: 'C#',
    2: 'D',
    3: 'D#',
    4: 'E',
    5: 'F',
    6: 'F#',
    7: 'G',
    8: 'G#',
    9: 'A',
    10: 'A#',
    11: 'B'
  };

  // Gets the canonical name of a note
  self.toName = function(midiNumber) {
    return notesReverse[midiNumber % 12];
  };

  // Gets the midi note number of a note
  self.fromName = function(name, octave) {
    if (!octave) {
      octave = 3; // Default to the middle octave
    }
    octave += 2; // Octave numbers are -2 to 8, but midi octaves are 0 to 10

    if (name in notes)
      return notes[name] + octave * 12;
    else
      return 0;
  };

  // Gets the frequency in Hz of a midi note number
  self.toFrequency = function(midiNumber) {
    return 440.0 * Math.pow(2.0, ((midiNumber - 69.0) / 12.0));
  };

  // Gets the nearest midi note number of a frequency in Hz
  self.fromFrequency = function(frequency) {
    return Math.round(69.0 + 12.0 * Math.log(frequency * 0.0022727272727) / Math.LN2);
  };

  return self;
})();
var Polyhymnia = Polyhymnia || {};

Polyhymnia.Scales = (function() {
  'use strict';
  var self = {};

  var scales = {
    'major':            [0, 2, 4, 5, 7, 9, 11],
    'minor':            [0, 2, 3, 5, 7, 8, 10],
    'pentatonic-major': [0, 2, 4, 7, 9],
    'pentatonic-minor': [0, 3, 5, 7, 10]
  };

  // Gets the name of a scale
  self.toName = function(numbers) {
    numbers.forEach(function(value, i) {
      numbers[i] = value % 12;
    });

    for (var name in scales) {
      var scale = scales[name];
      if (scale.length == numbers.length) {
        var correct = true;
        for (var i = 0; i < scale.length; i++) {
          if (scale[i] != numbers[i]) {
            correct = false;
          }
        }
        if (correct) {
          return name;
        }
      }
    }
    return '';
  };

  // Gets the midi note numbers in a scale
  self.fromName = function(name, tonic, octave) {
    if (!tonic)
      tonic = 60; // Default to middle C
    else
      tonic = Polyhymnia.Notes.fromName(tonic, octave);

    if (name in scales) {
      return scales[name].map(function(n) {
        return n + tonic;
      });
    } else {
      return [];
    }
  };

  return self;
})();
var Polyhymnia = Polyhymnia || {};

Polyhymnia.Velocities = (function() {
  'use strict';
  var self = {};

  var velocities = {
    'ppp': 16,
    'pp':  32,
    'p':   48,
    'mp':  64,
    'mf':  80,
    'f':   96,
    'ff':  112,
    'fff': 127
  };

  // Gets the midi velocity of a named velocity
  self.fromName = function(name) {
    if (name in velocities) {
      return velocities[name];
    } else {
      return [];
    }
  };

  return self;
})();
var Polyhymnia = Polyhymnia || {};

Polyhymnia.Metronome = function() {
  'use strict';
  var self = this;
  this.tempo = 120.0;
  this.ticksPerBeat = 48;
  this.interval = 25.0; // ms
  this.lookahead = 0.1; // s
  this.sequencer = null;

  var isPlaying = false;
  var currentTick = 0;
  var nextTickTime = 0.0;
  var timer = 0;
  var audioContext = Polyhymnia.getAudioContext();

  this.play = function() {
    if (!isPlaying) {
      currentTick = 0;
      nextTickTime = audioContext.currentTime;
      schedule();
      isPlaying = true;      
    }
  };

  this.stop = function() {
    if (isPlaying) {
      window.clearTimeout(timer);
      isPlaying = false;
    }
  };

  function schedule() {
    // Don't play if the tab is in the background
    if (!document.hidden) {
      // Schedule all beats to play during the lookahead    
      while (nextTickTime < audioContext.currentTime + self.lookahead) {
        self.sequencer.scheduleTick(currentTick, nextTickTime);
        tick();
      }
    }
    timer = window.setTimeout(schedule, self.interval);
  }

  function tick() {
    // Advance time
    var secondsPerBeat = 60.0 / self.tempo; // Recalculate, so we can change tempo
    nextTickTime += secondsPerBeat / self.ticksPerBeat;

    // Advance the tick counter
    currentTick++;
  }
};
var Polyhymnia = Polyhymnia || {};

Polyhymnia.Sampler = function(options) {
  'use strict';
  var self = this;

  options = options || {};
  var attack  = options.attack  || 0.01; // s
  var release = options.release || 0.7;  // s

  var audioContext = Polyhymnia.getAudioContext();
  var voices = {};
  var samples = [];
  var buffers = [];
  var loaded = 0;
  var total = 0;

  // Load samples
  if (options && options.samples) {
    options.samples.forEach(function(sample) {
      var root =   sample.root || 'C';
      var octave = sample.octave || 4;
      var url =    sample.url;
      var midiNumber = Polyhymnia.Notes.fromName(root, octave);
      loadSample(midiNumber, url);
      total++;
    });
  }

  function loadSample(midiNumber, url) {
    // Load audio file asynchronously
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function() {
      // Decode audio data asynchronously
      audioContext.decodeAudioData(request.response, function(buffer) {
        console.log('Loaded ' + url);
        buffers[midiNumber] = buffer;
        always();
      }, function(e) {
        console.log('Error decoding audio file: ' + url);
        always();
      });
    };

    function always() {
      loaded++;
      if (loaded >= total) {
        fillSampleTable();
      }
    }    

    request.send();
  }

  function fillSampleTable() {
    // Fill gaps in sample table by pitching samples up/down
    for (var m = 0; m < 128; m++) {
      if (buffers[m] !== undefined) {
        // Sample found for this note. Just use it unpitched
        samples[m] = { buffer: buffers[m], pitch: 1 };
      } else {
        // No sample for this note. Find the closest sample below/above
        var below, above;
        for (var b = 0; b < m; b++) {
          if (buffers[b])
            below = b;
        }
        for (var a = 127; a > m; a--) {
          if (buffers[a])
            above = a;
        }

        // Find which is closer: above or below
        var closest;
        if (above && below) {
          if (above - m < m - below) {
            closest = above;
          } else {
            closest = below;
          }
        } else if (above) {
          closest = above;
        } else if (below) {
          closest = below;
        }

        // Figure out how much to pitch the sample
        if (closest) {
          var wantedFreq = Polyhymnia.Notes.toFrequency(m);
          var sampleFreq = Polyhymnia.Notes.toFrequency(closest);
          var pitch = wantedFreq / sampleFreq;
          samples[m] = { buffer: buffers[closest], pitch: pitch, orig: closest };
        }
      }
    }
  }

  this.scheduleNoteOn = function(midiNumber, velocity, time) {
    if (voices[midiNumber]) {
      self.scheduleNoteOff(midiNumber, velocity, time);
    }

    var voice = { volume: velocity / 127 };

    // Gain
    voice.gain = audioContext.createGain();
    voice.gain.connect(audioContext.destination);
    voice.gain.gain.value = 0;

    // Source
    voice.source = audioContext.createBufferSource();
    voice.source.buffer = samples[midiNumber].buffer;
    voice.source.playbackRate.value = samples[midiNumber].pitch;
    voice.source.connect(voice.gain);

    // Attack
    voice.source.start(time);
    voice.gain.gain.setValueAtTime(0.001, time);
    voice.gain.gain.exponentialRampToValueAtTime(voice.volume, time + attack);

    voices[midiNumber] = voice;
  };

  this.scheduleNoteOff = function(midiNumber, velocity, time) {
    var voice = voices[midiNumber];

    if (voice) {
      // Release
      voice.gain.gain.cancelScheduledValues(time);
      voice.gain.gain.setValueAtTime(voice.volume, time);
      voice.gain.gain.exponentialRampToValueAtTime(0.001, time + release);

      delete voices[midiNumber];
    }
  };

  this.allNotesOff = function() {
    var now = audioContext.currentTime;
    for (var voice in voices) {
      self.scheduleNoteOff(voice, 0, now);
    }
  };  
};
var Polyhymnia = Polyhymnia || {};

Polyhymnia.getAudioContext = function() {
  'use strict';
  if (!Polyhymnia.audioContext) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    Polyhymnia.audioContext = new AudioContext();
  }
  return Polyhymnia.audioContext;
};

Polyhymnia.isSupported = function() {
  'use strict';
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  if (window.AudioContext) {
    return true;
  } else {
    return false;
  }
};

Polyhymnia.Context = function(options) {
  'use strict';

  if (!Polyhymnia.isSupported()) {
    return {
      play: function() { },
      stop: function() { },
      setParam: function() { },
      setRules: function() { },
      setTempo: function() { },
      setAnimCallback: function() { }
    };
  }

  // Generator
  var generator = new Polyhymnia.Generator();
  generator.setParam('x', 0);
  generator.instruments = {};
  
  // Sequencer
  var sequencer = new Polyhymnia.Sequencer();
  sequencer.generator = generator;

  // Metronome
  var metronome = new Polyhymnia.Metronome();
  metronome.sequencer = sequencer;
  if (options && options.tempo) {
    metronome.tempo = options.tempo;
  }

  // Instruments
  if (options && options.instruments) {
    options.instruments.forEach(function(instrument) {
      sequencer.instruments[instrument.name] = new Polyhymnia.Sampler(instrument);
    });
  }

  function parse(code) {
    var tokens = Polyhymnia.tokenize(code);
    var rules  = Polyhymnia.parse(tokens);
    rules      = Polyhymnia.validate(rules, sequencer.instruments);
    generator.setRules(rules);
    return rules;
  }

  function play() {
    metronome.play();
  }

  function stop() {
    metronome.stop();
    sequencer.stop();
    generator.reset();
  }

  function setTempo(tempo) {
    metronome.tempo = tempo;
  }

  function setTimeSignature(numerator, denominator) {
    sequencer.timeSignature.num = numerator;
    sequencer.timeSignature.den = denominator;
  }

  function setTonic(tonic) {
    generator.tonic = tonic;
  }

  function setScale(scale) {
    generator.scale = scale;
  }

  function setAnimCallback(callback) {
    sequencer.animCallback = callback;
  }

  return {
    parse: parse,
    play: play,
    stop: stop,
    setParam: generator.setParam,
    setTempo: setTempo,
    setTonic: setTonic,
    setScale: setScale,
    setTimeSignature: setTimeSignature,
    setAnimCallback: setAnimCallback
  };
};
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
var Polyhymnia = Polyhymnia || {};

Polyhymnia.Sequencer = function() {
  'use strict';
  var noteType = Polyhymnia.noteType;
  var self = this;
  
  this.instruments = {};
  this.timeSignature = { num: 4, den: 4 };
  this.ticksPerQuarter = 48;
  this.generator = null;
  this.animCallback = undefined;

  var output = [];
  var audioContext = Polyhymnia.getAudioContext();

  this.scheduleTick = function(tick, time) {
    // Calculate where we're at
    var quartersInBar = self.timeSignature.num * 4 / self.timeSignature.den;
    var ticksInBar = self.ticksPerQuarter * quartersInBar;
    var tickInBar = tick % ticksInBar;

    // If we've reached the end of a bar, generate new output
    if (tickInBar === 0) {
      if (tick > 0) {
        self.generator.step();
      }
      output = self.generator.getCurrentBar();
    }

    // Play the output patterns
    var highlightSymbols = [];
    for (var i = 0; i < output.patterns.length; i++) {
      var instrument = output.patterns[i].instrument;
      var pattern    = output.patterns[i].pattern;
      var stepLength = Math.round(ticksInBar / pattern.length);
      var stepNumber = Math.floor(tickInBar / stepLength);

      // If there is no instrument, choose one
      if (!instrument) {
        // If piano is available, use that
        if (self.instruments.Piano) {
          instrument = 'Piano';
        }
        // Otherwise use the first instrument available
        else {
          for (var inst in self.instruments) {
            instrument = inst;
            break;
          }
        }
      }

      if (stepNumber < pattern.length) {
        var notes = pattern[stepNumber];
        if (!Array.isArray(notes)) {
          notes = [notes];
        }

        for (var n = 0; n < notes.length; n++) {
          // Only trigger real notes, not pauses
          if (notes[n].key) {
            // Trigger NOTE ON if we're on the first step of a note
            if (tickInBar % stepLength === 0) {
              scheduleNoteOn(instrument, notes[n], time);
            }
            // Trigger NOTE OFF if we're on the last step of the note
            if (tickInBar % stepLength === stepLength - 1) {
              scheduleNoteOff(instrument, notes[n], time);
            }
          }

          // But highlight all notes, even pauses
          highlightSymbols.push({
            start: notes[n].start,
            end:   notes[n].end
          });
        }
      }
    }

    // Also highlight all references
    for (var r = 0; r < output.references.length; r++) {
      highlightSymbols.push({
        start: output.references[r].start,
        end:   output.references[r].end
      });
    }

    // Sort highlight symbols
    highlightSymbols = highlightSymbols.sort(function(a, b) {
      return a.start - b.start;
    });

    // Set up callback for animation
    var delay = time - audioContext.currentTime; 
    if (highlightSymbols.length > 0 && self.animCallback) {
      window.setTimeout(function() {
        self.animCallback(highlightSymbols);
      }, delay);
    }
  };

  this.stop = function() {
    for (var instrument in self.instruments) {
      self.instruments[instrument].allNotesOff();
    }
  };

  function scheduleNoteOn(instrument, note, time) {
    if (self.instruments[instrument]) {
      self.instruments[instrument].scheduleNoteOn(note.key, note.velocity, time);
    }
  }

  function scheduleNoteOff(instrument, note, time) {
    if (self.instruments[instrument]) {
      self.instruments[instrument].scheduleNoteOff(note.key, note.velocity, time);
    }
  }
};
