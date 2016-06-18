
enum Scale: Equatable {
    case major
    case minor
    
    var numerical: [Int] {
        switch self {
        case major:  return [0, 2, 4, 5, 7, 9, 11]
        case minor:  return [0, 2, 3, 5, 7, 8, 10]
        }
    }
}
