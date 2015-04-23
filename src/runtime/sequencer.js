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

    // Play the output patterns
    var highlightSymbols = [];
    for (var i = 0; i < output.patterns.length; i++) {
      var instrument = output.patterns[i].instrument;
      var pattern    = output.patterns[i].pattern;
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

          // But highlight all notes, even pauses
          highlightSymbols.push({
            start: notes[n].start,
            end:   notes[n].end
          });
        }
      }
    }

    // Also highlight all references
    for (var r = 0; r < output.references.length; r++) {
      highlightSymbols.push({
        start: output.references[r].start,
        end:   output.references[r].end
      });
    }

    // Sort highlight symbols
    highlightSymbols = highlightSymbols.sort(function(a, b) {
      return a.start - b.start;
    });

    // Set up callback for animation
    var delay = time - audioContext.currentTime; 
    if (highlightSymbols.length > 0 && self.animCallback) {
      window.setTimeout(function() {
        self.animCallback(highlightSymbols);
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
