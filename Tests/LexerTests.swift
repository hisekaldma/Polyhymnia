
import XCTest
@testable import Pulse

class LexerTests: XCTestCase {
    
    func testEmptyString() {
        let tokens = Lexer.lex("")
        assertEqual(tokens.count, 0)
    }
    
    func testEOL() {
        let tokens = Lexer.lex("\n")
        assertEqual(tokens[0].value, .eol)
    }
    
    func testNames() {
        let tokens = Lexer.lex("R1 r2 s X1 Intro Chords")
        
        assertEqual(tokens[0].value, .name("R1"))
        assertEqual(tokens[1].value, .name("r2"))
        assertEqual(tokens[2].value, .name("s"))
        assertEqual(tokens[3].value, .name("X1"))
        assertEqual(tokens[4].value, .name("Intro"))
        assertEqual(tokens[5].value, .name("Chords"))
    }
    
    func testSymbols() {
        let tokens = Lexer.lex("= : | _ ,")
        
        assertEqual(tokens[0].value, .assign)
        assertEqual(tokens[1].value, .colon)
        assertEqual(tokens[2].value, .bar)
        assertEqual(tokens[3].value, .rest)
        assertEqual(tokens[4].value, .comma)
    }
    
    func testNotes() {
        let tokens = Lexer.lex("C D# Eb F3 G#3 A-1 Bb-1")
        
        assertEqual(tokens[0].value, .regularNote(.c,      .standard,   .standard))
        assertEqual(tokens[1].value, .regularNote(.dSharp, .standard,   .standard))
        assertEqual(tokens[2].value, .regularNote(.eFlat,  .standard,   .standard))
        assertEqual(tokens[3].value, .regularNote(.f,      .number(3),  .standard))
        assertEqual(tokens[4].value, .regularNote(.gSharp, .number(3),  .standard))
        assertEqual(tokens[5].value, .regularNote(.a,      .number(-1), .standard))
        assertEqual(tokens[6].value, .regularNote(.bFlat,  .number(-1), .standard))
    }
    
    func testChords() {
        let tokens = Lexer.lex("CM Dm E#dom Fbaug7 Gdim7 C3M D-1m E#4dom Fb-1aug7 G0dim7")
        
        assertEqual(tokens[0].value, .regularChord(.c,      .maj,  .standard,   .standard))
        assertEqual(tokens[1].value, .regularChord(.d,      .min,  .standard,   .standard))
        assertEqual(tokens[2].value, .regularChord(.eSharp, .dom7, .standard,   .standard))
        assertEqual(tokens[3].value, .regularChord(.fFlat,  .aug7, .standard,   .standard))
        assertEqual(tokens[4].value, .regularChord(.g,      .dim7, .standard,   .standard))
        assertEqual(tokens[5].value, .regularChord(.c,      .maj,  .number(3),  .standard))
        assertEqual(tokens[6].value, .regularChord(.d,      .min,  .number(-1), .standard))
        assertEqual(tokens[7].value, .regularChord(.eSharp, .dom7, .number(4),  .standard))
        assertEqual(tokens[8].value, .regularChord(.fFlat,  .aug7, .number(-1), .standard))
        assertEqual(tokens[9].value, .regularChord(.g,      .dim7, .number(0),  .standard))
    }
    
    func testDegreeNotes() {
        let tokens = Lexer.lex("1 2 3 4 5 6 7")
        
        assertEqual(tokens[0].value, .degreeNote(.i,   .standard))
        assertEqual(tokens[1].value, .degreeNote(.ii,  .standard))
        assertEqual(tokens[2].value, .degreeNote(.iii, .standard))
        assertEqual(tokens[3].value, .degreeNote(.iv,  .standard))
        assertEqual(tokens[4].value, .degreeNote(.v,   .standard))
        assertEqual(tokens[5].value, .degreeNote(.vi,  .standard))
        assertEqual(tokens[6].value, .degreeNote(.vii, .standard))
    }
    
    func testDegreeChords() {
        let tokens = Lexer.lex("I ii iii° IV+ V7 vi7 vii°7 I+7")
        
        assertEqual(tokens[0].value, .degreeChord(.i,   .maj,  .standard))
        assertEqual(tokens[1].value, .degreeChord(.ii,  .min,  .standard))
        assertEqual(tokens[2].value, .degreeChord(.iii, .dim,  .standard))
        assertEqual(tokens[3].value, .degreeChord(.iv,  .aug,  .standard))
        assertEqual(tokens[4].value, .degreeChord(.v,   .maj7, .standard))
        assertEqual(tokens[5].value, .degreeChord(.vi,  .min7, .standard))
        assertEqual(tokens[6].value, .degreeChord(.vii, .dim7, .standard))
        assertEqual(tokens[7].value, .degreeChord(.i,   .aug7, .standard))
    }
    
    func testHits() {
        let tokens = Lexer.lex("x X o O")
        
        assertEqual(tokens[0].value, .hit(.soft))
        assertEqual(tokens[1].value, .hit(.hard))
        assertEqual(tokens[2].value, .hit(.soft))
        assertEqual(tokens[3].value, .hit(.hard))
    }
    
    func testVelocities() {
        let tokens = Lexer.lex("C4.f Dm.ff 5.fff II.ppp x.pp X.p")
        
        assertEqual(tokens[0].value, .regularNote(.c, .number(4), .f))
        assertEqual(tokens[1].value, .regularChord(.d, .min, .standard, .ff))
        assertEqual(tokens[2].value, .degreeNote(.v, .fff))
        assertEqual(tokens[3].value, .degreeChord(.ii, .maj, .ppp))
        assertEqual(tokens[4].value, .hit(.pp))
        assertEqual(tokens[5].value, .hit(.p))
    }
    
    func testNumbers() {
        let tokens = Lexer.lex(", 0 1 10 100")
        
        assertEqual(tokens[1].value, .number(0))
        assertEqual(tokens[2].value, .number(1))
        assertEqual(tokens[3].value, .number(10))
        assertEqual(tokens[4].value, .number(100))
    }
    
    func testInvalidNotes() {
        let tokens = Lexer.lex("CA Da Fb78 D-1a E#a")
        
        assertEqual(tokens[0].value, .name("CA"))
        assertEqual(tokens[1].value, .name("Da"))
        assertEqual(tokens[2].value, .name("Fb78"))
        assertEqual(tokens[3].value, .unknown)
        assertEqual(tokens[4].value, .unknown)
    }
    
    func testInvalidChords() {
        let tokens = Lexer.lex("CMA Dma Fbaug78 D-1ma E#dom8")
        
        assertEqual(tokens[0].value, .name("CMA"))
        assertEqual(tokens[1].value, .name("Dma"))
        assertEqual(tokens[2].value, .name("Fbaug78"))
        assertEqual(tokens[3].value, .unknown)
        assertEqual(tokens[4].value, .unknown)
    }
    
    func testInvalidDegreeNotes() {
        let tokens = Lexer.lex("0 8 12")
        
        assertEqual(tokens[0].value, .unknown)
        assertEqual(tokens[1].value, .unknown)
        assertEqual(tokens[2].value, .unknown)
    }
    
    func testInvalidDegreeChords() {
        let tokens = Lexer.lex("IVI iI I0 IVa iii°a")
        
        assertEqual(tokens[0].value, .name("IVI"))
        assertEqual(tokens[1].value, .name("iI"))
        assertEqual(tokens[2].value, .name("I0"))
        assertEqual(tokens[3].value, .name("IVa"))
        assertEqual(tokens[4].value, .unknown)
    }
    
    func testInvalidVelocities() {
        let tokens = Lexer.lex("C.a Dm.128 4.-1 II.pppp")
        
        assertEqual(tokens[0].value, .unknown)
        assertEqual(tokens[1].value, .unknown)
        assertEqual(tokens[2].value, .unknown)
        assertEqual(tokens[3].value, .unknown)
    }
    
    func testInvalidNumbers() {
        let tokens = Lexer.lex(", 0.0 00.2 001.0 1.0.0")
        
        assertEqual(tokens[0].value, .unknown)
        assertEqual(tokens[1].value, .unknown)
        assertEqual(tokens[2].value, .unknown)
        assertEqual(tokens[3].value, .unknown)
    }
}
