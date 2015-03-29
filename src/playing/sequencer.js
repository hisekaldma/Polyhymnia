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
      var pattern    = patterns[i].pattern;
      var noteLength = getNoteLength(pattern.length);
      var noteNumber = Math.floor(stepInBar / noteLength);

      if (noteNumber < pattern.length) {
        var notes = pattern[noteNumber];
        if (!Array.isArray(notes)) {
          notes = [notes];
        }

        for (var n = 0; n < notes.length; n++) {
          // Only trigger the note if we're on step 0 of it
          if (stepInBar % noteLength === 0) {
            scheduleNote(instrument, notes[n], time);
          }

          // But always animate it
          animateNotes.push(notes[n]);
        }
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

  function scheduleNote(instrument, note, time) {
    if (self.instruments[instrument] && note.key) {
      self.instruments[instrument].scheduleNote(note.key, note.velocity, time);
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