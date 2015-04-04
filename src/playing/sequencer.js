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

  var output = [];
  var audioContext = Polyhymnia.getAudioContext();

  this.scheduleStep = function(step, time) {
    // Calculate where we're at
    var stepInBar = step % (self.stepsPerBeat * self.timeSignature.num);

    // If we've reached the end of a bar, generate new output
    if (stepInBar === 0) {
      if (step > 0) {
        self.generator.step();
      }
      output = self.generator.getCurrentBar();
    }

    // Play the output
    var animateNotes = [];
    for (var i = 0; i < output.length; i++) {
      var instrument = output[i].instrument;
      var pattern    = output[i].pattern;
      var noteLength = getNoteLength(pattern.length);
      var noteNumber = Math.floor(stepInBar / noteLength);

      if (noteNumber < pattern.length) {
        var notes = pattern[noteNumber];
        if (!Array.isArray(notes)) {
          notes = [notes];
        }

        for (var n = 0; n < notes.length; n++) {
          // Only trigger real notes, not pauses
          if (notes[n].key) {
            // Trigger NOTE ON if we're on the first step of a note
            if (stepInBar % noteLength === 0) {
              scheduleNoteOn(instrument, notes[n], time);
            }
            // Trigger NOTE OFF if we're on the last step of the note
            if (stepInBar % noteLength === noteLength - 1) {
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