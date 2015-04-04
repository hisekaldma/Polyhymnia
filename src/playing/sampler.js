var Polyhymnia = Polyhymnia || {};

Polyhymnia.Sampler = function(options) {
  'use strict';
  var self = this;

  options = options || {};
  var attack  = options.attack  || 0.01; // s
  var decay   = options.decay   || 0.1;  // s
  var sustain = options.sustain || 1.0;  // gain
  var release = options.release || 0.7;  // s

  var audioContext = Polyhymnia.getAudioContext();
  var voices = {};
  var samples = [];
  var buffers = [];
  var loaded = 0;
  var total = 0;

  // Load samples
  if (options && options.samples) {
    options.samples.forEach(function(sample) {
      var root =   sample.root || 'C';
      var octave = sample.octave || 4;
      var url =    sample.url;
      var midiNumber = Polyhymnia.Notes.fromName(root, octave);
      loadSample(midiNumber, url);
      total++;
    });
  }

  function loadSample(midiNumber, url) {
    // Load audio file asynchronously
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function() {
      // Decode audio data asynchronously
      audioContext.decodeAudioData(request.response, function(buffer) {
        console.log('Loaded ' + url);
        buffers[midiNumber] = buffer;
        always();
      }, function(e) {
        console.log('Error decoding audio file: ' + url);
        always();
      });
    };

    function always() {
      loaded++;
      if (loaded >= total) {
        fillSampleTable();
      }
    }    

    request.send();
  }

  function fillSampleTable() {
    // Fill gaps in sample table by pitching samples up/down
    for (var m = 0; m < 128; m++) {
      if (buffers[m] !== undefined) {
        // Sample found for this note. Just use it unpitched
        samples[m] = { buffer: buffers[m], pitch: 1 };
      } else {
        // No sample for this note. Find the closest sample below/above
        var below, above;
        for (var b = 0; b < m; b++) {
          if (buffers[b])
            below = b;
        }
        for (var a = 127; a > m; a--) {
          if (buffers[a])
            above = a;
        }

        // Find which is closer: above or below
        var closest;
        if (above && below) {
          if (above - m < m - below) {
            closest = above;
          } else {
            closest = below;
          }
        } else if (above) {
          closest = above;
        } else if (below) {
          closest = below;
        }

        // Figure out how much to pitch the sample
        if (closest) {
          var wantedFreq = Polyhymnia.Notes.toFrequency(m);
          var sampleFreq = Polyhymnia.Notes.toFrequency(closest);
          var pitch = wantedFreq / sampleFreq;
          samples[m] = { buffer: buffers[closest], pitch: pitch, orig: closest };
        }
      }
    }
  }

  this.scheduleNoteOn = function(midiNumber, velocity, time) {
    var voice = {};
    var volume = velocity / 127;

    // Gain
    voice.gain = audioContext.createGain();
    voice.gain.connect(audioContext.destination);
    voice.gain.gain.value = 0;

    // Source
    voice.source = audioContext.createBufferSource();
    voice.source.buffer = samples[midiNumber].buffer;
    voice.source.playbackRate.value = samples[midiNumber].pitch;
    voice.source.connect(voice.gain);

    // Play, attack, decay
    voice.source.start(time);
    voice.gain.gain.linearRampToValueAtTime(0.0,              time + 0.0001); // Offset to avoid click/pop
    voice.gain.gain.linearRampToValueAtTime(volume,           time + attack);
    voice.gain.gain.linearRampToValueAtTime(volume * sustain, time + attack + decay);

    voices[midiNumber] = voice;
  };

  this.scheduleNoteOff = function(midiNumber, velocity, time) {
    var voice = voices[midiNumber];

    // Release, stop
    voice.gain.gain.linearRampToValueAtTime(0.0, time + release);
    voice.source.stop(time + release + 0.0001);

    delete voices[midiNumber];
  };

  this.allNotesOff = function() {
    for (var voice in voices) {
      voices[voice].source.stop();
    }
  };  
};