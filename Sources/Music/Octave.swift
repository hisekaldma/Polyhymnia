
enum Octave: Equatable {
    case standard
    case number(Int)
    
    var numerical: Int {
        switch self {
        case .standard:     return 3 // Default to the middle octave
        case let number(o): return o
        }
    }
}

func ==(lhs: Octave, rhs: Octave) -> Bool {
    switch (lhs, rhs) {
    case (.standard, .standard):         return true
    case let (.number (l), .number (r)): return l == r
    default:                             return false
    }
}
