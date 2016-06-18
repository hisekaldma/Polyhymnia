
struct TokenInfo: CustomStringConvertible {
    let value: Token
    let start: Int
    let end:   Int
    
    var description: String {
        return "\(value)"
    }
}

enum Token: Equatable {
    case none
    case unknown
    case eol
    case indent
    case dedent
    case assign
    case comma
    case colon
    case bar
    case rest
    case comment      (String)
    case name         (String)
    case number       (Int)
    case hit          (Velocity)
    case regularNote  (Note, Octave, Velocity)
    case regularChord (Note, Chord, Octave, Velocity)
    case degreeNote   (Degree, Velocity)
    case degreeChord  (Degree, Chord, Velocity)
}

func ==(lhs: Token, rhs: Token) -> Bool {
    switch (lhs, rhs) {
    case (.none,    .none):                                            return true
    case (.unknown, .unknown):                                         return true
    case (.eol,     .eol):                                             return true
    case (.indent,  .indent):                                          return true
    case (.dedent,  .dedent):                                          return true
    case (.assign,  .assign):                                          return true
    case (.comma,   .comma):                                           return true
    case (.colon,   .colon):                                           return true
    case (.bar,     .bar):                                             return true
    case (.rest,    .rest):                                            return true
    case let (.comment     (l),           .comment     (r)):           return l == r
    case let (.name        (l),           .name        (r)):           return l == r
    case let (.number      (l),           .number      (r)):           return l == r
    case let (.hit         (lv),          .hit         (rv)):          return lv == rv
    case let (.regularNote (ln,lo,lv),    .regularNote (rn,ro,rv)):    return ln == rn && lo == ro && lv == rv
    case let (.regularChord(ln,lc,lo,lv), .regularChord(rn,rc,ro,rv)): return ln == rn && lo == ro && lv == rv && lc == rc
    case let (.degreeNote  (ld,lv),       .degreeNote  (rd,rv)):       return ld == rd && lv == rv
    case let (.degreeChord (ld,lc,lv),    .degreeChord (rd,rc,rv)):    return ld == rd && lv == rv && lc == rc
    default:                                                           return false
    }
}
