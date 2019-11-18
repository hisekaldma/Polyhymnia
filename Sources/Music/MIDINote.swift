
struct MIDINote {
    var note: Int
    var velocity: Int
}

func toMIDI(note: Note, octave: Octave = Octave.standard, velocity: Velocity = Velocity.standard) -> [MIDINote] {
    let midiNote     = note.numerical
    let midiOctave   = octave.numerical + 2 // Octave numbers are -2 to 8, but MIDI octaves are 0 to 10
    let midiVelocity = velocity.numerical
    return [MIDINote(note: midiNote + midiOctave * 12, velocity: midiVelocity)]
}

func toMIDI(root: Note, chord: Chord, octave: Octave = Octave.standard, velocity: Velocity = Velocity.standard) -> [MIDINote] {
    let midiRoot     = root.numerical
    let midiNotes    = chord.numerical
    let midiOctave   = octave.numerical + 2 // Octave numbers are -2 to 8, but MIDI octaves are 0 to 10
    let midiVelocity = velocity.numerical
    return midiNotes.map { MIDINote(note: $0 + midiRoot + midiOctave * 12, velocity: midiVelocity) }
}
