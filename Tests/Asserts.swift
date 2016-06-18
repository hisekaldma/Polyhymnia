
import XCTest

/// Assert that two values are equal
func assertEqual<T: Equatable>(_ v1: T, _ v2: T, file: StaticString = #file, line: UInt = #line) {
    XCTAssertEqual(v1, v2, file: file, line: line)
}

/// Assert that two arrays are equal
func assertEqual<T : Equatable>(_ v1: [T], _ v2: [T], file: StaticString = #file, line: UInt = #line) {
    XCTAssertEqual(v1, v2, file: file, line: line)
}

/// Assert that a value is true
func assertTrue(_ value: Bool, file: StaticString = #file, line: UInt = #line) {
    XCTAssertTrue(value, file: file, line: line)
}

/// Assert that a value is false
func assertFalse(_ value: Bool, file: StaticString = #file, line: UInt = #line) {
    XCTAssertFalse(value, file: file, line: line)
}
