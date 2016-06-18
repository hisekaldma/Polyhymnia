typealias Char = UInt16

final class Lexer {
    let tabSize = 2
    
    var source = ""
    var tokens = [TokenInfo]()
    var indents = [0]
    var chars: [Char]
    var context: Context = .pattern
    var pos = 0
    var col = 0

    init(source: String) {
        // Use UTF16 to iterate through string for performance,
        // and to make char counts work with NSAttributedString
        self.source = source
        self.chars = Array(source.utf16)
    }
    
    var finished: Bool {
        return pos >= chars.count
    }
    
    func consume(_ steps: Int = 1) {
        self.pos += steps
        self.col += steps
    }
    
    func rewind(to pos: Int, col: Int) {
        self.pos = pos
        self.col = col
    }
    
    var current: Char {
        if pos < chars.count {
            return chars[pos]
        } else {
            return 0
        }
    }
    
    func lookahead(_ steps: Int) -> Char {
        let index = pos + steps
        if index < chars.count {
            return chars[index]
        } else {
            return 0
        }
    }
    
    // Create a token
    func createToken(_ value: Token) {
        tokens.append(TokenInfo(value: value, start: pos-1, end: pos))
    }
    
    func createToken(_ value: Token, start: Int) {
        tokens.append(TokenInfo(value: value, start: start, end: pos))
    }
    
    // Lex indentation at the start of a line
    func lexIndents() {
        // Based on Python
        lexing: while current != 0 {
            switch current {
            case " ":
                consume()
            case "\t":
                consume()
                col += tabSize - 1
            case "\n":
                return // Lines with only whitespace don't affect indentation
            case "#":
                return // Lines with comments don't affect indentation
            default:
                break lexing
            }
        }
        
        // Create indent token
        if col > indents.last {
            createToken(.indent)
            indents.append(col)
        }
        
        // Create dedent tokens
        while col < indents.last {
            createToken(.dedent)
            indents.removeLast()
        }
    }
    
    // Lex comment until the end of the line
    func lexComment() {
        let start = pos
        var comment = ""
        
        lexing: while !finished {
            switch current {
            case "\n":
                break lexing
            default:
                comment.append(current)
                consume()
            }
        }
        
        createToken(.comment(comment), start: start)
    }
    
    // Scan a name
    func scanName() -> Token {
        var string = ""
        
        lexing: while !finished {
            switch current {
            case "a"..."z", "A"..."Z", "0"..."9":
                string.append(current)
                consume()
            default:
                break lexing
            }
        }
        
        return .name(string)
    }
    
    // Scan an integer
    func scanNumber() -> Token {
        var string = ""
        
        // Lex leading digits
        integer: while !finished {
            switch current {
            case "0"..."9":
                string.append(current)
                consume()
            default:
                break integer
            }
        }
        
        return .number(Int(string)!)
    }
    
    // Scan unknown stuff, until we find something known
    func scanUnknown() -> Token {
        lexing: while !finished {
            switch current {
            case " ",
            "\t",
            "\n",
            ",",
            ":",
            "=",
            "|",
            "_":
                break lexing
            default:
                consume()
            }
        }
        
        return .unknown
    }
    
    func lexNewline() {
        consume()
        
        // Reset column and context
        col = 0
        context = .pattern
        
        // Skip empty lines
        while current == "\n"  {
            consume()
        }
        
        createToken(.eol)
    }
    
    func lexToken(_ token: Token) {
        consume()
        createToken(token)
    }
    
    func lex() -> [TokenInfo] {
        lexing: while !finished {
            // Indentation
            if col == 0 {
                lexIndents()
            }
            
            // Regular tokens
            switch current {
            case " ":  consume(); continue lexing
            case "\t": consume(); continue lexing
            case ",":  lexToken(.comma); context = .function
            case ":":  lexToken(.colon)
            case "=":  lexToken(.assign)
            case "\n": lexNewline()
            default:
                switch context {
                case .pattern:  lexPatternToken()
                case .function: lexFunctionToken()
                }
            }
        }
        
        // Always end with a line break
        if tokens.count > 0 && tokens.last?.value != .eol {
            createToken(.eol)
        }
        
        // Clear remaining indentation
        while indents.last > 0 {
            createToken(.dedent)
            indents.removeLast()
        }
        
        return tokens
    }
    
    class func lex(_ source: String) -> [TokenInfo] {
        let lexer = Lexer(source: source)
        return lexer.lex()
    }
    
    enum Context {
        case pattern
        case function
    }
}

// Make string literals work as char literals
extension Char: UnicodeScalarLiteralConvertible {
    public init(unicodeScalarLiteral value: UnicodeScalar) {
        self.init(value.value)
    }
}

extension String {
    mutating func append(_ u: Char) {
        self.append(UnicodeScalar(u))
    }
}
