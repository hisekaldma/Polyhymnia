
enum Chord: Equatable {
    case Maj
    case Min
    case Maj7
    case Min7
    case Dom7
    case Aug
    case Aug7
    case Dim
    case Dim7

    var numerical: [Int] {
        switch self {
        case Maj:    return [0, 4, 7]
        case Min:    return [0, 3, 7]
        case Maj7:   return [0, 4, 7, 11]
        case Min7:   return [0, 3, 7, 10]
        case Dom7:   return [0, 4, 7, 10]
        case Aug:    return [0, 4, 8]
        case Aug7:   return [0, 4, 8, 10]
        case Dim:    return [0, 3, 6]
        case Dim7:   return [0, 3, 6, 9]
        }
    }
}