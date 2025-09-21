import Foundation

struct RecordOptions {

    let directory: String?
    var subDirectory: String?
    var audioEncoder: String?
    var outputFormat: String?
    var fileExtension: String?

    mutating func setSubDirectory(to subDirectory: String) {
      self.subDirectory = subDirectory
    }

}
