var Polyhymnia = Polyhymnia || {}; Polyhymnia.templates = { 'editor': '<div class="polyhymnia-editor">    <div class="code">     <div class="display">       <div class="text"></div>       <div class="cursor-layer">         <div class="cursor blink">&nbsp;</div>       </div>     </div>     <textarea class="editor" spellcheck="false"></textarea>   </div>    <div class="controls">      <button class="play">       <svg x="0px" y="0px" width="18px" height="18px">         <path fill="none" stroke="#FF884D" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M16,9L2,17V1L16,9z"/>       </svg>     </button>      <button class="stop" style="display: none">       <svg x="0px" y="0px" width="18px" height="18px">         <rect x="2" y="2" fill="none" stroke="#FF884D" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" width="14" height="14"/>       </svg>     </button>      <div class="slider">       <div class="output hide">x = 0</div>       <input type="range" min="0" max="10" value="0" step="0.1" />     </div>      <div class="settings">           <input class="tempo" type="number" min="1" max="320" value="120" step="1" maxlength="3" /><label>bpm</label>       <select class="time">         <option>3/4</option>         <option selected>4/4</option>         <option>5/4</option>         <option>6/8</option>         <option>7/8</option>       </select>     </div>   </div>    <div class="not-supported" style="display: none">     Your browser doesn’t support web audio. Why don’t you try <a href="https://www.google.com/chrome/browser/desktop/">Chrome</a>?   </div> </div>' };

var Polyhymnia = Polyhymnia || {};

Polyhymnia.Editor = function(element, context) {
  'use strict';

  // Code
  var contents = element.textContent;

  // Music
  var rules = [];
  var music = context;
  var symbols = [];
  music.setAnimCallback(highlightNotes);

  // Elements
  element.innerHTML = Polyhymnia.templates.editor;
  var controls =     element.querySelector('.controls');
  var playButton =   element.querySelector('.play');
  var stopButton =   element.querySelector('.stop');
  var paramSlider =  element.querySelector('.slider input');
  var paramOutput =  element.querySelector('.slider .output');
  var tempoInput =   element.querySelector('.settings .tempo');
  var timeInput =    element.querySelector('.settings .time');
  var codeEditor =   element.querySelector('.code .editor');
  var codeDisplay =  element.querySelector('.code .display');
  var codeText =     element.querySelector('.code .text');
  var codeCursor =   element.querySelector('.code .cursor');
  var notSupportedMessage = element.querySelector('.not-supported');
  var noteElems = [];
  codeEditor.value = contents;

  // Private vars
  var cursorPos;
  var isPlaying = false;

  // Functions
  function play() {
    parse();
    music.play();
    playButton.style.display = 'none';
    stopButton.style.display = 'block';
    isPlaying = true;
  }

  function stop() {
    music.stop();
    playButton.style.display = 'block';
    stopButton.style.display = 'none';
    isPlaying = false;
    highlightNotes([]);
  }

  function parse() {
    // Parse rules
    var rules = music.parse(codeEditor.value);
    symbols = rules.symbols;

    // Render the code
    renderCode();
  }

  function changeTimeSignature() {
    var val = timeInput.value.split('/');
    var num = parseInt(val[0]);
    var den = parseInt(val[1]);
    music.setTimeSignature(num, den);
  }

  function changeTempo() {
    if (tempoInput.value === '') {
      tempoInput.value = 120;
    } else if (tempoInput.value > parseInt(tempoInput.max)) {
      tempoInput.value = tempoInput.max;
    } else if (tempoInput.value < parseInt(tempoInput.min)) {
      tempoInput.value = tempoInput.min;
    }
    music.setTempo(tempoInput.value);
  }

  function changeParam() {
    // Update the value
    music.setParam('x', paramSlider.valueAsNumber);

    // Show the value
    paramOutput.textContent = 'x = ' + paramSlider.value;
    paramOutput.classList.remove('hide');
    paramOutput.classList.add('show');

    // Move the value with the slider
    var pos = paramSlider.value / (paramSlider.max - paramSlider.min);
    var nudge = 8 * (1 - pos) - 8 * pos; // Offset for handle size 16px
    paramOutput.style.left = pos * paramSlider.offsetWidth - paramOutput.offsetWidth/2 + nudge + 'px';

    // Hide the value again
    setTimeout(function() {
      paramOutput.classList.add('hide');
      paramOutput.classList.remove('show');
    }, 2000);
  }

  function renderCode() {
    // Get the code
    var code = codeEditor.value;

    // Wrap symbols in spans
    var html = '';
    var s = 0;
    for (var i = 0; i < code.length; i++) {
      if (s < symbols.length && symbols[s].start == i) {
        html += '<span class="' + symbols[s].type + '" data-start="' + symbols[s].start + '">';
      }

      html += code.charAt(i);

      if (s < symbols.length && symbols[s].end == i + 1) {
        html += '</span>';
        s++;
      }
    }

    // Replace contents of the code display
    codeText.innerHTML = html;

    // Get all note elements for later highlighting
    noteElems = [];
    var elems = codeText.querySelectorAll('.note');
    for (var e = 0; e < elems.length; e++) {
      noteElems.push({ elem: elems[e], start: elems[e].dataset.start });
    }
  }

  function render() {
    var newCursorPos = codeEditor.selectionDirection == 'forward' ? codeEditor.selectionEnd : codeEditor.selectionStart;

    // Draw the cursor
    if (document.activeElement === codeEditor) {
      codeCursor.style.display = 'block';

      // Only redraw the cursor if it's moved
      if (newCursorPos !== cursorPos) {
        cursorPos = newCursorPos;

        // Measure text sizes
        var rect = codeCursor.getBoundingClientRect();
        var lineHeight = rect.height - (codeCursor.offsetHeight - codeCursor.clientHeight);
        var characterWidth = rect.width - (codeCursor.offsetWidth - codeCursor.clientWidth);

        // Calculate position
        var lines = codeEditor.value.substr(0, cursorPos).split('\n');
        var top = (lines.length - 1) * lineHeight;
        var left = lines[lines.length - 1].length * characterWidth;

        // Move the cursor
        codeCursor.classList.remove('blink');
        codeCursor.style.top = top + 'px';
        codeCursor.style.left = left - 1 + 'px';
        var reflow = codeCursor.offsetWidth; // Trigger animation reset
        codeCursor.classList.add('blink');
      }
    } else {
      codeCursor.style.display = 'none';
    }

    // Sync scroll
    codeDisplay.scrollTop = codeEditor.scrollTop;

    // Repaint
    window.requestAnimationFrame(render);    
  }

  function highlightNotes(notes) {
    for (var i = 0; i < noteElems.length; i++) {
      var highlight = false;
      for (var j = 0; j < notes.length; j++) {
        if (noteElems[i].start == notes[j].start) {
          highlight = true;
        }
      }
      if (isPlaying && highlight) {
        noteElems[i].elem.className = 'playing';
      } else {
        noteElems[i].elem.className = 'note';
      }
    }
  }

  // Events
  if (Polyhymnia.isSupported()) {
    playButton.addEventListener('click',  play);
    stopButton.addEventListener('click',  stop);
    paramSlider.addEventListener('input', changeParam);
    tempoInput.addEventListener('input',  changeTempo);
    timeInput.addEventListener('input',   changeTimeSignature);
    codeEditor.addEventListener('input',  parse);
  } else {
    controls.style.display = 'none';
    notSupportedMessage.style.display = 'block';
  }

  // Rendering
  parse();
  window.requestAnimationFrame(render);
};
var Polyhymnia = Polyhymnia || {};

Polyhymnia.Generator = function() {
  'use strict';
  var self = this;

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
    // Prepare for playing
    ruleDictionary = {};
    for (var j = 0; j < rules.length; j++) {
      ruleDictionary[rules[j].name] = rules[j];
    }
    var oldRuleTree = ruleTree;    
    ruleTree = buildTree(ruleDictionary[startRule]);

    // Copy state to allow replacing the rules while playing
    if (oldRuleTree) {
      copyState(oldRuleTree, ruleTree);
    }
  };

  function buildTree(rule) {
    var node = { name: name || '', definitions: [] };

    // If we can't find the rule, return an empty node, so we can keep playing
    if (!rule) {
      return node;
    }

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

  function copyState(oldNode, newNode) {
    for (var i = 0; i < oldNode.definitions.length; i++) {
      var oldDefinition = oldNode.definitions[i];
      var newDefinition = newNode.definitions.length > i ? newNode.definitions[i] : undefined;
      if (oldDefinition && newDefinition && oldDefinition.sequence && newDefinition.sequence) {
        newDefinition.index = oldDefinition.index;
        var oldCurrent = oldDefinition.sequence[oldDefinition.index];
        var newCurrent = newDefinition.sequence[newDefinition.index];
        copyState(oldCurrent, newCurrent);
      }
    }
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
    } else if (currentToken.type == tokenType.NAME && lookaheadToken && lookaheadToken.type == tokenType.ARROW) {
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

    if (currentToken.type == tokenType.ARROW) {
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
var Polyhymnia = Polyhymnia || {};

Polyhymnia.tokenType = {
  NAME:           'name',
  NUMBER:         'number',
  INSTRUMENT:     'instrument',
  PAUSE:          'pause',
  NOTE:           'note',
  CHORD:          'chord',
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

  var NAME_PATTERN        = '[A-Z][a-zA-Z0-9_]*';
  var PARAM_PATTERN       = '[a-z][a-zA-Z0-9_]*';
  var INSTRUMENT_PATTERN  = NAME_PATTERN + ':';
  var NUMBER_PATTERN      = '-?(([1-9][0-9]*)|0)(\\.[0-9]*)?';
  var NOTE_PATTERN        = '([CDEFGAB][#b]?)';
  var OCTAVE_PATTERN      = '(-2|-1|[0-8])?';
  var CHORD_PATTERN       = '((M|m|dom|aug|dim)7?)';
  var DRUM_PATTERN        = '[xX]';

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
          token = { type: tokenType.NOTE, value: { note: matches[1], octave: octave }};
        } else if (str.match(chordPattern)) {
          matches = str.match(chordPattern);
          octave = matches[2] ? parseInt(matches[2]) : undefined;
          token = { type: tokenType.CHORD, value: { note: matches[1], octave: octave, chord: matches[3] }};
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
  
  this.instruments = {};
  this.timeSignature = { num: 4, den: 4 };
  this.stepsPerBeat = 16;
  this.generator = null;
  this.animCallback = undefined;

  var patterns = [];
  var audioContext = Polyhymnia.getAudioContext();

  this.scheduleStep = function(step, time) {
    // Calculate where we're at
    var stepInBar = step % (self.stepsPerBeat * self.timeSignature.num);

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
      midiNumbers = [Polyhymnia.Notes.fromName(value.note, value.octave)];
    } else if (type == noteType.CHORD) {
      var root = Polyhymnia.Notes.fromName(value.note, value.octave);
      var chord = Polyhymnia.Chords.fromName(value.chord);
      midiNumbers = chord.map(function(note) {
        return note + root;
      });
    } else if (type == noteType.DRUM) {
      midiNumbers = [Polyhymnia.Notes.fromName('C')];
    }

    // Play notes
    if (self.instruments[instrument]) {
      self.instruments[instrument].scheduleNotes(midiNumbers, time);
    }
  }

  function getNoteLength(patternLength) {
    var noteLengths = [1, 2, 4, 8, 16, 32, 64];
    var noteLength = self.stepsPerBeat;
    for (var n = 0; n < noteLengths.length; n++) {
      if (patternLength < self.timeSignature.num * noteLengths[n] / 4) {
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
    for (var i = 0; i < options.instruments.length; i++) {
      var instrument = options.instruments[i];
      sequencer.instruments[instrument.name] = new Polyhymnia.Sampler({
        samples: instrument.samples
      });
    }
  }

  function parse(code) {
    var tokens = Polyhymnia.tokenize(code);
    var rules = Polyhymnia.parse(tokens, sequencer.instruments);
    generator.setRules(rules);
    return rules;
  }

  function setTempo(tempo) {
    metronome.tempo = tempo;
  }

  function setTimeSignature(numerator, denominator) {
    sequencer.timeSignature.num = numerator;
    sequencer.timeSignature.den = denominator;
  }

  function setAnimCallback(callback) {
    sequencer.animCallback = callback;
  }

  return {
    parse: parse,
    play: metronome.play,
    stop: metronome.stop,
    setParam: generator.setParam,
    setTempo: setTempo,
    setTimeSignature: setTimeSignature,
    setAnimCallback: setAnimCallback
  };
};