
import XCTest
@testable import Pulse

class TransformTests: XCTestCase {

    func testNotePattern() {
        let pattern = Pattern(notes: [.c, .d, .e, .f])
        assertEqual(pattern.notes.flattened(), [60, 62, 64, 65])
    }
    
    func testTransposeSemitones() {
        var pattern = Pattern(notes: [.c, .d, .e, .f])
        pattern.transpose(semitones: 1)
        assertEqual(pattern.notes.flattened(), [61, 63, 65, 66])
    }
    
    func testTransposeOctaves() {
        var pattern = Pattern(notes: [.c, .d, .e, .f])
        pattern.transpose(octaves: 1)
        assertEqual(pattern.notes.flattened(), [72, 74, 76, 77])
    }
    
    func testReverse() {
        var pattern = Pattern(notes: [.c, .d, .e, .f])
        pattern.reverse()
        assertEqual(pattern.notes.flattened(), [65, 64, 62, 60])
    }
    
    func testChordPattern() {
        let pattern = Pattern(chords: [(.c, .maj), (.d, .min), (.e, .min), (.f, .maj)])
        assertEqual(pattern.notes, [
            [60, 64, 67],
            [62, 65, 69],
            [64, 67, 71],
            [65, 69, 72]
        ])
    }
    
    func testArpeggio() {
        var pattern = Pattern(chords: [(.c, .maj), (.d, .min), (.e, .min), (.f, .maj)])
        pattern.arpeggio(sequence: [1, 3, 2])
        assertEqual(pattern.notes, [
            [60], [67], [64],
            [62], [69], [65],
            [64], [71], [67],
            [65], [72], [69]
        ])
    }
    
    func testStaccato() {
        var pattern = Pattern(notes: [.c, .d, .e, .f])
        pattern.staccato()
        assertEqual(pattern.notes, [[60], [], [62], [], [64], [], [65], []])
    }
    
    func testStutter() {
        var pattern = Pattern(notes: [.c])
        pattern.stutter(times: 4)
        assertEqual(pattern.notes.flattened(), [60, 60, 60, 60])
    }
}
