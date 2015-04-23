---
---
Editor = function(element, context) {
  'use strict';

  // Code
  var contents = element.textContent;

  // Music
  var rules = [];
  var music = context;
  var symbols = [];
  music.setAnimCallback(highlight);

  // Elements
  {% capture template %}{% include editor.html %}{% endcapture %}
  element.innerHTML = '{{ template | strip_newlines }}';
  var controls =     element.querySelector('.controls');
  var playButton =   element.querySelector('.play');
  var stopButton =   element.querySelector('.stop');
  var paramSlider =  element.querySelector('.slider input');
  var paramOutput =  element.querySelector('.slider .output');
  var tempoInput =   element.querySelector('.settings .tempo');
  var tonicInput =   element.querySelector('.settings .tonic');
  var scaleInput =   element.querySelector('.settings .scale');
  var timeInput =    element.querySelector('.settings .time');
  var codeEditor =   element.querySelector('.code .editor');
  var codeDisplay =  element.querySelector('.code .display');
  var codeText =     element.querySelector('.code .text');
  var codeCursor =   element.querySelector('.code .cursor');
  var notSupportedMessage = element.querySelector('.not-supported');
  var highlightElems = [];
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
    highlight([]);
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

  function changeTonic() {
    music.setTonic(tonicInput.value);

    // Tweak layout to account for length
    if (tonicInput.value.length == 1) {
      tonicInput.classList.add('short');
    } else {
      tonicInput.classList.remove('short');
    }
  }

  function changeScale() {
    music.setScale(scaleInput.value);
  }
  
  function changeTimeSignature() {
    var val = timeInput.value.split('/');
    var num = parseInt(val[0]);
    var den = parseInt(val[1]);
    music.setTimeSignature(num, den);
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

    // Get all notes and references for later highlighting
    highlightElems = [];
    var elems = codeText.querySelectorAll('.note, .reference');
    for (var e = 0; e < elems.length; e++) {
      highlightElems.push({ elem: elems[e], start: elems[e].dataset.start });
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

  function highlight(symbols) {
    for (var i = 0; i < highlightElems.length; i++) {
      var highlight = false;
      for (var j = 0; j < symbols.length; j++) {
        if (highlightElems[i].start == symbols[j].start) {
          highlight = true;
        }
      }
      if (isPlaying && highlight) {
        highlightElems[i].elem.classList.add('playing');
      } else {
        highlightElems[i].elem.classList.remove('playing');
      }
    }
  }

  // Events
  if (Polyhymnia.isSupported()) {
    playButton.addEventListener('click',  play);
    stopButton.addEventListener('click',  stop);
    paramSlider.addEventListener('input', changeParam);
    tempoInput.addEventListener('input',  changeTempo);
    tonicInput.addEventListener('input',  changeTonic);
    scaleInput.addEventListener('input',  changeScale);
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