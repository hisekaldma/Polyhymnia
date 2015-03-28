var Polyhymnia = Polyhymnia || {};

Polyhymnia.Degrees = (function() {
  'use strict';
  var self = {};
  var degrees = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

  // Generate scale degree chords for a midi number scale
  function generateChords(scale) {
    var chords = {};
    function maj(val) { return val; }
    function min(val) { return val.toLowerCase(); }
    degrees.forEach(function(degree, index) {
      function toScale(n) { return n + scale[index]; }
      chords[maj(degree)]        = [0, 4, 7]    .map(toScale); // Maj
      chords[min(degree)]        = [0, 3, 7]    .map(toScale); // Min
      chords[maj(degree) + '7']  = [0, 4, 7, 11].map(toScale); // Maj 7th
      chords[min(degree) + '7']  = [0, 3, 7, 10].map(toScale); // Min 7th
      chords[maj(degree) + '+']  = [0, 4, 8]    .map(toScale); // Aug
      chords[maj(degree) + '+7'] = [0, 4, 8, 10].map(toScale); // Aug 7th
      chords[min(degree) + '°']  = [0, 3, 6]    .map(toScale); // Dim
      chords[min(degree) + '°7'] = [0, 3, 6, 9] .map(toScale); // Dim 7th
    });
    return chords;
  }

  // Gets the name of a scale degree chord
  self.toName = function(numbers, tonic, scale) {
    if (!scale)
      scale = Polyhymnia.Scales.fromName('major', tonic);
    else
      scale = Polyhymnia.Scales.fromName(scale, tonic);

    var octave = Math.floor(numbers[0] / 12);
    numbers.forEach(function(value, i) {
      numbers[i] = value - 12 * octave + 60;
    });

    var chords = generateChords(scale);
    for (var name in chords) {
      var degree = chords[name];
      if (degree.length == numbers.length) {
        var correct = true;
        for (var i = 0; i < degree.length; i++) {
          if (degree[i] != numbers[i]) {
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

  // Gets the midi note numbers in a scale degree chord
  self.fromName = function(name, tonic, scale) {
    if (!scale)
      scale = Polyhymnia.Scales.fromName('major', tonic);
    else
      scale = Polyhymnia.Scales.fromName(scale, tonic);

    var chords = generateChords(scale);
    if (name in chords) {
      return chords[name];
    } else {
      return [];
    }
  };

  return self;
})();