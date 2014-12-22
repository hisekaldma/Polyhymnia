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
  var tempoInput = element.querySelector('.tempo input');
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
    tempoInput.addEventListener('input', changeTempo);
    codeEditor.addEventListener('keydown', type);
    element.addEventListener ('paste', paste);
  } else {
    controls.style.display = 'none';
    notSupportedMessage.style.display = 'block';
  }
};