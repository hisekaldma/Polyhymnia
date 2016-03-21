
enum Note: Equatable {
    case C, Csharp, Cflat
    case D, Dsharp, Dflat
    case E, Esharp, Eflat
    case F, Fsharp, Fflat
    case G, Gsharp, Gflat
    case A, Asharp, Aflat
    case B, Bsharp, Bflat

    var numerical: Int {
        switch self {
        case C,      Bsharp: return 0
        case Csharp, Dflat:  return 1
        case D:              return 2
        case Dsharp, Eflat:  return 3
        case E,      Fflat:  return 4
        case Esharp, F:      return 5
        case Fsharp, Gflat:  return 6
        case G:              return 7
        case Gsharp, Aflat:  return 8
        case A:              return 9
        case Asharp, Bflat:  return 10
        case B,      Cflat:  return 11
        }
    }
}