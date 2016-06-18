
enum Note: Equatable {
    case c, cSharp, cFlat
    case d, dSharp, dFlat
    case e, eSharp, eFlat
    case f, fSharp, fFlat
    case g, gSharp, gFlat
    case a, aSharp, aFlat
    case b, bSharp, bFlat

    var numerical: Int {
        switch self {
        case c,      bSharp: return 0
        case cSharp, dFlat:  return 1
        case d:              return 2
        case dSharp, eFlat:  return 3
        case e,      fFlat:  return 4
        case eSharp, f:      return 5
        case fSharp, gFlat:  return 6
        case g:              return 7
        case gSharp, aFlat:  return 8
        case a:              return 9
        case aSharp, bFlat:  return 10
        case b,      cFlat:  return 11
        }
    }
}
