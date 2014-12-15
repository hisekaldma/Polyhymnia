var Polyhymnia = Polyhymnia || {};

Polyhymnia.Sequencer = function() {
  'use strict';
  var noteType = Polyhymnia.noteType;
  var self = this;

  this.measure = { num: 4, den: 4 };
  this.stepsPerBeat = 16;
  this.generator = null;
  this.animCallback = undefined;

  var patterns = [];
  var audioContext = Polyhymnia.getAudioContext();

  this.scheduleStep = function(step, time) {
    // Calculate where we're at
    var stepInBar = step % (self.stepsPerBeat * self.measure.num);

    // Generate new patterns if we have to
    if (stepInBar === 0) {
      var rule = self.generator.getNextRule();
      patterns = rule ? rule.patterns : [];
    }

    // Play the patterns
    var animateNotes = [];
    for (var i = 0; i < patterns.length; i++) {
      var instrument = patterns[i].instrument;
      var pattern = patterns[i].pattern;
      var noteLength = getNoteLength(pattern.length);
      var noteNumber = Math.floor(stepInBar / noteLength);

      if (noteNumber < pattern.length) {
        // Only trigger the note if we're on step 0 of it
        var note = pattern[noteNumber];
        if (stepInBar % noteLength === 0) {
          scheduleNote(instrument, note.type, note.value, time);
        }

        // But always animate it
        animateNotes.push(note);
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

  function scheduleNote(instrument, type, value, time) {
    // Convert value to relative midi numbers
    var midiNumbers = [];
    if (type == noteType.NOTE) {
      midiNumbers = [Polyhymnia.Notes.fromName(value)];
    } else if (type == noteType.CHORD) {
      var intonation = value.substr(1,1);
      var root, chord;
      if (intonation == '#' || intonation == 'b') {
        root = Polyhymnia.Notes.fromName(value.substr(0,2));
        chord = Polyhymnia.Chords.fromName(value.substr(2));
      } else {
        root = Polyhymnia.Notes.fromName(value.substr(0,1));
        chord = Polyhymnia.Chords.fromName(value.substr(1));
      }

      midiNumbers = chord.map(function(note) {
        return note + root;
      });
    } else if (type == noteType.DRUM) {
      midiNumbers = [Polyhymnia.Notes.fromName('C')];
    }

    // Play notes
    self.generator.instruments[instrument].scheduleNotes(midiNumbers, time);
  }

  function getNoteLength(patternLength) {
    var noteLengths = [1, 2, 4, 8, 16, 32, 64];
    var noteLength = self.stepsPerBeat;
    for (var n = 0; n < noteLengths.length; n++) {
      if (patternLength < self.measure.num * noteLengths[n] / 4) {
        break;
      }
      noteLength = self.stepsPerBeat * 4 / noteLengths[n];
    }
    return noteLength;
  }
};