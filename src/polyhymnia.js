var Polyhymnia = Polyhymnia || {};

Polyhymnia.getAudioContext = function() {
  'use strict';
  if (!Polyhymnia.audioContext) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    Polyhymnia.audioContext = new AudioContext();
  }
  return Polyhymnia.audioContext;
};

Polyhymnia.isSupported = function() {
  'use strict';
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  if (window.AudioContext) {
    return true;
  } else {
    return false;
  }
};

Polyhymnia.Context = function(options) {
  'use strict';

  if (!Polyhymnia.isSupported()) {
    return {
      play: function() { },
      stop: function() { },
      setParam: function() { },
      setRules: function() { },
      setTempo: function() { },
      setAnimCallback: function() { }
    };
  }

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
    options.instruments.forEach(function(instrument) {
      sequencer.instruments[instrument.name] = new Polyhymnia.Sampler(instrument);
    });
  }

  function parse(code) {
    var tokens = Polyhymnia.tokenize(code);
    var result = Polyhymnia.parse(tokens);
    result     = Polyhymnia.validate(result, sequencer.instruments);
    generator.setRules(result.rules);
    return result;
  }

  function play() {
    metronome.play();
  }

  function stop() {
    metronome.stop();
    sequencer.stop();
    generator.reset();
  }

  function setTempo(tempo) {
    metronome.tempo = tempo;
  }

  function setTimeSignature(numerator, denominator) {
    sequencer.timeSignature.num = numerator;
    sequencer.timeSignature.den = denominator;
  }

  function setTonic(tonic) {
    generator.tonic = tonic;
  }

  function setScale(scale) {
    generator.scale = scale;
  }

  function setAnimCallback(callback) {
    sequencer.animCallback = callback;
  }

  return {
    parse: parse,
    play: play,
    stop: stop,
    setParam: generator.setParam,
    setTempo: setTempo,
    setTonic: setTonic,
    setScale: setScale,
    setTimeSignature: setTimeSignature,
    setAnimCallback: setAnimCallback
  };
};