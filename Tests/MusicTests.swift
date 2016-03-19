
import XCTest
@testable import Pulse

class MusicTests: XCTestCase {
    
    func testNotes() {
        let note = Note.C.numerical
        XCTAssertEqual(note, 0)
    }
    
    func testChords() {
        let chord = Chord.Maj.numerical
        XCTAssertEqual(chord, [0, 4, 7])
    }
    
    func testDegree() {
        let degree = Degree.II.numerical
        XCTAssertEqual(degree, 1)
    }
    
    func testScale() {
        let scale = Scale.Major.numerical
        XCTAssertEqual(scale, [0, 2, 4, 5, 7, 9, 11])
    }
    
    func testDefaultOctave() {
        let octave = Octave.Default.numerical
        XCTAssertEqual(octave, 3)
    }
    
    func testDefaultVelocity() {
        let velocity = Velocity.Default.numerical
        XCTAssertEqual(velocity, 72)
    }
}
