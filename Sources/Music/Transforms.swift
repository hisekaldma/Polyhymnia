
extension Pattern {
    
    /// Transposes the notes in the pattern X semitones up or down
    mutating func transpose(semitones: Int) {
        for (s, step) in steps.enumerated() {
            for (n, _) in step.enumerated() {
                steps[s][n].note += semitones
            }
        }
    }
    
    /// Transposes the notes in the pattern X octaves up or down
    mutating func transpose(octaves: Int) {
        for (s, step) in steps.enumerated() {
            for (n, _) in step.enumerated() {
                steps[s][n].note += octaves * 12
            }
        }
    }
    
    /// Reverses the steps in the pattern.
    mutating func reverse() {
        steps.reverse()
    }

    /// Maps each chord in the pattern to a sequence of single notes.
    mutating func arpeggio(sequence: [Int]) {
        var result: [Step] = []
        for step in steps {
            for index in sequence {
                result.append([step[index - 1]])
            }
        }
        steps = result
    }
    
    /// Adds a rest after each step in the pattern.
    mutating func staccato() {
        var result: [Step] = []
        for step in steps {
            result.append(step)
            result.append([])
        }
        steps = result
    }
    
    /// Repeats each step in the pattern X times.
    mutating func stutter(times: Int) {
        var result: [Step] = []
        for step in steps {
            for _ in 0..<times {
                result.append(step)
            }
        }
        steps = result
    }
    
    /// Keeps the even steps in the pattern, and replaces the rest with rests.
    mutating func even() {
        for i in 0..<steps.count {
            if i % 2 == 0 {
                steps[i] = []
            }
        }
    }
    
    /// Keeps the odd steps in the pattern, and replaces the rest with rests.
    mutating func odd() {
        for i in 0..<steps.count {
            if i % 2 == 1 {
                steps[i] = []
            }
        }
    }
    
    /// Keeps the Nth steps in the pattern, and replaces the rest with rests.
    mutating func nth(n: Int) {
        for i in 0..<steps.count {
            if i % n == 0 {
                steps[i] = []
            }
        }
    }
    
    /// Keeps roughly 50% of the steps in the pattern, and replaces the rest with rests.
    mutating func some() {
        
    }
    
    /// Keeps roughly X% of the steps in the pattern, and replaces the rest with rests.
    mutating func probability(percent: Int) {
        
    }
}
