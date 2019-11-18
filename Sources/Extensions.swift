
extension Array where Element: Sequence {
    func flattened() -> [Element.Iterator.Element] {
        return self.flatMap { $0 }
    }
}
