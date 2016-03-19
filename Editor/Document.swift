
import Cocoa

class Document: NSDocument {
    
    var code = ""

    override var windowNibName: String? {
        return "Document"
    }

    override func dataOfType(typeName: String) throws -> NSData {
        // Write document to data
        guard let data = code.dataUsingEncoding(NSUTF8StringEncoding) else {
            throw NSError(domain: NSCocoaErrorDomain, code: NSCocoaError.FileWriteUnknownError.rawValue, userInfo: nil)
        }
        return data
    }

    override func readFromData(data: NSData, ofType typeName: String) throws {
        // Read document from data
        guard let code = String(data: data, encoding: NSUTF8StringEncoding) else {
            throw NSError(domain: NSCocoaErrorDomain, code: NSCocoaError.FileReadUnknownError.rawValue, userInfo: nil)
        }
        self.code = code
    }
}
