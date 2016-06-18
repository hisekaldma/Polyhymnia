
import XCTest
@testable import Pulse

class MusicTests: XCTestCase {
    
    func testNotes() {
        let note = Note.c.numerical
        assertEqual(note, 0)
    }
    
    func testChords() {
        let chord = Chord.maj.numerical
        assertEqual(chord, [0, 4, 7])
    }
    
    func testDegree() {
        let degree = Degree.ii.numerical
        assertEqual(degree, 1)
    }
    
    func testScale() {
        let scale = Scale.major.numerical
        assertEqual(scale, [0, 2, 4, 5, 7, 9, 11])
    }
    
    func testStandardOctave() {
        let octave = Octave.standard.numerical
        assertEqual(octave, 3)
    }
    
    func testStandardVelocity() {
        let velocity = Velocity.standard.numerical
        assertEqual(velocity, 72)
    }
}
