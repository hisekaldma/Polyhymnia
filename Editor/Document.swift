
import Cocoa

class Document: NSDocument {
    
    var code = ""

    override var windowNibName: String? {
        return "Document"
    }

    override func data(ofType typeName: String) throws -> Data {
        // Write document to data
        guard let data = code.data(using: .utf8) else {
            throw NSError(domain: NSCocoaErrorDomain, code: NSCocoaError.fileWriteUnknownError.rawValue, userInfo: nil)
        }
        return data
    }

    override func read(from data: Data, ofType typeName: String) throws {
        // Read document from data
        guard let code = String(data: data, encoding: .utf8) else {
            throw NSError(domain: NSCocoaErrorDomain, code: NSCocoaError.fileReadUnknownError.rawValue, userInfo: nil)
        }
        self.code = code
    }
}
