var Polyhymnia = Polyhymnia || {};

Polyhymnia.Synthesizer = function(options) {
  'use strict';
  var self = this;
  
  options = options || {};
  var wave    = options.wave    || 'square';
  var attack  = options.attack  || 0.05; // s
  var decay   = options.decay   || 0.1;  // s
  var sustain = options.sustain || 0.8;  // gain
  var release = options.release || 0.3;  // s

  var audioContext = Polyhymnia.getAudioContext();
  var voices = {};

  this.scheduleNoteOn = function(midiNumber, velocity, time) {
    var voice = {};

    // Gain
    voice.gain = audioContext.createGain();
    voice.gain.connect(audioContext.destination);
    voice.gain.gain.value = 0;

    // Oscillator
    voice.osc = audioContext.createOscillator();
    voice.osc.type = wave;
    voice.osc.frequency.value = Polyhymnia.Notes.toFrequency(midiNumber);
    voice.osc.connect(voice.gain);

    // Play, attack, decay
    voice.osc.start(time);
    var volume = velocity / 127;
    voice.gain.gain.linearRampToValueAtTime(0.0,              time + 0.0001); // Offset to avoid click/pop
    voice.gain.gain.linearRampToValueAtTime(volume,           time + attack);
    voice.gain.gain.linearRampToValueAtTime(volume * sustain, time + attack + decay);

    voices[midiNumber] = voice;
  };

  this.scheduleNoteOff = function(midiNumber, velocity, time) {
    var voice = voices[midiNumber];

    // Release, stop
    voice.gain.gain.linearRampToValueAtTime(0.0, time + release);
    voice.osc.stop(time + release + 0.0001);

    delete voices[midiNumber];
  };

  this.allNotesOff = function() {
    for (var voice in voices) {
      voices[voice].osc.stop();
    }
  };
};