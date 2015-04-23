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