
enum Degree: Equatable {
    case I
    case II
    case III
    case IV
    case V
    case VI
    case VII

    var numerical: Int {
        switch self {
        case I:   return 0
        case II:  return 1
        case III: return 2
        case IV:  return 3
        case V:   return 4
        case VI:  return 5
        case VII: return 6
        }
    }
}
