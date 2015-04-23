var Polyhymnia = Polyhymnia || {};

Polyhymnia.Sequencer = function() {
  'use strict';
  var noteType = Polyhymnia.noteType;
  var self = this;
  
  this.instruments = {};
  this.timeSignature = { num: 4, den: 4 };
  this.ticksPerQuarter = 48;
  this.generator = null;
  this.animCallback = undefined;

  var output = [];
  var audioContext = Polyhymnia.getAudioContext();

  this.scheduleTick = function(tick, time) {
    // Calculate where we're at
    var quartersInBar = self.timeSignature.num * 4 / self.timeSignature.den;
    var ticksInBar = self.ticksPerQuarter * quartersInBar;
    var tickInBar = tick % ticksInBar;

    // If we've reached the end of a bar, generate new output
    if (tickInBar === 0) {
      if (tick > 0) {
        self.generator.step();
      }
      output = self.generator.getCurrentBar();
    }

    // Play the output
    var animateNotes = [];
    for (var i = 0; i < output.length; i++) {
      var instrument = output[i].instrument;
      var pattern    = output[i].pattern;
      var stepLength = Math.round(ticksInBar / pattern.length);
      var stepNumber = Math.floor(tickInBar / stepLength);

      // If there is no instrument, choose one
      if (!instrument) {
        // If piano is available, use that
        if (self.instruments.Piano) {
          instrument = 'Piano';
        }
        // Otherwise use the first instrument available
        else {
          for (var inst in self.instruments) {
            instrument = inst;
            break;
          }
        }
      }

      if (stepNumber < pattern.length) {
        var notes = pattern[stepNumber];
        if (!Array.isArray(notes)) {
          notes = [notes];
        }

        for (var n = 0; n < notes.length; n++) {
          // Only trigger real notes, not pauses
          if (notes[n].key) {
            // Trigger NOTE ON if we're on the first step of a note
            if (tickInBar % stepLength === 0) {
              scheduleNoteOn(instrument, notes[n], time);
            }
            // Trigger NOTE OFF if we're on the last step of the note
            if (tickInBar % stepLength === stepLength - 1) {
              scheduleNoteOff(instrument, notes[n], time);
            }
          }

          // But animate all notes, even pauses
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

  this.stop = function() {
    for (var instrument in self.instruments) {
      self.instruments[instrument].allNotesOff();
    }
  };

  function scheduleNoteOn(instrument, note, time) {
    if (self.instruments[instrument]) {
      self.instruments[instrument].scheduleNoteOn(note.key, note.velocity, time);
    }
  }

  function scheduleNoteOff(instrument, note, time) {
    if (self.instruments[instrument]) {
      self.instruments[instrument].scheduleNoteOff(note.key, note.velocity, time);
    }
  }
};
