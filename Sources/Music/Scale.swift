
enum Scale: Equatable {
    case Major
    case Minor
    
    var numerical: [Int] {
        switch self {
        case Major:  return [0, 2, 4, 5, 7, 9, 11]
        case Minor:  return [0, 2, 3, 5, 7, 8, 10]
        }
    }
}