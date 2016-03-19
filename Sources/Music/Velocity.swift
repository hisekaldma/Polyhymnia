
enum Velocity: Equatable {
    case Default
    case PPP
    case PP
    case P
    case MP
    case MF
    case F
    case FF
    case FFF
    case Number(Int)

    var numerical: Int {
        switch self {
        case Default:       return 72
        case PPP:           return 16
        case PP:            return 32
        case P:             return 48
        case MP:            return 64
        case MF:            return 80
        case F:             return 96
        case FF:            return 112
        case FFF:           return 127
        case let Number(v): return v
        }
    }
}

func ==(lhs: Velocity, rhs: Velocity) -> Bool {
    switch (lhs, rhs) {
    case (.Default, .Default):           return true
    case (.PPP,     .PPP):               return true
    case (.PP,      .PP):                return true
    case (.P,       .P):                 return true
    case (.MP,      .MP):                return true
    case (.MF,      .MF):                return true
    case (.F,       .F):                 return true
    case (.FF,      .FF):                return true
    case (.FFF,     .FFF):               return true
    case let (.Number (l), .Number (r)): return l == r
    default:                             return false
    }
}