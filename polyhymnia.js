var Polyhymnia = Polyhymnia || {}; Polyhymnia.templates = { 'player': '<div class="polyhymnia-player">    <div class="code" contenteditable></div>    <div class="controls">      <button class="play">     <svg x="0px" y="0px" width="18px" height="18px">       <path fill="none" stroke="#FF884D" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M16,9L2,17V1L16,9z"/>     </svg>     </button>      <button class="stop" style="display: none">       <svg x="0px" y="0px" width="18px" height="18px">         <rect x="2" y="2" fill="none" stroke="#FF884D" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" width="14" height="14"/>       </svg>     </button>      <div class="slider">       <div class="output hide">x = 0</div>       <input type="range" min="0" max="1" value="0" step="0.01" />     </div>   </div>    <div class="error" style="display: none"></div>    <div class="not-supported" style="display: none">     Your browser doesn’t support web audio. Why don’t you try <a href="https://www.google.com/chrome/browser/desktop/">Chrome</a>?   </div> </div>' };

var Polyhymnia = Polyhymnia || {};

Polyhymnia.Generator = function() {
  'use strict';
  var self = this;

  this.instruments = {};

  var startRule = 'Play';
  var params = {};
  var ruleDictionary = null;
  var ruleTree = null;

  this.setParam = function(name, value) {
    params[name] = value;
  };

  this.getParam = function(name) {
    return params[name] || 0.0;
  };

  this.getPatterns = function() {
    return getPatterns(ruleTree);
  };

  this.step = function() {
    step(ruleTree);
  };

  this.setRules = function(rules) {
    // Check that there are rules
    if (!rules || rules.length === 0) {
      throw new Error('No rules to play');
    } else {
      // Check that the start rule exists
      var hasStart = false;
      for (var i = 0; i < rules.length; i++) {
        if (rules[i].name == startRule)
          hasStart = true;
      }
      if (!hasStart)
        throw new Error('There is no rule named \'' + startRule + '\'');
    }

    // Prepare for playing
    ruleDictionary = {};
    for (var j = 0; j < rules.length; j++) {
      ruleDictionary[rules[j].name] = rules[j];
    }
    ruleTree = buildTree(ruleDictionary[startRule]);
  };

  function buildTree(rule) {
    var node = { name: rule.name, definitions: [] };

    rule.definitions.forEach(function(definition) {
      if (definition.sequence) {
        // Sequence definition, find its children recursively
        var children = [];
        for (var i = 0; i < definition.sequence.length; i++) {
          var rule = ruleDictionary[definition.sequence[i]];
          children.push(buildTree(rule));
        }
        node.definitions.push({ condition: definition.condition, sequence: children, index: 0 });
      } else if (definition.pattern) {
        // Pattern definition, just add it
        node.definitions.push({ condition: definition.condition, pattern: definition.pattern, instrument: definition.instrument });
      }
    });

    return node;
  }

  function step(node) {
    var finished = true;
    node.definitions.forEach(function(definition) {
      if (definition.sequence) {
        // Sequence definition, step it's current child
        var currentRule = definition.sequence[definition.index];
        var currentFinished = step(currentRule);
        if (currentFinished) {
          definition.index++;
        }
        if (definition.index >= definition.sequence.length) {
          definition.index = 0;          
        } else {
          finished = false;
        }
      } else if (definition.pattern) {
        // Pattern definition, nothing to step
      }
    });
    return finished;
  }

  function getPatterns(node) {
    // Get all definitions whose conditions apply
    var definitions = getValidDefinitions(node.definitions);

    // Go through all definitions and evaluate them
    var patterns = [];
    definitions.forEach(function(definition) {
      if (definition.sequence) {
        // Sequence definition
        var childPatterns = getPatterns(definition.sequence[definition.index]);
        childPatterns.forEach(function(p) { patterns.push(p); });
      } else if (definition.pattern) {
        // Pattern definition, get the patterns
        patterns.push({ instrument: definition.instrument, pattern: definition.pattern });
      }
    });

    return patterns;
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

  function getRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
};
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
    lookaheadToken = tokens.length > 0 ? tokens[0] : undefined;
  }

  function skipEmptyLines() {
    while (currentToken && currentToken.type == tokenType.EOL) {
      nextToken();
    }
  }

  function endOfRule() {
    if (!currentToken) {
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
    if (currentToken.type == tokenType.NAME) {
      name = currentToken.value;
    } else {
      // ERROR: Expected rule name
      throw exception('Rules must start with a name');
    }
    nextToken(); // Name

    var type;
    if (!currentToken || currentToken.type !== tokenType.SINGLE_ARROW) {
      // ERROR: Expected ->
      throw exception('Expected ->');
    }
    nextToken(); // ->

    if (currentToken && currentToken.type == tokenType.EOL) {
      nextToken(); // EOL
    }

    var definitions = [];
    do {
      definitions.push(parseDefinition());
      nextToken();
    } while (!endOfRule());

    return { type: type, name: name, definitions: definitions };
  }

  // (Condition) Definition
  function parseDefinition() {
    if (currentToken === undefined) {
      throw exception('Expected a sequence or pattern');
    }

    var condition;
    if (currentToken.type == tokenType.LEFT_PAREN) {
      condition = parseCondition();
    }

    if (currentToken && currentToken.type == tokenType.INSTRUMENT) {
      var pattern = parsePattern();
      return { condition: condition, instrument: pattern.instrument, pattern: pattern.pattern };
    } else if (currentToken && currentToken.type == tokenType.NAME) {
      var sequence = parseSequence();
      return { condition: condition, sequence: sequence };
    } else {
      // ERROR: Expected a sequence or pattern
      throw exception('Expected a sequence or pattern');
    }
  }

  // Sequence
  function parseSequence() {
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
    return sequence;
  }

  // Instrument: Pattern
  function parsePattern() {
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

    return { instrument: instrument, pattern: pattern };
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
    for (var d = 0; d < rule.definitions.length; d++) {
      var sequence = rule.definitions[d].sequence;
      if (sequence) {
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
var Polyhymnia = Polyhymnia || {};

Polyhymnia.tokenType = {
  NAME:           'name',
  NUMBER:         'number',
  INSTRUMENT:     'instrument',
  PAUSE:          'pause',
  NOTE:           'note',
  CHORD:          'chord',
  DRUM_TRIGGER:   'drum trigger',
  SINGLE_ARROW:   'single arrow',
  DOUBLE_ARROW:   'double arrow',
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

  var NAME_PATTERN =            '[A-Z][a-zA-Z0-9_]+';
  var PARAM_PATTERN =           '[a-z][a-zA-Z0-9_]*';
  var INSTRUMENT_PATTERN =      NAME_PATTERN + ':';
  var NUMBER_PATTERN =          '-?(([1-9][0-9]*)|0)\\.[0-9]+';
  var NOTE_PATTERN =            '[CDEFGAB][#b]?';
  var CHORD_PATTERN =           NOTE_PATTERN + '(M|m|dom|aug|dim)7?';
  var DRUM_PATTERN =            '[xX]';

  var NEWLINE = '\n';
  var SPACE = ' ';
  var TAB = '\t';
  var DELIMITERS = '()\n\t ';

  var namePattern           = new RegExp('^' + NAME_PATTERN + '$');
  var paramPattern          = new RegExp('^' + PARAM_PATTERN + '$');
  var instrumentPattern     = new RegExp('^' + INSTRUMENT_PATTERN + '$');
  var numberPattern         = new RegExp('^' + NUMBER_PATTERN + '$');
  var notePattern           = new RegExp('^' + NOTE_PATTERN + '$');
  var chordPattern          = new RegExp('^' + CHORD_PATTERN + '$');
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
  var parens = 0;
  var str;

  while (moreToRead) {
    str = undefined;
    token = undefined;
    lineBeforeReading = line;
    positionBeforeReading = position;
    
    if (currentChar == NEWLINE) {
      line++;
      token = { type: tokenType.EOL };
      nextChar();
    } else if (currentChar == SPACE || currentChar == TAB) {
      nextChar();
    } else if (currentChar == '(') {
      token = { type: tokenType.LEFT_PAREN };
      parens++;
      nextChar();
    } else if (currentChar == ')') {
      token = { type: tokenType.RIGHT_PAREN };
      parens--;
      nextChar();
    } else {
      str = readText();
      if (parens > 0 && str.match(paramPattern)) {
        token = { type: tokenType.PARAM, value: str };
      } else if (str == '->') {
        token = { type: tokenType.SINGLE_ARROW };
      } else if (str == '=>') {
        token = { type: tokenType.DOUBLE_ARROW };
      } else if (str == '>') {
        token = { type: tokenType.GREATER_THAN };
      } else if (str == '<') {
        token = { type: tokenType.LESS_THAN };
      } else if (str == '_') {
        token = { type: tokenType.PAUSE };
      } else if (str.match(drumPattern)) {
        token = { type: tokenType.DRUM_TRIGGER, value: str };
      } else if (str.match(notePattern)) {
        token = { type: tokenType.NOTE, value: str };
      } else if (str.match(chordPattern)) {
        token = { type: tokenType.CHORD, value: str };
      } else if (str.match(instrumentPattern)) {
        token = { type: tokenType.INSTRUMENT, value: str.substr(0, str.length - 1) };
      } else if (str.match(numberPattern)) {
        token = { type: tokenType.NUMBER, value: str };
      } else if (str.match(namePattern)) {
        token = { type: tokenType.NAME, value: str };
      } else if (str.match(paramPattern)) {
        token = { type: tokenType.PARAM, value: str };
      } else {
        token = { type: tokenType.ERROR, value: str };
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

Polyhymnia.Chords = (function() {
  'use strict';
  var self = {};

  self.chords = {
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

    for (var name in self.chords) {
      var chord = self.chords[name];
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

  // Gets the relative note numbers in a chord
  self.fromName = function(name) {
    if (name in self.chords)
      return self.chords[name];
    else
      return [];
  };

  return self;
})();
var Polyhymnia = Polyhymnia || {};

Polyhymnia.Notes = (function() {
  'use strict';
  var self = {};

  self.notes = {
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

  self.notesReverse = {
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
    return self.notesReverse[midiNumber % 12];
  };

  // Gets the midi note number of a note
  self.fromName = function(name, octave) {
    if (!octave)
      octave = 5;
    else
      octave += 2; // Octaves start at -2

    if (name in self.notes)
      return self.notes[name] + octave * 12;
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

  self.scales = {
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

    for (var name in self.scales) {
      var scale = self.scales[name];
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

  // Gets the relative note numbers in a scale
  self.fromName = function(name) {
    if (name in self.scales)
      return self.scales[name];
    else
      return [];
  };

  return self;
})();
var Polyhymnia = Polyhymnia || {};

Polyhymnia.Player = function(element, context) {
  'use strict';

  // Code
  var contents = element.textContent;

  // Context
  var music = context;
  music.setAnimCallback(highlightNotes);

  // Elements
  element.innerHTML = Polyhymnia.templates.player;
  var controls = element.querySelector('.controls');
  var playButton = element.querySelector('.play');
  var stopButton = element.querySelector('.stop');
  var paramSlider = element.querySelector('.slider input');
  var paramOutput = element.querySelector('.slider .output');
  var codeEditor = element.querySelector('.code');
  var errorMessage = element.querySelector('.error');
  var notSupportedMessage = element.querySelector('.not-supported');
  var noteElems = [];
  codeEditor.textContent = contents;

  // Functions
  function play() {
    try {
      // Parse
      var code = codeEditor.textContent;
      var tokens = Polyhymnia.tokenize(code);
      var rules = Polyhymnia.parse(tokens);

      // Play
      music.setRules(rules);
      music.play();
      playButton.style.display = 'none';
      stopButton.style.display = 'block';

      // Clear error message
      errorMessage.style.display = 'none';

      // Prepare notes for highlight
      resetCodeWithNotes(rules);
    } catch(e) {
      // Error message
      errorMessage.textContent = e.message;
      errorMessage.style.display = 'block';

      // Highlight error
      if (e.start && e.end) {
        resetCodeWithError(e);
      } else {
        throw e;
      }
    }
  }

  function stop() {
    music.stop();
    playButton.style.display = 'block';
    stopButton.style.display = 'none';
    resetCode();
  }

  function type(e) {
    if (e.keyCode === 13) {
      var end = getCaret() == codeEditor.textContent.length;

      // Don't create junk <br> or <div> on enter – just create line break
      document.execCommand('insertHTML', false, '\n');
      if (end) {
        // If at the end, insert an extra line break to get the desired effect
        document.execCommand('insertHTML', false, '\n');
      }
      e.preventDefault();
    }
  }

  function paste(e) {
    // Wait for paste to finish, then clean input
    setTimeout(function(){
      var code = codeEditor.innerHTML;
      code = code.replace(/<br.*?>/g, '\n'); // Preserve line breaks
      codeEditor.innerHTML = code;
      resetCode();
    }, 1);
  }

  function changeParam() {
    // Update the value
    music.setParam('x', paramSlider.value);

    // Show the value
    paramOutput.textContent = 'x = ' + paramSlider.value;
    paramOutput.classList.remove('hide');
    paramOutput.classList.add('show');

    // Move the value with the slider
    var pos = paramSlider.value / (paramSlider.max - paramSlider.min);
    var nudge = 8 * (1 - pos) - 8 * pos; // Offset for handle size 16px
    paramOutput.style.left = pos * paramSlider.offsetWidth - paramOutput.offsetWidth/2 + nudge + 'px';
  }

  function endChangeParam() {
    paramOutput.classList.add('hide');
    paramOutput.classList.remove('show');
  }

  function resetCodeWithNotes(rules) {
    // Get the code
    var code = codeEditor.textContent;

    // Get all notes
    var notes = [];
    for (var r = 0; r < rules.length; r++) {
      for (var d = 0; d < rules[r].definitions.length; d++) {
        var pattern = rules[r].definitions[d].pattern;
        if (pattern) {
          notes = notes.concat(pattern);
        }
      }
    }

    // Wrap notes in spans
    var html = '';
    if (notes.length > 0) {
      var n = 0;
      for (var i = 0; i < code.length; i++) {
        if (notes[n] && notes[n].start == i) {
          html += '<span class="note" data-start="' + notes[n].start + '">';
        }
        html += code.charAt(i);
        if (notes[n] && notes[n].end == i + 1) {
          html += '</span>';
          n++;
        }
      }
    }

    // Replace contents of the code editor
    codeEditor.innerHTML = html;

    // Get all note elements for later highlighting
    noteElems = [];
    var elems = codeEditor.querySelectorAll('.note');
    for (var e = 0; e < elems.length; e++) {
      noteElems.push({ elem: elems[e], start: elems[e].dataset.start });
    }
  }

  function resetCode() {
    codeEditor.innerHTML = codeEditor.textContent;
  }

  function resetCodeWithError(error) {
    // Get the code
    var code = codeEditor.textContent;

    // Wrap error in span
    var html = '';
    for (var i = 0; i < code.length; i++) {
      if (i == error.start) {
        html += '<span class="error-highlight">';
      } else if (i == error.end) {
        html += '</span>';
      }
      html += code.charAt(i);
    }

    // Replace contents of the code editor
    codeEditor.innerHTML = html;
  }

  function highlightNotes(notes) {
    for (var i = 0; i < noteElems.length; i++) {
      var highlight = false;
      for (var j = 0; j < notes.length; j++) {
        if (noteElems[i].start == notes[j].start) {
          highlight = true;
        }
      }
      if (highlight) {
        noteElems[i].elem.className = 'playing';
      } else {
        noteElems[i].elem.className = 'note';
      }
    }
  }

  function getCaret() {
    var range = window.getSelection().getRangeAt(0);
    var preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(codeEditor);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    return preCaretRange.toString().length;
  }

  // Events
  if (Polyhymnia.isSupported()) {
    playButton.addEventListener('click', play);
    stopButton.addEventListener('click', stop);
    paramSlider.addEventListener('input', changeParam);
    paramSlider.addEventListener('change', endChangeParam);
    codeEditor.addEventListener('keydown', type);
    element.addEventListener ('paste', paste);
  } else {
    controls.style.display = 'none';
    notSupportedMessage.style.display = 'block';
  }
};
var Polyhymnia = Polyhymnia || {};

Polyhymnia.Metronome = function() {
  'use strict';
  var self = this;
  this.tempo = 120.0;
  this.stepsPerBeat = 16;
  this.interval = 25.0; // ms
  this.lookahead = 0.1; // s
  this.sequencer = null;

  var isPlaying = false;
  var currentStep = 0;
  var nextStepTime = 0.0;
  var timer = 0;
  var audioContext = Polyhymnia.getAudioContext();

  this.play = function() {
    if (!isPlaying) {
      currentStep = 0;
      nextStepTime = audioContext.currentTime;
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
      while (nextStepTime < audioContext.currentTime + self.lookahead) {
        self.sequencer.scheduleStep(currentStep, nextStepTime);
        step();
      }
    }
    timer = window.setTimeout(schedule, self.interval);
  }

  function step() {
    // Advance time
    var secondsPerBeat = 60.0 / self.tempo; // Recalculate, so we can change tempo
    nextStepTime += secondsPerBeat / self.stepsPerBeat;

    // Advance the step counter
    currentStep++;
  }
};
var Polyhymnia = Polyhymnia || {};

Polyhymnia.Sampler = function(options) {
  'use strict';
  var self = this;

  var audioContext = Polyhymnia.getAudioContext();
  var samples = [];
  var buffers = [];
  var loaded = 0;
  var total = 0;

  // Load samples
  if (options && options.samples) {
    total = options.samples.length;
    for (var i = 0; i < options.samples.length; i++) {
      var root =   options.samples[i].root || 'C';
      var octave = options.samples[i].octave || 4;
      var url =    options.samples[i].url;
      var midiNumber = Polyhymnia.Notes.fromName(root, octave);
      loadSample(midiNumber, url);
    }
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
        loaded++;
        if (loaded == total) {
          fillSampleTable();
        }
      }, function(e) {
        console.log('Error decoding audio file: ' + url);
      });
    };

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

  this.scheduleNote = function(midiNumber, time) {
    var source = audioContext.createBufferSource();
    source.buffer = samples[midiNumber].buffer;
    source.playbackRate.value = samples[midiNumber].pitch;
    source.connect(audioContext.destination);
    source.start(time);
  };

  this.scheduleNotes = function(midiNumbers, time) {
    midiNumbers.forEach(function(midiNumber) {
      self.scheduleNote(midiNumber, time);
    });
  };
};
var Polyhymnia = Polyhymnia || {};

Polyhymnia.Sequencer = function() {
  'use strict';
  var noteType = Polyhymnia.noteType;
  var self = this;

  this.measure = { num: 4, den: 4 };
  this.stepsPerBeat = 16;
  this.generator = null;
  this.animCallback = undefined;

  var patterns = [];
  var audioContext = Polyhymnia.getAudioContext();

  this.scheduleStep = function(step, time) {
    // Calculate where we're at
    var stepInBar = step % (self.stepsPerBeat * self.measure.num);

    // If we've reached the end of a bar, generate new patterns
    if (stepInBar === 0) {
      if (step > 0) {
        self.generator.step();
      }
      patterns = self.generator.getPatterns();
    }

    // Play the patterns
    var animateNotes = [];
    for (var i = 0; i < patterns.length; i++) {
      var instrument = patterns[i].instrument;
      var pattern = patterns[i].pattern;
      var noteLength = getNoteLength(pattern.length);
      var noteNumber = Math.floor(stepInBar / noteLength);

      if (noteNumber < pattern.length) {
        // Only trigger the note if we're on step 0 of it
        var note = pattern[noteNumber];
        if (stepInBar % noteLength === 0) {
          scheduleNote(instrument, note.type, note.value, time);
        }

        // But always animate it
        animateNotes.push(note);
      }
    }

    // Set up callback for animation
    var delay = time - audioContext.currentTime; 
    if (animateNotes.length > 0 && self.animCallback) {
      window.setTimeout(function() {
        self.animCallback(animateNotes);
      }, delay);
    }
  };

  function scheduleNote(instrument, type, value, time) {
    // Convert value to relative midi numbers
    var midiNumbers = [];
    if (type == noteType.NOTE) {
      midiNumbers = [Polyhymnia.Notes.fromName(value)];
    } else if (type == noteType.CHORD) {
      var intonation = value.substr(1,1);
      var root, chord;
      if (intonation == '#' || intonation == 'b') {
        root = Polyhymnia.Notes.fromName(value.substr(0,2));
        chord = Polyhymnia.Chords.fromName(value.substr(2));
      } else {
        root = Polyhymnia.Notes.fromName(value.substr(0,1));
        chord = Polyhymnia.Chords.fromName(value.substr(1));
      }

      midiNumbers = chord.map(function(note) {
        return note + root;
      });
    } else if (type == noteType.DRUM) {
      midiNumbers = [Polyhymnia.Notes.fromName('C')];
    }

    // Play notes
    self.generator.instruments[instrument].scheduleNotes(midiNumbers, time);
  }

  function getNoteLength(patternLength) {
    var noteLengths = [1, 2, 4, 8, 16, 32, 64];
    var noteLength = self.stepsPerBeat;
    for (var n = 0; n < noteLengths.length; n++) {
      if (patternLength < self.measure.num * noteLengths[n] / 4) {
        break;
      }
      noteLength = self.stepsPerBeat * 4 / noteLengths[n];
    }
    return noteLength;
  }
};
var Polyhymnia = Polyhymnia || {};

Polyhymnia.Synthesizer = function(options) {
  'use strict';
  var self = this;
  
  options = options || {};
  var wave =    options.wave    || 'square';
  var attack =  options.attack  || 0.05; // s
  var decay =   options.decay   || 0.1;  // s
  var sustain = options.sustain || 0.8;  // gain
  var release = options.release || 0.3;  // s

  var audioContext = Polyhymnia.getAudioContext();

  this.scheduleNote = function(midiNumber, time) {
    // Gain
    var gain = audioContext.createGain();
    gain.connect(audioContext.destination);
    gain.gain.value = 0;

    // Oscillator
    var osc = audioContext.createOscillator();
    osc.type = wave;
    osc.frequency.value = Polyhymnia.Notes.toFrequency(midiNumber);
    osc.connect(gain);

    // Play, envelope, stop
    osc.start(time);
    gain.gain.linearRampToValueAtTime(0.0,                   time + 0.0001); // Offset to avoid click/pop
    gain.gain.linearRampToValueAtTime(1.0,                   time + attack);
    gain.gain.linearRampToValueAtTime(sustain, time + attack + decay);
    gain.gain.linearRampToValueAtTime(0.0,                   time + attack + decay + release);
    osc.stop(time + attack + decay + release + 0.0001);
  };

  this.scheduleNotes = function(midiNumbers, time) {
    midiNumbers.forEach(function(midiNumber) {
      self.scheduleNote(midiNumber, time);
    });
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
    for (var i = 0; i < options.instruments.length; i++) {
      var instrument = options.instruments[i];
      generator.instruments[instrument.name] = new Polyhymnia.Sampler({
        samples: instrument.samples
      });
    }
  }

  function setAnimCallback(callback) {
    sequencer.animCallback = callback;
  }

  return {
    play: metronome.play,
    stop: metronome.stop,
    setParam: generator.setParam,
    setRules: generator.setRules,
    setAnimCallback: setAnimCallback
  };
};