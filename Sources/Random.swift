import Darwin

let random: (Int) -> Int = {
    Int(arc4random_uniform(UInt32($0)))
}
