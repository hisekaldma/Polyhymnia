---
layout: text
title: Language guide
---

# Language guide
Polyhymnia is a live programming language for composing music. It combines ideas from generative grammars and music theory into a language that is both graceful and easy to learn, yet powerful and expressive.

__Polyhymnia is still in the design stage. Some things will change. Some things won’t.__

## Patterns
The basic unit in Polyhymnia is the pattern. Patterns are the building blocks that you use to build up your composition.

    C D E F

A pattern consists of a number of steps, each with something that you want to play, like a note, chord, or drum hit.

### Notes
A note is simply a standard note on the western musical scale:

    C D E F G A B C

Notes can be sharp (`#`) or flat (`b`):

    C# Eb F# Ab

If you don’t write anything else, Polyhymnia will assume that your notes are in the middle octave (3). To play notes in other octaves, just add the octave number after the note:

    C4 Eb5 F2 Ab3

### Chords
A chord is a set of three or more notes played together. They are based on a root note, and can be major (`M`), minor (`m`), diminished (`dim`), augmented (`aug`), or dominant (`dom`).

    CM Fm GM Bdim

Chords can also be extended with a fourth note, the so-called seventh. This is done by adding a seven (`7`) after the chord:

    CM7 Fm GM7 Bdim

Chords can take any note as their root note: flats, sharps, and notes in different octaves.

    C4M F#5dim7 Gb2M B-1dim

### Scale Degrees
Instead of writing specific notes, you can also write scale degrees. A scale degree is the position of a note in the current scale, relative to the tonic. For example, in the C major scale, `1` means C, `2` means B, etc.

    1 2 3 4 5 6 7

Writing notes this way is that it makes it easy to stay within the current scale, without knowing exactly which notes are in it. It also means that if you change the scale, the notes will be automatically transposed. Scale degree notes are always in the middle octave (3).

### Scale Chords
Just like you can write notes based on their position in the current scale, you can write chords based on their position in the current scale. This is done using roman numerals corresponding to the numbers 1-7. Upper case mean a major chord (`I`), and lower case mean a minor chord (`i`). The character `°` means a diminished chord, and `+` means an augmented chord.

    I ii vii° V

This way of writing chords is very useful for exploring chord progressions, since this is the way chords are written in music literature. For example, a common chord progression is:

    I IV V I

The chords in a major scale are:

    I ii iii IV V vi vii°

The chords in a minor scale are:

    i ii° III iv v VI VII

### Velocity
Velocity is how hard a note is played. Higher velocity usually means that the note sounds louder, but it can also change the character of the sound, e.g. making it sharper.

Velocity is measured between 0 and 127, since that’s the MIDI standard. If you don’t write anything else Polyhymnia will assume that notes have the velocity 72, which is roughly in the middle. To change the velocity, just add a period (`.`) after the note, and put the velocity in numbers after that:

    C.32 D.64 E.96 F.127

This works on everything from notes to degrees and chords.

    CM.32 D3m.64 I.96 F#6dim7.127

Instead of numbers, you can also use the abbrevations that are used in classical piano scores for piano, forte, fortissimo, pianissimo, etc.

    C.p D.f E.pp G.ff

The following abbreviations are available:

| `ppp` | pianississimo | very very soft  | 16  |
| `pp`  | pianissimo    | very soft       | 32  |
| `p`   | piano         | soft            | 48  |
| `mp`  | mezzo-piano   | moderately soft | 64  |
| `mf`  | mezzo-forte   | moderately loud | 80  |
| `f`   | forte         | loud            | 96  |
| `ff`  | fortissimo    | very loud       | 112 |
| `fff` | fortississimo | very very loud  | 127 |

### Drums
When writing drum patterns, you don’t really care about which key is playing. You just want to say that the there is a hit. You can do that with the letters x and o.

    x x o o

To make it easier to write varying drum patterns, you can use uppercase X or O to indicate that the hit is a hard one. This is the equivalent of writing x.fff or x.127.

    X x O o

### Rest
Sometimes you want to have steps in your patterns that are silent. You can do that with the underscore (_).

    C E _ G

### Beats
The lengths of the steps in a pattern depend on how many you put in it. For example, if a pattern is four steps, each step will be interpreted as a quarter note.

    x x x x

If a pattern is eight steps, each step will be interpreted as an eighth note.

    x x x x x x x x

If a pattern is sixteen steps, each step will be interpreted as a sixteenth note.

    x x x x x x x x x x x x x x x x

You can even make patterns that aren’t divisible by the time signature.

    x x x x x x x

### Bars
A pattern can be one or more bars long. If you don’t write anything else, Polyhymnia will assume that each pattern is one bar. To create patterns that are more than one bar, use the pipe character (`|`). The steps between each pipe will then be interpreted as one bar.

		I IV | IV V | vi I

## Sequences
When your entire composition is just one pattern, Polyhymnia will just play it. But to actually make something interesting, we probably want to create sequences of patterns.

The first thing we have to do is to name our patterns. To do that, we use the equal sign (`=`).

    P1 = C D E F

Now, we can refer to this pattern by its name. But since we now have more than just one pattern, we need to tell Polyhymnia. We do that using the special name `Play`.

    Play = P1
    P1 = C D E F

What we have here is actually a sequence, only it’s just got one pattern in it. To make it more interesting, we can add another pattern:

    Play = P1 P2
    P1 = C D E F
    P2 = F E D C

Just like you can name patterns, you can also name sequences. Then you can refer to that sequence in another sequence, just like you would with a pattern.

    Play = P1 P2 S1
    S1 = P3 P3
    P1 = C D E F
    P2 = F E D C
    P3 = F F F F

Note that a sequence can only contain names, and a pattern can only contain notes. You can’t mix the two in one definition.

### Names
Pattern and sequence names have to start with an uppercase letter, but after that they can contain lower and uppercase letters, numbers, and underscore (_). However, names cannot be anything that could be confused with a note in a pattern, e.g. `A`, `A1`, `B`, `B1`, `Cm`, `I`, `IV`, or `X`.

### Instruments
So far all patterns have been played on a piano. This is because we haven’t specified what instrument to play them on. If we instead wanted to play some patterns on a specific instrument we just write the name of the instrument and a colon (`:`) followed by the pattern that we want to play:

    Play = Marimba: C D E F

Instruments can take either a pattern or a sequence.

    Play = Marimba: P1 P2
    P1 = C D E F
    P2 = F E D C

Which instruments are available depend on how you’ve set up your environment. If you are using MIDI, you can use the instruments `Midi1` to `Midi16` to output as shortcuts for the different MIDI channels. However, it’s usually much better to give them meaningful names, like `Pad` or `Lead`.

### Polyphony
Everything we’ve looked at so far just played one thing at a time. But you actually play things in parallel too. To do that, you just write each sequence on a separate line:

    Play =
      Kick:  x _ x _
      Hihat: _ _ x _

You can even mix sequences of different lengths in the same rule. They will all just loop, just like you would expect:

    R1 =
      Kick:  K1 K2
      Synth: C D C G
      Pad:   C _ _ _

    K1 = x _ x _
    K2 = x x x x

It’s a good idea to indent the definitions for readability, but you don’t have to.


## Conditions
To make the music interactive, you can write conditions that have to be true for a definition to be played. A condition consists of a parameter and a comparison with one or two numbers:

    R1 =
      (x < 1)     Synth: C C C C
      (1 < x < 2) Synth: G G G G
      (x > 2)     Synth: D D D D

Parameter names have to start with a lowercase letter, and numbers have to be integers. The allowed comparisons are `<` and `>`, and they are inclusive, because that is what you want most of the time. Other comparisons, like `==` and `!=`, aren’t supported. The idea isn’t to check for specific values, but to react to changing inputs.

Conditions are evaluated at the start of a new bar. This means that even if a condition becomes valid in the middle of a bar, new patterns won’t start playing until the next bar, which is what you want musically.