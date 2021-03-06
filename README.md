Polyhymnia
==========

Polyhymnia is a programming language for composing music. It lets you write rules that evaluate to sequences and patterns of notes, chords and drums.

**Polyhymnia is still in the design stage. Some things will change. Some things won’t.**

## Getting started

The best way to try Polyhymnia is in the [online playgroud](http://polyhymnia.io).

## Build from source

To build Polyhymnia from source:

1. Clone the repository and run `grunt` to build Polyhymnia.

2. Add `polyhymnia.min.js` to your project.

  ```html
  <script src="js/polyhymnia.min.js"></script>
  ```

3. Create a `Context` object, and pass in samples for your instruments:

  ```js
  var context = new Polyhymnia.Context({
    instruments: [
      { name: 'Kick', samples: [{ url: 'audio/Kick.mp3' }] },
      { name: 'Snare', samples: [{ url: 'audio/Snare.mp3' }] },
      { name: 'Hihat', samples: [{ url: 'audio/Hihat.mp3' }] },
      {
        name: 'Pad',
        samples: [
          { root: 'C', octave: 1, url: 'audio/PadC1.mp3' },
          { root: 'C', octave: 2, url: 'audio/PadC2.mp3' },
          { root: 'C', octave: 3, url: 'audio/PadC3.mp3' },
          { root: 'C', octave: 4, url: 'audio/PadC4.mp3' },
          { root: 'C', octave: 5, url: 'audio/PadC5.mp3' }
        ]
      }
    ]
  });
  ```

4. Pass the code you want to play to the Context object:

  ```js
  context.parse('Play = Pad: C D E F');
  ```

5. Play it:

  ```js
  context.play();
  ```

## Requirements
Polyhymnia runs in the browser and uses the Web Audio API, which is part of HTML5. It should work in all modern browsers, including Safari on iOS and Chrome on Android. You won’t have much luck with Internet Explorer.
