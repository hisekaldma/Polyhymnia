var Polyhymnia = Polyhymnia || {};

Polyhymnia.Notes = (function() {
  'use strict';
  var self = {};

  self.notes = {
    'C':  0,  'B#': 0,
    'C#': 1,  'Db': 1,
    'D':  2,
    'D#': 3,  'Eb': 3,
    'E':  4,  'Fb': 4,
    'E#': 5,  'F':  5,
    'F#': 6,  'Gb': 6,
    'G':  7,
    'G#': 8,  'Ab': 8,
    'A':  9,
    'A#': 10, 'Bb': 10,
    'B':  11, 'Cb': 11
  };

  self.notesReverse = {
    0: 'C',
    1: 'C#',
    2: 'D',
    3: 'D#',
    4: 'E',
    5: 'F',
    6: 'F#',
    7: 'G',
    8: 'G#',
    9: 'A',
    10: 'A#',
    11: 'B'
  };

  // Gets the canonical name of a note
  self.toName = function(midiNumber) {
    return self.notesReverse[midiNumber % 12];
  };

  // Gets the midi note number of a note
  self.fromName = function(name, octave) {
    if (!octave) {
      octave = 3; // Default to the middle octave
    }
    octave += 2; // Octave numbers are -2 to 8, but midi octaves are 0 to 10

    if (name in self.notes)
      return self.notes[name] + octave * 12;
    else
      return 0;
  };

  // Gets the frequency in Hz of a midi note number
  self.toFrequency = function(midiNumber) {
    return 440.0 * Math.pow(2.0, ((midiNumber - 69.0) / 12.0));
  };

  // Gets the nearest midi note number of a frequency in Hz
  self.fromFrequency = function(frequency) {
    return Math.round(69.0 + 12.0 * Math.log(frequency * 0.0022727272727) / Math.LN2);
  };

  return self;
})();