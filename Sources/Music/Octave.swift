
enum Octave: Equatable {
    case Default
    case Number(Int)
    
    var numerical: Int {
        switch self {
        case Default:       return 3 // Default to the middle octave
        case let Number(o): return o
        }
    }
}

func ==(lhs: Octave, rhs: Octave) -> Bool {
    switch (lhs, rhs) {
    case (.Default, .Default):           return true
    case let (.Number (l), .Number (r)): return l == r
    default:                             return false
    }
}