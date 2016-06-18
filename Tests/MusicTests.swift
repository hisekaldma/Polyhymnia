
import XCTest
@testable import Pulse

class MusicTests: XCTestCase {
    
    func testNotes() {
        let note = Note.c.numerical
        XCTAssertEqual(note, 0)
    }
    
    func testChords() {
        let chord = Chord.maj.numerical
        XCTAssertEqual(chord, [0, 4, 7])
    }
    
    func testDegree() {
        let degree = Degree.ii.numerical
        XCTAssertEqual(degree, 1)
    }
    
    func testScale() {
        let scale = Scale.major.numerical
        XCTAssertEqual(scale, [0, 2, 4, 5, 7, 9, 11])
    }
    
    func testStandardOctave() {
        let octave = Octave.standard.numerical
        XCTAssertEqual(octave, 3)
    }
    
    func testStandardVelocity() {
        let velocity = Velocity.standard.numerical
        XCTAssertEqual(velocity, 72)
    }
}
