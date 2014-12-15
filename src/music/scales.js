var Polyhymnia = Polyhymnia || {};

Polyhymnia.Scales = (function() {
  'use strict';
  var self = {};

  self.scales = {
    'major':            [0, 2, 4, 5, 7, 9, 11],
    'minor':            [0, 2, 3, 5, 7, 8, 10],
    'pentatonic-major': [0, 2, 4, 7, 9],
    'pentatonic-minor': [0, 3, 5, 7, 10]
  };

  // Gets the name of a scale
  self.toName = function(numbers) {
    numbers.forEach(function(value, i) {
      numbers[i] = value % 12;
    });

    for (var name in self.scales) {
      var scale = self.scales[name];
      if (scale.length == numbers.length) {
        var correct = true;
        for (var i = 0; i < scale.length; i++) {
          if (scale[i] != numbers[i]) {
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

  // Gets the relative note numbers in a scale
  self.fromName = function(name) {
    if (name in self.scales)
      return self.scales[name];
    else
      return [];
  };

  return self;
})();