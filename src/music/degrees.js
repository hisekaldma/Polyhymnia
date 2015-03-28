var Polyhymnia = Polyhymnia || {};

Polyhymnia.Degrees = (function() {
  'use strict';
  var self = {};

  var degrees = [
    'i',
    'ii',
    'iii',
    'iv',
    'v',
    'vi',
    'vii'
  ];

  var chords = {
    'maj':    [0, 4, 7],
    'min':    [0, 3, 7],
    'maj7':   [0, 4, 7, 11],
    'min7':   [0, 3, 7, 10],
    'aug':    [0, 4, 8],
    'aug7':   [0, 4, 8, 10],
    'dim':    [0, 3, 6],
    'dim7':   [0, 3, 6, 9]
  };

  // Generate scale degree chords for a midi number scale
  function generateChords(scale) {
    var c = {};
    function maj(val) { return val.toUpperCase(); }
    function min(val) { return val; }
    degrees.forEach(function(degree, index) {
      function toScale(n) { return n + scale[index]; }
      c[maj(degree)]        = chords.maj  .map(toScale); // Maj
      c[min(degree)]        = chords.min  .map(toScale); // Min
      c[maj(degree) + '7']  = chords.maj7 .map(toScale); // Maj 7th
      c[min(degree) + '7']  = chords.min7 .map(toScale); // Min 7th
      c[maj(degree) + '+']  = chords.aug  .map(toScale); // Aug
      c[maj(degree) + '+7'] = chords.aug7 .map(toScale); // Aug 7th
      c[min(degree) + '°']  = chords.dim  .map(toScale); // Dim
      c[min(degree) + '°7'] = chords.dim7 .map(toScale); // Dim 7th
    });
    return c;
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
      scale = Polyhymnia.Scales.fromName('major', tonic); // Default to major
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