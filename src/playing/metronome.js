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