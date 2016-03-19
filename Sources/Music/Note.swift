
enum Note: Equatable {
    case C, Csharp, Cb
    case D, Dsharp, Db
    case E, Esharp, Eb
    case F, Fsharp, Fb
    case G, Gsharp, Gb
    case A, Asharp, Ab
    case B, Bsharp, Bb

    var numerical: Int {
        switch self {
        case C,  Bsharp: return 0
        case Csharp, Db: return 1
        case D:          return 2
        case Dsharp, Eb: return 3
        case E,      Fb: return 4
        case Esharp, F:  return 5
        case Fsharp, Gb: return 6
        case G:          return 7
        case Gsharp, Ab: return 8
        case A:          return 9
        case Asharp, Bb: return 10
        case B,      Cb: return 11
        }
    }
}