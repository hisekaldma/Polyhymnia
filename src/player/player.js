var Polyhymnia = Polyhymnia || {};

Polyhymnia.Player = function(element, context) {
  'use strict';

  // Code
  var contents = element.textContent;

  // Music
  var rules = [];
  var music = context;
  var symbols = [];
  music.setAnimCallback(highlightNotes);

  // Elements
  element.innerHTML = Polyhymnia.templates.player;
  var controls =     element.querySelector('.controls');
  var playButton =   element.querySelector('.play');
  var stopButton =   element.querySelector('.stop');
  var paramSlider =  element.querySelector('.slider input');
  var paramOutput =  element.querySelector('.slider .output');
  var tempoInput =   element.querySelector('.tempo input');
  var codeEditor =   element.querySelector('.code .editor');
  var codeDisplay =  element.querySelector('.code .display');
  var codeText =     element.querySelector('.code .text');
  var codeCursor =   element.querySelector('.code .cursor');
  var notSupportedMessage = element.querySelector('.not-supported');
  var noteElems = [];
  codeEditor.value = contents;

  // Private vars
  var cursorPos;

  // Functions
  function play() {
    parse();
    music.play();
    playButton.style.display = 'none';
    stopButton.style.display = 'block';
  }

  function stop() {
    music.stop();
    playButton.style.display = 'block';
    stopButton.style.display = 'none';
    highlightNotes([]);
  }

  function parse() {
    // Parse rules
    var rules = music.parse(codeEditor.value);
    symbols = rules.symbols;

    // Render the code
    renderCode();
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
      if (highlight) {
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
    codeEditor.addEventListener('input',  parse);
  } else {
    controls.style.display = 'none';
    notSupportedMessage.style.display = 'block';
  }

  // Rendering
  renderCode();
  window.requestAnimationFrame(render);
};