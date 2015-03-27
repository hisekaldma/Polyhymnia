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
  DRUM_TRIGGER:   'drum trigger',
  ARROW:          'arrow',
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
  var NOTE_PATTERN         = '([CDEFGAB][#b]?)';
  var OCTAVE_PATTERN       = '(-2|-1|[0-8])?';
  var CHORD_PATTERN        = '((M|m|dom|aug|dim)7?)';
  var DEGREE_NOTE_PATTERN  = '[1-7]';
  var DEGREE_CHORD_PATTERN = '((I|II|III|IV|V|VI|VII)\\+?|(i|ii|iii|iv|v|vi|vii)°?)7?';
  var DRUM_PATTERN         = '[xX]';

  var NEWLINE    = '\n';
  var SPACE      = ' ';
  var TAB        = '\t';
  var DELIMITERS = '()\n\t ';

  var CTX_DEFAULT   = 'sequence';
  var CTX_PATTERN   = 'pattern';
  var CTX_CONDITION = 'condition';

  var namePattern           = new RegExp('^' + NAME_PATTERN + '$');
  var paramPattern          = new RegExp('^' + PARAM_PATTERN + '$');
  var instrumentPattern     = new RegExp('^' + INSTRUMENT_PATTERN + '$');
  var numberPattern         = new RegExp('^' + NUMBER_PATTERN + '$');
  var notePattern           = new RegExp('^' + NOTE_PATTERN + OCTAVE_PATTERN + '$');
  var chordPattern          = new RegExp('^' + NOTE_PATTERN + OCTAVE_PATTERN + CHORD_PATTERN + '$');
  var degreeNotePattern     = new RegExp('^' + DEGREE_NOTE_PATTERN + '$');
  var degreeChordPattern    = new RegExp('^' + DEGREE_CHORD_PATTERN + '$');
  var drumPattern           = new RegExp('^' + DRUM_PATTERN + '$');

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

  // Start tokenizing

  nextChar();

  var token;
  var lineBeforeReading;
  var positionBeforeReading;
  var context = CTX_DEFAULT;
  var str;
  var matches, octave;

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
      token = { type: tokenType.LEFT_PAREN };
      context = CTX_CONDITION;
      nextChar();
    } else if (currentChar == ')') {
      token = { type: tokenType.RIGHT_PAREN };
      context = CTX_DEFAULT;
      nextChar();
    } else {
      str = readText();
      if (context == CTX_CONDITION) {
        // Inside a condition
        if (str == '>') {
          token = { type: tokenType.GREATER_THAN };
        } else if (str == '<') {
          token = { type: tokenType.LESS_THAN };
        } else if (str.match(paramPattern)) {
          token = { type: tokenType.PARAM, value: str };
        } else if (str.match(numberPattern)) {
          token = { type: tokenType.NUMBER, value: parseFloat(str) };
        } else {
          token = { type: tokenType.ERROR, value: str };
        }
      } else if (context == CTX_PATTERN) {
        // Inside a pattern
        if (str == '_') {
          token = { type: tokenType.PAUSE };
        } else if (str.match(drumPattern)) {
          token = { type: tokenType.DRUM_TRIGGER, value: str };
        } else if (str.match(notePattern)) {
          matches = str.match(notePattern);
          octave = matches[2] ? parseInt(matches[2]) : undefined;
          token = { type: tokenType.NOTE, note: matches[1], octave: octave };
        } else if (str.match(chordPattern)) {
          matches = str.match(chordPattern);
          octave = matches[2] ? parseInt(matches[2]) : undefined;
          token = { type: tokenType.CHORD, note: matches[1], octave: octave, chord: matches[3] };
        } else if (str.match(degreeNotePattern)) {
          token = { type: tokenType.DEGREE_NOTE, value: str };
        } else if (str.match(degreeChordPattern)) {
          token = { type: tokenType.DEGREE_CHORD, value: str };
        } else {
          token = { type: tokenType.ERROR, value: str };
        }
      } else {
        // Not inside a condition or pattern
        if (str == '->') {
          token = { type: tokenType.ARROW };
        } else if (str.match(namePattern)) {
          token = { type: tokenType.NAME, value: str };
        } else if (str.match(instrumentPattern)) {
          token = { type: tokenType.INSTRUMENT, value: str.substr(0, str.length - 1) };
          context = CTX_PATTERN;
        } else {
          token = { type: tokenType.ERROR, value: str };
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