
typealias Step = [MIDINote]

struct Pattern {
    var steps: [Step]
    
    init(steps: [Step]) {
        self.steps = steps
    }
    
    /// Create a pattern with the specified notes
    init(notes: [Note]) {
        self.steps = notes.map { note in
            toMIDI(note: note)
        }
    }
    
    /// Create a pattern with multiple bars of chords
    init(chords: [(Note,Chord)]) {
        self.steps = chords.map { chord in
            toMIDI(root: chord.0, chord: chord.1)
        }
    }
    
    /// The note values of each step in the pattern
    var notes: [[Int]] {
        return steps.map { $0.map { $0.note } }
    }

    /// The velocity values of each step in the pattern
    var velocities: [[Int]] {
        return steps.map { $0.map { $0.velocity } }
    }
}
