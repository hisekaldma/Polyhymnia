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

Polyhymnia.Token = function(type, str, value) {
  'use strict';
  this.type  = type;
  this.str   = str;
  this.value = value;
};

Polyhymnia.tokenize = function(textToTokenize) {
  'use strict';

  var tokenType = Polyhymnia.tokenType;
  var Token     = Polyhymnia.Token;

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
      token = new Token(tokenType.EOL);
      context = CTX_DEFAULT;
      nextChar();
    } else if (currentChar == SPACE || currentChar == TAB) {
      nextChar();
    } else if (currentChar == '(') {
      token = new Token(tokenType.LEFT_PAREN, '(');
      context = CTX_CONDITION;
      nextChar();
    } else if (currentChar == ')') {
      token = new Token(tokenType.RIGHT_PAREN, ')');
      context = CTX_DEFAULT;
      nextChar();
    } else if (currentChar == COMMENT) {
        // Comment
        str = '';
        while (moreToRead && currentChar !== NEWLINE) {
          str += currentChar;
          nextChar();
        }
        token = new Token(tokenType.COMMENT, str, str);
    } else {
      str = readText();
      if (context == CTX_CONDITION) {
        // Inside a condition
        if (str == '>') {
          token = new Token(tokenType.GREATER_THAN, str);
        } else if (str == '<') {
          token = new Token(tokenType.LESS_THAN, str);
        } else if (str.search(paramPattern) !== -1) {
          token = new Token(tokenType.PARAM, str, str);
        } else if (str.search(numberPattern) !== -1) {
          token = new Token(tokenType.NUMBER, str, parseFloat(str));
        } else {
          token = new Token(tokenType.ERROR, str, str);
        }
      } else {
        // Not inside a condition
        if (str == '=') {
          token = new Token(tokenType.EQUAL, str);
        } else if (str == '_') {
          token = new Token(tokenType.PAUSE, str);
        } else if (str == '|') {
          token = new Token(tokenType.BAR, str);
        }

        // Pattern steps have higher precedence
        else if (str.search(drumPattern) !== -1) {
          matches = str.match(drumPattern);
          velocity = getVelocity(matches[2]);
          token = new Token(tokenType.DRUM_HIT, str, { str: matches[1], velocity: velocity });
        } else if (str.search(notePattern) !== -1) {
          matches = str.match(notePattern);
          octave = getOctave(matches[2]);
          velocity = getVelocity(matches[3]);
          token = new Token(tokenType.NOTE, str, { note: matches[1], octave: octave, velocity: velocity });
        } else if (str.search(chordPattern) !== -1) {
          matches = str.match(chordPattern);
          octave = getOctave(matches[2]);
          velocity = getVelocity(matches[4]);
          token = new Token(tokenType.CHORD, str, { note: matches[1], octave: octave, chord: matches[3], velocity: velocity });
        } else if (str.search(degreeNotePattern) !== -1) {
          matches = str.match(degreeNotePattern);
          velocity = getVelocity(matches[2]);
          token = new Token(tokenType.DEGREE_NOTE, str, { str: matches[1], velocity: velocity });
        } else if (str.search(degreeChordPattern) !== -1) {
          matches = str.match(degreeChordPattern);
          velocity = getVelocity(matches[2]);
          token = new Token(tokenType.DEGREE_CHORD, str, { str: matches[1], velocity: velocity });
        } 

        // Names have lower precedence
        else if (str.search(namePattern) !== -1) {
          token = new Token(tokenType.NAME, str, str);
        } else if (str.search(instrumentPattern) !== -1) {
          token = new Token(tokenType.INSTRUMENT, str, str.substr(0, str.length - 1));
        } else {
          token = new Token(tokenType.ERROR, str, str);
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