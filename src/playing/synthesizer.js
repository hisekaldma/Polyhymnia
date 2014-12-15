var Polyhymnia = Polyhymnia || {};

Polyhymnia.Synthesizer = function(options) {
  'use strict';
  var self = this;
  
  options = options || {};
  var wave =    options.wave    || 'square';
  var attack =  options.attack  || 0.05; // s
  var decay =   options.decay   || 0.1;  // s
  var sustain = options.sustain || 0.8;  // gain
  var release = options.release || 0.3;  // s

  var audioContext = Polyhymnia.getAudioContext();

  this.scheduleNote = function(midiNumber, time) {
    // Gain
    var gain = audioContext.createGain();
    gain.connect(audioContext.destination);
    gain.gain.value = 0;

    // Oscillator
    var osc = audioContext.createOscillator();
    osc.type = wave;
    osc.frequency.value = Polyhymnia.Notes.toFrequency(midiNumber);
    osc.connect(gain);

    // Play, envelope, stop
    osc.start(time);
    gain.gain.linearRampToValueAtTime(0.0,                   time + 0.0001); // Offset to avoid click/pop
    gain.gain.linearRampToValueAtTime(1.0,                   time + attack);
    gain.gain.linearRampToValueAtTime(sustain, time + attack + decay);
    gain.gain.linearRampToValueAtTime(0.0,                   time + attack + decay + release);
    osc.stop(time + attack + decay + release + 0.0001);
  };

  this.scheduleNotes = function(midiNumbers, time) {
    midiNumbers.forEach(function(midiNumber) {
      self.scheduleNote(midiNumber, time);
    });
  };
};