
enum Degree: Equatable {
    case i
    case ii
    case iii
    case iv
    case v
    case vi
    case vii

    var numerical: Int {
        switch self {
        case i:   return 0
        case ii:  return 1
        case iii: return 2
        case iv:  return 3
        case v:   return 4
        case vi:  return 5
        case vii: return 6
        }
    }
}
