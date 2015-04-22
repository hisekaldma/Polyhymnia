MiniPlayer = function(element, context) {
  'use strict';

  // Keep track of all players on the page
  MiniPlayer.instances.push(this);

  // Public vars
  this.isPlaying = false;

  // Private vars
  var self = this;
  var playButton, stopButton;
  var codeElement = element.querySelector('code');
  var code = codeElement.textContent;

  // Functions
  self.play = function() {
    // Stop other players
    MiniPlayer.instances.forEach(function(player) {
      if (player.isPlaying) {
        player.stop();
      }
    });
    
    // Play this player
    context.parse(code);
    context.play();
    playButton.style.display = 'none';
    stopButton.style.display = 'block';
    element.classList.add('active');
    self.isPlaying = true;
  }

  self.stop = function() {
    context.stop();
    playButton.style.display = 'block';
    stopButton.style.display = 'none';
    element.classList.remove('active');
    self.isPlaying = false;
  }

  function highlightCode() {
    // Get symbols
    var rules = context.parse(code);
    var symbols = rules.symbols;

    // Wrap symbols
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
    codeElement.innerHTML = html;
  }

  // Only create play/stop buttons if playing is supported
  if (Polyhymnia.isSupported()) {
    // Elements
    playButton = document.createElement('button');
    stopButton = document.createElement('button');
    element.insertBefore(playButton, codeElement);
    element.insertBefore(stopButton, codeElement);
    playButton.className = 'play';
    stopButton.className = 'stop';
    // M19,15l-8,4V9L19,15z
    playButton.innerHTML = '<svg x="0px" y="0px" width="28px" height="28px"><circle fill="#fff" stroke="#ddd" stroke-width="2" cx="14" cy="14" r="12"/><path fill="#ddd" d="M19,14l-8,5V9L19,14z"/></svg>';
    stopButton.innerHTML = '<svg x="0px" y="0px" width="28px" height="28px"><circle fill="#fff" stroke="#ddd" stroke-width="2" cx="14" cy="14" r="12"/><rect fill="#ddd" x="10" y="10" width="8" height="8"/></svg>';

    // Events
    playButton.addEventListener('click', self.play);
    stopButton.addEventListener('click', self.stop);
  }

  // Rendering
  highlightCode();
};

MiniPlayer.instances = [];