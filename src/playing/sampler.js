var Polyhymnia = Polyhymnia || {};

Polyhymnia.Sampler = function(options) {
  'use strict';
  var self = this;

  var audioContext = Polyhymnia.getAudioContext();
  var samples = [];
  var buffers = [];
  var loaded = 0;
  var total = 0;

  // Load samples
  if (options && options.samples) {
    total = options.samples.length;
    for (var i = 0; i < options.samples.length; i++) {
      var root =   options.samples[i].root || 'C';
      var octave = options.samples[i].octave || 4;
      var url =    options.samples[i].url;
      var midiNumber = Polyhymnia.Notes.fromName(root, octave);
      loadSample(midiNumber, url);
    }
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
        loaded++;
        if (loaded == total) {
          fillSampleTable();
        }
      }, function(e) {
        console.log('Error decoding audio file: ' + url);
      });
    };

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

  this.scheduleNote = function(midiNumber, time) {
    var source = audioContext.createBufferSource();
    source.buffer = samples[midiNumber].buffer;
    source.playbackRate.value = samples[midiNumber].pitch;
    source.connect(audioContext.destination);
    source.start(time);
  };

  this.scheduleNotes = function(midiNumbers, time) {
    midiNumbers.forEach(function(midiNumber) {
      self.scheduleNote(midiNumber, time);
    });
  };
};