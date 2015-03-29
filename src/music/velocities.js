var Polyhymnia = Polyhymnia || {};

Polyhymnia.Velocities = (function() {
  'use strict';
  var self = {};

  var velocities = {
    'ppp': 16,
    'pp':  32,
    'p':   48,
    'mp':  64,
    'mf':  80,
    'f':   96,
    'ff':  112,
    'fff': 127
  };

  // Gets the midi velocity of a named velocity
  self.fromName = function(name) {
    if (name in velocities) {
      return velocities[name];
    } else {
      return [];
    }
  };

  return self;
})();