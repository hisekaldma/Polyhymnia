
enum Velocity: Equatable {
    case standard
    case ppp
    case pp
    case p
    case mp
    case mf
    case f
    case ff
    case fff
    case soft
    case hard
    case number(Int)

    var numerical: Int {
        switch self {
        case standard:      return 72
        case ppp:           return 16
        case pp:            return 32
        case p:             return 48
        case mp:            return 64
        case mf:            return 80
        case f:             return 96
        case ff:            return 112
        case fff:           return 127
        case soft:          return 64
        case hard:          return 127
        case let number(v): return v
        }
    }
}

func ==(lhs: Velocity, rhs: Velocity) -> Bool {
    switch (lhs, rhs) {
    case (.standard, .standard):         return true
    case (.ppp,     .ppp):               return true
    case (.pp,      .pp):                return true
    case (.p,       .p):                 return true
    case (.mp,      .mp):                return true
    case (.mf,      .mf):                return true
    case (.f,       .f):                 return true
    case (.ff,      .ff):                return true
    case (.fff,     .fff):               return true
    case (.soft,    .soft):              return true
    case (.hard,    .hard):              return true
    case let (.number (l), .number (r)): return l == r
    default:                             return false
    }
}
