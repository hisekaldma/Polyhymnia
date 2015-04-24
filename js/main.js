document.addEventListener('DOMContentLoaded', function() {
  var context;
  var setupContext = function() {
    return new Polyhymnia.Context({
      instruments: [
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
            { root: 'C',  octave: 5, url: '/audio/MarimbaC6.mp3' },
            { root: 'F#', octave: 5, url: '/audio/MarimbaF_6.mp3' }
          ]
        },
        {
          name: 'Pad',
          samples: [
            { root: 'C', octave: 1, url: '/audio/BreathC1.mp3' },
            { root: 'C', octave: 2, url: '/audio/BreathC2.mp3' },
            { root: 'C', octave: 3, url: '/audio/BreathC3.mp3' },
            { root: 'C', octave: 4, url: '/audio/BreathC4.mp3' },
            { root: 'C', octave: 5, url: '/audio/BreathC5.mp3' }
          ]
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