
extension Lexer {
    
    var patternTokenFinished: Bool {
        return finished || current == " " || current == "\t" || current == "\n" || current == ","
    }
    
    func lexPatternToken() {
        let startPos = pos
        let startCol = col
        var token: Token
        
        // Try to scan a note
        switch current {
        case "|":                  token = .bar;  consume()
        case "_":                  token = .rest; consume()
        case "0"..."7":            token = scanDegree()
        case "I","i","V","v":      token = scanDegreeChord()
        case "A"..."G":            token = scanNoteOrChord()
        case "x","X","o","O":      token = scanHit()
        default:                   token = .unknown
        }
        
        // If that doesn't work, try to scan a name instead
        if !patternTokenFinished {
            rewind(to: startPos, col: startCol)
            switch current {
            case "a"..."z", "A"..."Z": token = scanName()
            default:                   token = .unknown
            }
        }
        
        // Pattern token should end now, otherwise we've got an unknown
        while !patternTokenFinished {
            consume()
            token = .unknown
        }
        
        createToken(token, start: startPos)
    }
    
    func scanNoteOrChord() -> Token {
        let note     = scanNote()
        let octave   = scanOctave()
        let chord    = scanChord()
        let velocity = scanVelocity() ?? .standard
        
        if let note = note {
            if let chord = chord {
                return .regularChord(note, chord, octave, velocity)
            } else {
                return .regularNote(note, octave, velocity)
            }
        } else {
            return .unknown
        }
    }
    
    /// (C|D|E|F|G|A|B)(#b)?
    func scanNote() -> Note? {
        switch (current, lookahead(1)) {
        case ("C", "#"): consume(2); return .cSharp
        case ("C", "b"): consume(2); return .cFlat
        case ("C",   _): consume(1); return .c
        case ("D", "#"): consume(2); return .dSharp
        case ("D", "b"): consume(2); return .dFlat
        case ("D",   _): consume(1); return .d
        case ("E", "#"): consume(2); return .eSharp
        case ("E", "b"): consume(2); return .eFlat
        case ("E",   _): consume(1); return .e
        case ("F", "#"): consume(2); return .fSharp
        case ("F", "b"): consume(2); return .fFlat
        case ("F",   _): consume(1); return .f
        case ("G", "#"): consume(2); return .gSharp
        case ("G", "b"): consume(2); return .gFlat
        case ("G",   _): consume(1); return .g
        case ("A", "#"): consume(2); return .aSharp
        case ("A", "b"): consume(2); return .aFlat
        case ("A",   _): consume(1); return .a
        case ("B", "#"): consume(2); return .bSharp
        case ("B", "b"): consume(2); return .bFlat
        case ("B",   _): consume(1); return .b
        default: return nil
        }
    }
    
    /// 0|1|2|3|4|5|6|7|8|-1|-2
    func scanOctave() -> Octave {
        switch (current, lookahead(1)) {
        case ("0",   _): consume(1); return .number(0)
        case ("1",   _): consume(1); return .number(1)
        case ("2",   _): consume(1); return .number(2)
        case ("3",   _): consume(1); return .number(3)
        case ("4",   _): consume(1); return .number(4)
        case ("5",   _): consume(1); return .number(5)
        case ("6",   _): consume(1); return .number(6)
        case ("7",   _): consume(1); return .number(7)
        case ("8",   _): consume(1); return .number(8)
        case ("-", "1"): consume(2); return .number(-1)
        case ("-", "2"): consume(2); return .number(-1)
        default: return .standard
        }
    }
    
    /// (M|m|aug|dim|dom)7?
    func scanChord() -> Chord? {
        var chord: Chord
        
        switch (current, lookahead(1), lookahead(2)) {
        case ("M",   _,   _): consume(1); chord = .maj
        case ("m",   _,   _): consume(1); chord = .min
        case ("a", "u", "g"): consume(3); chord = .aug
        case ("d", "i", "m"): consume(3); chord = .dim
        case ("d", "o", "m"): consume(3); chord = .dom7
        default: return nil
        }
        
        switch (current, chord) {
        case ("7", .maj): consume(); chord = .maj7
        case ("7", .min): consume(); chord = .min7
        case ("7", .aug): consume(); chord = .aug7
        case ("7", .dim): consume(); chord = .dim7
        default: break
        }
        
        return chord
    }
    
    /// 0|1|2|3|4|5|6|7
    func scanDegree() -> Token {
        let degree: Degree
        
        switch current {
        case "1": consume(); degree = .i
        case "2": consume(); degree = .ii
        case "3": consume(); degree = .iii
        case "4": consume(); degree = .iv
        case "5": consume(); degree = .v
        case "6": consume(); degree = .vi
        case "7": consume(); degree = .vii
        default: return .unknown
        }
        
        let velocity = scanVelocity() ?? .standard
        
        return .degreeNote(degree, velocity)
    }
    
    /// (IV|III|II|I|VII|VI|V)+?7?
    /// (iv|iii|ii|i|vii|vi|v)°?7?
    func scanDegreeChord() -> Token {
        let degree: Degree
        var chord: Chord
        
        switch (current, lookahead(1), lookahead(2)) {
        case ("I", "V",   _): consume(2); degree = .iv;  chord = .maj
        case ("I", "I", "I"): consume(3); degree = .iii; chord = .maj
        case ("I", "I",   _): consume(2); degree = .ii;  chord = .maj
        case ("I",   _,   _): consume(1); degree = .i;   chord = .maj
        case ("V", "I", "I"): consume(3); degree = .vii; chord = .maj
        case ("V", "I",   _): consume(2); degree = .vi;  chord = .maj
        case ("V",   _,   _): consume(1); degree = .v;   chord = .maj
        case ("i", "v",   _): consume(2); degree = .iv;  chord = .min
        case ("i", "i", "i"): consume(3); degree = .iii; chord = .min
        case ("i", "i",   _): consume(2); degree = .ii;  chord = .min
        case ("i",   _,   _): consume(1); degree = .i;   chord = .min
        case ("v", "i", "i"): consume(3); degree = .vii; chord = .min
        case ("v", "i",   _): consume(2); degree = .vi;  chord = .min
        case ("v",   _,   _): consume(1); degree = .v;   chord = .min
        default: return .unknown
        }
        
        switch (current, chord) {
        case ("+", .maj): consume(); chord = .aug
        case ("°", .min): consume(); chord = .dim
        default: break
        }
        
        switch (current, chord) {
        case ("7", .maj): consume(); chord = .maj7
        case ("7", .min): consume(); chord = .min7
        case ("7", .aug): consume(); chord = .aug7
        case ("7", .dim): consume(); chord = .dim7
        default: break
        }
        
        let velocity = scanVelocity() ?? .standard
        
        return .degreeChord(degree, chord, velocity)
    }
    
    /// x|X|o|O
    func scanHit() -> Token {
        var hit: Velocity
        
        switch current {
        case "x": consume(); hit = .soft
        case "X": consume(); hit = .hard
        case "o": consume(); hit = .soft
        case "O": consume(); hit = .hard
        default: return .unknown
        }
        
        let velocity = scanVelocity() ?? hit
        
        return .hit(velocity)
    }
    
    /// .(ppp|fff|pp|ff|mp|mf|p|f)
    func scanVelocity() -> Velocity? {
        if "." == current {
            consume()
        } else {
            return nil
        }
        
        switch (current, lookahead(1), lookahead(2)) {
        case ("p", "p", "p"): consume(3); return .ppp
        case ("p", "p",   _): consume(2); return .pp
        case ("p",   _,   _): consume(1); return .p
        case ("f", "f", "f"): consume(3); return .fff
        case ("f", "f",   _): consume(2); return .ff
        case ("f",   _,   _): consume(1); return .f
        case ("m", "p",   _): consume(2); return .mp
        case ("m", "f",   _): consume(2); return .mf
        default: return nil
        }
    }
}
