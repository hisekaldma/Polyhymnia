
extension Lexer {
    
    func lexFunctionToken() {
        let start = pos
        var token: Token
        
        switch current {
        case "0"..."9":            token = scanNumber()
        case "a"..."z", "A"..."Z": token = scanName()
        default:                   token = .unknown
        }
        
        // Function token should end now, otherwise unknown
        while !finished && current != " " && current != "\t" && current != "\n" && current != "," {
            consume()
            token = .unknown
        }
        
        createToken(token, start: start)
    }
}
