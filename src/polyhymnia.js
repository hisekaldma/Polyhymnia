var Polyhymnia = Polyhymnia || {};

Polyhymnia.getAudioContext = function() {
  'use strict';
  if (!Polyhymnia.audioContext) {
    Polyhymnia.audioContext = new AudioContext();
  }
  return Polyhymnia.audioContext;
};

Polyhymnia.isSupported = function() {
  'use strict';
  return window.AudioContext !== undefined;
};

Polyhymnia.Context = function(options) {
  'use strict';

  // Generator
  var generator = new Polyhymnia.Generator();
  generator.setParam('x', 0);
  generator.instruments = {};
  
  // Sequencer
  var sequencer = new Polyhymnia.Sequencer();
  sequencer.generator = generator;

  // Metronome
  var metronome = new Polyhymnia.Metronome();
  metronome.sequencer = sequencer;
  if (options && options.tempo) {
    metronome.tempo = options.tempo;
  }

  // Instruments
  if (options && options.instruments) {
    for (var i = 0; i < options.instruments.length; i++) {
      var instrument = options.instruments[i];
      generator.instruments[instrument.name] = new Polyhymnia.Sampler({
        samples: instrument.samples
      });
    }
  }

  function setAnimCallback(callback) {
    sequencer.animCallback = callback;
  }

  return {
    play: metronome.play,
    stop: metronome.stop,
    setParam: generator.setParam,
    setRules: generator.setRules,
    setAnimCallback: setAnimCallback
  };
};