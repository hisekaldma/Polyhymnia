---
layout: sidenav
title: Language guide
---

# Language guide
Polyhymnia is a live programming language for composing music. It combines ideas from generative grammars and music theory into a language that is both graceful and easy to learn, yet powerful and expressive.

__Polyhymnia is still in the design stage. Some things will change. Some things won’t.__

## Patterns
The basic unit in Polyhymnia is the pattern. Patterns are the building blocks that you use to build up your composition. A pattern is simply a list of steps, each with something that you want to play, like a note, chord, or drum hit.

    C D E F

### Notes
A note is simply a standard note on the Western chromatic scale.

    C D E F G A B C

Notes can be sharp (`#`) or flat (`b`).

    C# Eb F# Ab

### Octaves
Notes are assumed to be in the in the middle octave by default. To play notes in other octaves, just add the number of the octave after the note.

    C4 Eb5 F2 Ab3

Octaves are numbered as they are in most MIDI software, so middle C is C3. The lowest octave is -2, and the highest octave is 8.

### Chords
A chord is a set of three or more notes played together. They are based on a root note, and can be major (`M`), minor (`m`), diminished (`dim`), augmented (`aug`), or dominant (`dom`).

    CM Fm GM Bdim

Chords can also be extended with a fourth note, the so-called seventh. This is done by adding a seven (`7`) after the chord:

    CM7 Fm GM7 Bdim

The root note can be flat or sharp, and in any octave.

    C4M F#5dim7 Gb2M B-1dim

### Scale Degrees
Instead of writing notes in a specific scale, you can also write notes as relative to the current scale. You do this using regular numbers. For example, in the C major scale, `1` means `C`, `2` means `D`, etc.

    1 2 3 4 5 6 7

Writing notes this way is that it makes it easy to stay within the current scale, without knowing exactly which notes are in it. It also means that if you change the scale, the notes will be automatically transposed. Scale degrees are always in the middle octave.

### Scale Chords
Just like you can write notes relative to the current scale, you can write chords relative to the current scale. This is done using roman numerals corresponding to the numbers 1-7. An uppercase numeral means a major chord (`I`), and a lowercase numeral means a minor chord (`i`). The character `°` means a diminished chord, and `+` means an augmented chord.

    I II+ vii° V

This way of writing chords is very useful for exploring chord progressions, since much of music literature writes chords this way. For example, a common chord progression is:

    I IV V I

The chords in a major scale are:

    I ii iii IV V vi vii°

The chords in a minor scale are:

    i ii° III iv v VI VII

### Velocity
Velocity is how hard a note is played. Higher velocity usually means that the note sounds louder, but it can also change the character of the sound, e.g. making it sharper.

Velocity is measured between 0 and 127, since that’s the MIDI standard. The default velocity is 72, which is roughly in the middle. To use another velocity, just add a period (`.`) after the note, and put the velocity after that:

    C.32 D.64 E.96 F.127

This works on everything from notes to degrees and chords.

    CM.32 D3m.64 I.96 F#6dim7.127

Instead of numbers, you can also use the abbreviations that are used in classical piano scores for piano, forte, fortissimo, pianissimo, etc.

    C.p D.f E.pp G.ff

The following abbreviations are available:

| `ppp` | pianississimo | very very soft  |  16 |
| `pp`  | pianissimo    | very soft       |  32 |
| `p`   | piano         | soft            |  48 |
| `mp`  | mezzo-piano   | moderately soft |  64 |
| `mf`  | mezzo-forte   | moderately loud |  80 |
| `f`   | forte         | loud            |  96 |
| `ff`  | fortissimo    | very loud       | 112 |
| `fff` | fortississimo | very very loud  | 127 |

### Drums
When writing drum patterns, you don’t really care about which key is playing. You just want to say that there is a hit. You can do that with the letters x and o.

    x x o o

To make it easier to write dynamic drum patterns, you can use uppercase `X` or `O` to indicate that the hit is a hard one. This is the same as writing `x.fff` or `x.127`.

    X x O o

### Rests
Sometimes you want to have steps in your patterns that are silent. You can do that with the underscore (`_`).

    C E _ G

### Beats
The standard length of a pattern is one bar. Each of the steps will be interpreted as one nth of the length, where n is the number of steps. For example, if a pattern is four steps, each step is a quarter note.

    x x x x

If a pattern is eight steps, each step is an eighth note.

    x x x x x x x x

If a pattern is sixteen steps, each step is a sixteenth note.

    x x x x x x x x x x x x x x x x

You can even make patterns where the number of steps isn’t divisible by the time signature.

    x x x x x x x

### Bars
To create patterns that are longer than just one bar, use the pipe character (`|`). The steps between each pipe will then be interpreted as one bar.

    x x | x x x x | x x x | x

## Sequences
When your entire composition is just one pattern, it plays without any fuzz. But to actually make something more interesting, we usually want to create sequences of patterns. The first thing we have to do is to name our patterns. To do that, we use the equal sign (`=`).

    P1 = C D Eb F

Now, we can refer to this pattern by its name in a sequence. Creating a sequence is just as simple as creating a pattern. Just write the name, an equal sign, and the sequence.

    Play = P1 P1
    P1 = C D Eb F

Note that the sequence is named `Play`. This is a special name. When we have more than one pattern, we need to tell Polyhymnia where to start. `Play` does that. Now let’s make the sequence more interesting by adding another pattern:

    Play = P1 P1 P2
    P1 = C D Eb F
    P2 = G G Gm F F Fm

### Nested Sequences
Just like you can name patterns, you can also name sequences. You can then refer to them in other sequences, just like you can with patterns.

    Play = P1 P1 P2 S1
    S1 = P3 P3
    P1 = C D Eb F
    P2 = G G Gm F F Fm
    P3 = Cm Fm

Note that a sequence can only contain names, and a pattern can only contain pattern steps. If you try to mix the two in one definition you will get an error.

    Play = Cm Fm P1
    P1 = C D Eb F

Also note that you cannot make recursive sequences, i.e. sequences that refer to themselves. Doing so will give you an error.

    Play = P1 Play
    P1 = C D Eb F

### Instruments
So far everything has been played on a piano. That’s because we haven’t specified an instrument. To play a pattern on a specific instrument we write the name of the instrument and a colon (`:`) followed by the pattern.

    Play = Bass: C2 D2 | Eb1 F1

To play an entire sequence on a specific instrument, we just write the sequence after the instrument name instead.

    Play = Lead: P1 P2
    P1 = C D Eb F
    P2 = G G Gm F F Fm

Which instruments are available depends on how you’ve set up Polyhymnia.

## Rules
Patterns and sequences are collectively called rules. On the left hand side is the name of the rule, and on the right hand side is its definition. A rule is simply a way of saying ”when you find this name, replace it with it’s definition.”

    Name = D E F

### Names
Rule names have to start with an uppercase letter, but after that they can contain lower and uppercase letters, numbers, and underscore (`_`). However, names cannot be anything that could be confused with a step in a pattern, like a note or a drum hit. So names like `A`, `A1`, `Cm`, `I`, `IV`, and `X` are out.

### Polyphony
All rules we’ve looked at so far has only played one thing at a time. But you actually play things in parallel. You do that by giving a rule multiple definitions. Just write each definition on a separate line, and they will be played in parallel. It’s a good idea to indent the definitions for readability, but you don’t have to.

    Play =
      Kick:  x _ x _
      Hihat: _ x _ x

You can add any number of definitions you want to a rule, and you can even mix pattern definitions and sequence definitions.

    Play =
      Kick:  x _ x _
      Hihat: _ x _ x
      Lead:  P1 P2

    P1 = C D Eb F
    P2 = G G Gm F F Fm

If you have parallel definitions that are of different lengths, they will loop until they all end at the same time. For example, if one definition is two bars, and another is three bars, the entire rule will play 2 x 3 = 6 bars.

    Play = S1 S2

    S1 =
      Kick:  x _ x _ | x _ x _ | x _ _ x x x
      Snare: _ x _ x | _ _ _ _ x x

    S2 =
      Kick:  x _ _ x x x
      Snare: _ _ _ _ x x
      Hihat: X x x X x x

## Conditions
To make the music react to inputs, you can write conditions that have to be true for a definition to be played. A condition consists of a named input and a comparison with one or two numbers:

    R1 =
      (x < 1)     C C C C
      (1 < x < 2) G G G G
      (x > 2)     D D D D

Input names have to start with a lowercase letter, and numbers have to be integers. The allowed comparisons are `<` and `>`, and they are inclusive, because that is what you want most of the time. Other comparisons, like `==` and `!=`, aren’t supported. The idea isn’t to check for specific values, but to react to changing inputs.

Conditions are evaluated at the start of a new bar. This means that even if a condition becomes valid in the middle of a bar, new patterns won’t start playing until the next bar, which is what you want musically.

## Comments
You can comment your code with the `*` character.

    * This is a comment.

Comments won’t affect what is playing. But they’re great for structuring your composition, or making notes to yourself. Comments can either be on their own lines, or at the end of another line.

    Play = P1 P2
    P1 = C D Eb F  * This is also a comment.
    P2 = G G Gm F F Fm
