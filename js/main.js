document.addEventListener('DOMContentLoaded', function() {
  var context;
  var setupContext = function() {
    return new Polyhymnia.Context({
      instruments: [
        {
          name: 'Piano',
          samples: [
            { root: 'C',  octave: -2, url: '/audio/PianoC-2.mp3' },
            { root: 'F#', octave: -2, url: '/audio/PianoF_-2.mp3' },
            { root: 'C',  octave: -1, url: '/audio/PianoC-1.mp3' },
            { root: 'F#', octave: -1, url: '/audio/PianoF_-1.mp3' },
            { root: 'C',  octave: 0, url: '/audio/PianoC0.mp3' },
            { root: 'F#', octave: 0, url: '/audio/PianoF_0.mp3' },
            { root: 'C',  octave: 1, url: '/audio/PianoC1.mp3' },
            { root: 'F#', octave: 1, url: '/audio/PianoF_1.mp3' },
            { root: 'C',  octave: 2, url: '/audio/PianoC2.mp3' },
            { root: 'F#', octave: 2, url: '/audio/PianoF_2.mp3' },
            { root: 'C',  octave: 3, url: '/audio/PianoC3.mp3' },
            { root: 'F#', octave: 3, url: '/audio/PianoF_3.mp3' },
            { root: 'C',  octave: 4, url: '/audio/PianoC4.mp3' },
            { root: 'F#', octave: 4, url: '/audio/PianoF_4.mp3' },
            { root: 'C',  octave: 5, url: '/audio/PianoC5.mp3' },
            { root: 'F#', octave: 5, url: '/audio/PianoF_5.mp3' },
            { root: 'C',  octave: 6, url: '/audio/PianoC6.mp3' },
            { root: 'F#', octave: 6, url: '/audio/PianoF_6.mp3' },
            { root: 'C',  octave: 7, url: '/audio/PianoC7.mp3' },
            { root: 'F#', octave: 7, url: '/audio/PianoF_7.mp3' },
            { root: 'C',  octave: 8, url: '/audio/PianoC8.mp3' },
            { root: 'F#', octave: 8, url: '/audio/PianoF_8.mp3' }
          ],
          release: 0.6
        },
        {
          name: 'Marimba',
          samples: [
            { root: 'C',  octave: 1, url: '/audio/MarimbaC1.mp3' },
            { root: 'F#', octave: 1, url: '/audio/MarimbaF_1.mp3' },
            { root: 'C',  octave: 2, url: '/audio/MarimbaC2.mp3' },
            { root: 'F#', octave: 2, url: '/audio/MarimbaF_2.mp3' },
            { root: 'C',  octave: 3, url: '/audio/MarimbaC3.mp3' },
            { root: 'F#', octave: 3, url: '/audio/MarimbaF_3.mp3' },
            { root: 'C',  octave: 4, url: '/audio/MarimbaC4.mp3' },
            { root: 'F#', octave: 4, url: '/audio/MarimbaF_4.mp3' },
            { root: 'C',  octave: 5, url: '/audio/MarimbaC5.mp3' },
            { root: 'F#', octave: 5, url: '/audio/MarimbaF_5.mp3' },
            { root: 'C',  octave: 6, url: '/audio/MarimbaC6.mp3' },
            { root: 'F#', octave: 6, url: '/audio/MarimbaF_6.mp3' }
          ]
        },
        {
          name: 'Bass',
          samples: [
            { root: 'C',  octave: 1, url: '/audio/BassC1.mp3' },
            { root: 'F#', octave: 1, url: '/audio/BassF_1.mp3' },
            { root: 'C',  octave: 2, url: '/audio/BassC2.mp3' },
            { root: 'F#', octave: 2, url: '/audio/BassF_2.mp3' },
            { root: 'C',  octave: 3, url: '/audio/BassC3.mp3' },
            { root: 'F#', octave: 3, url: '/audio/BassF_3.mp3' },
            { root: 'C',  octave: 4, url: '/audio/BassC4.mp3' },
            { root: 'F#', octave: 4, url: '/audio/BassF_4.mp3' },
            { root: 'C',  octave: 5, url: '/audio/BassC5.mp3' },
            { root: 'F#', octave: 5, url: '/audio/BassF_5.mp3' }
          ],
          release: 0.3
        },
        {
          name: 'Lead',
          samples: [
            { root: 'C',  octave: 1, url: '/audio/LeadC1.mp3' },
            { root: 'F#', octave: 1, url: '/audio/LeadF_1.mp3' },
            { root: 'C',  octave: 2, url: '/audio/LeadC2.mp3' },
            { root: 'F#', octave: 2, url: '/audio/LeadF_2.mp3' },
            { root: 'C',  octave: 3, url: '/audio/LeadC3.mp3' },
            { root: 'F#', octave: 3, url: '/audio/LeadF_3.mp3' },
            { root: 'C',  octave: 4, url: '/audio/LeadC4.mp3' },
            { root: 'F#', octave: 4, url: '/audio/LeadF_4.mp3' },
            { root: 'C',  octave: 5, url: '/audio/LeadC5.mp3' },
            { root: 'F#', octave: 5, url: '/audio/LeadF_5.mp3' }
          ],
          release: 0.3
        },
        {
          name: 'Pad',
          samples: [
            { root: 'C',  octave: 1, url: '/audio/PadC1.mp3' },
            { root: 'C',  octave: 2, url: '/audio/PadC2.mp3' },
            { root: 'C',  octave: 3, url: '/audio/PadC3.mp3' },
            { root: 'C',  octave: 4, url: '/audio/PadC4.mp3' },
            { root: 'C',  octave: 5, url: '/audio/PadC5.mp3' }
          ],
          attack:  0.5,
          release: 4.0
        },
        { name: 'Kick',      samples: [{ url: '/audio/Kick.mp3' }] },
        { name: 'Snare',     samples: [{ url: '/audio/Snare.mp3' }] },
        { name: 'Hihat',     samples: [{ url: '/audio/Hihat.mp3' }] },
        { name: 'HihatOpen', samples: [{ url: '/audio/HihatOpen.mp3' }] },
        { name: 'Clap',      samples: [{ url: '/audio/Clap.mp3' }] },
        { name: 'Shake',     samples: [{ url: '/audio/Shake.mp3' }] }
      ]
    });
  };

  // Editor
  var editor = document.querySelector('.editor');
  if (editor) {
    context = context || setupContext();
    new Editor(editor, context);    
  }

  // Code examples
  var codeExamples = document.querySelectorAll('pre');
  if (codeExamples.length > 0) {
    context = context || setupContext();
    for (var i = 0; i < codeExamples.length; i++) {
      new MiniPlayer(codeExamples[i], context);
    }
  }

  // Side nav
  var sidenav = document.querySelector('.sidenav');
  if (sidenav) {
    // Headings
    var headings = document.querySelectorAll('h2, h3');
    var base = sidenav.querySelector('ul');
    for (var i = 0; i < headings.length; i++) {
      var heading = headings[i];
      var parent;

      // Handle subnavs
      if (heading.nodeName == 'H2') {
        parent = base;
      } else if (heading.nodeName == 'H3') {
        if (parent == base) {
          var ul = document.createElement('ul');
          ul.className = 'dropdown-menu';
          li.appendChild(ul);
          parent = ul;
        }
      }

      var li = document.createElement('li');
      li.className = heading.id;
      li.innerHTML = '<a href="#' + heading.id + '">' + heading.textContent + '</a>';
      parent.appendChild(li);
    }

    // Scrollspy
    $('body').scrollspy({ target: '.sidenav' });
  }
});