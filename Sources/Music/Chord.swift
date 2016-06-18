
enum Chord: Equatable {
    case maj
    case min
    case maj7
    case min7
    case dom7
    case aug
    case aug7
    case dim
    case dim7

    var numerical: [Int] {
        switch self {
        case maj:    return [0, 4, 7]
        case min:    return [0, 3, 7]
        case maj7:   return [0, 4, 7, 11]
        case min7:   return [0, 3, 7, 10]
        case dom7:   return [0, 4, 7, 10]
        case aug:    return [0, 4, 8]
        case aug7:   return [0, 4, 8, 10]
        case dim:    return [0, 3, 6]
        case dim7:   return [0, 3, 6, 9]
        }
    }
}
