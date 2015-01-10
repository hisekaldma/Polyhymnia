var Polyhymnia = Polyhymnia || {};

Polyhymnia.Chords = (function() {
  'use strict';
  var self = {};

  self.chords = {
    'M':      [0, 4, 7],
    'm':      [0, 3, 7],
    'M7':     [0, 4, 7, 11],
    'm7':     [0, 3, 7, 10],
    'dom7':   [0, 4, 7, 10],
    'aug':    [0, 4, 8],
    'aug7':   [0, 4, 8, 10],
    'dim':    [0, 3, 6],
    'dim7':   [0, 3, 6, 9]
  };

  // Gets the name of a chord
  self.toName = function(numbers) {
    numbers.forEach(function(value, i) {
      numbers[i] = value % 12;
    });

    for (var name in self.chords) {
      var chord = self.chords[name];
      if (chord.length == numbers.length) {
        var correct = true;
        for (var i = 0; i < chord.length; i++) {
          if (chord[i] != numbers[i]) {
            correct = false;
          }
        }
        if (correct) {
          return name;
        }
      }
    }
    return '';
  };

  // Gets the relative note numbers in a chord
  self.fromName = function(name) {
    if (name in self.chords)
      return self.chords[name];
    else
      return [];
  };

  return self;
})();