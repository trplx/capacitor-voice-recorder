import Foundation
import AVFoundation
import Capacitor

@objc(VoiceRecorder)
public class VoiceRecorder: CAPPlugin {

    private var customMediaRecorder: CustomMediaRecorder?

    @objc func canDeviceVoiceRecord(_ call: CAPPluginCall) {
        call.resolve(ResponseGenerator.successResponse())
    }

    @objc func requestAudioRecordingPermission(_ call: CAPPluginCall) {
        AVAudioSession.sharedInstance().requestRecordPermission { granted in
            if granted {
                call.resolve(ResponseGenerator.permissionStatusResponse(AVAudioSession.RecordPermission.granted))
            } else {
                call.resolve(ResponseGenerator.permissionStatusResponse(AVAudioSession.RecordPermission.denied))
            }
        }
    }

    @objc func getAudioRecordingPermissionStatus(_ call: CAPPluginCall) {
        if (doesUserGaveAudioRecordingPermission()) {
            call.resolve(ResponseGenerator.permissionStatusResponse(AVAudioSession.RecordPermission.granted))
        } else {
            call.resolve(ResponseGenerator.permissionStatusResponse(AVAudioSession.RecordPermission.denied))
        }
    }

    @objc func startRecording(_ call: CAPPluginCall) {
        if !doesUserGaveAudioRecordingPermission() {
            call.reject(Messages.MISSING_PERMISSION)

            return
        }

        if customMediaRecorder != nil {
            call.reject(Messages.ALREADY_RECORDING)

            return
        }

        customMediaRecorder = CustomMediaRecorder()
        if customMediaRecorder == nil {
            call.reject(Messages.CANNOT_RECORD_ON_THIS_PHONE)

            return
        }

        let directory: String? = call.getString("directory")
        let subDirectory: String? = call.getString("subDirectory")
        let audioEncoder: String? = call.getString("audioEncoder")
        let outputFormat: String? = call.getString("outputFormat")
        let fileExtension: String? = call.getString("extension")
        let recordOptions = RecordOptions(directory: directory, subDirectory: subDirectory, audioEncoder: audioEncoder, outputFormat: outputFormat, fileExtension: fileExtension)
        let successfullyStartedRecording = customMediaRecorder!.startRecording(recordOptions: recordOptions)
        if successfullyStartedRecording == false {
            customMediaRecorder = nil
            call.reject(Messages.CANNOT_RECORD_ON_THIS_PHONE)
        } else {
            call.resolve()
        }
    }

    @objc func stopRecording(_ call: CAPPluginCall) {
        if customMediaRecorder == nil {
            call.reject(Messages.RECORDING_HAS_NOT_STARTED)
            return
        }

        customMediaRecorder?.stopRecording()

        let audioFileUrl = customMediaRecorder?.getOutputFile()
        if audioFileUrl == nil {
            customMediaRecorder = nil
            call.reject(Messages.FAILED_TO_FETCH_RECORDING)
            
            return
        }

        var path = audioFileUrl!.lastPathComponent
        if let subDirectory = customMediaRecorder?.options?.subDirectory {
            path = subDirectory + "/" + path
        }

        let sendDataAsBase64 = customMediaRecorder?.options?.directory == nil
        let recordData = RecordData(
            recordDataBase64: sendDataAsBase64 ? readFileAsBase64(audioFileUrl) : nil,
            mimeType: "audio/mp4",
            msDuration: getMsDurationOfAudioFile(audioFileUrl),
            path: sendDataAsBase64 ? nil : path
        )
        customMediaRecorder = nil
        if (sendDataAsBase64 && recordData.recordDataBase64 == nil) || recordData.msDuration < 0 {
            call.reject(Messages.EMPTY_RECORDING)
        } else {
            call.resolve(ResponseGenerator.dataResponse(recordData.toDictionary()))
        }
    }

    @objc func pauseRecording(_ call: CAPPluginCall) {
        if customMediaRecorder == nil {
            call.reject(Messages.RECORDING_HAS_NOT_STARTED)
        } else {
            call.resolve(ResponseGenerator.fromBoolean(customMediaRecorder?.pauseRecording() ?? false))
        }
    }

    @objc func resumeRecording(_ call: CAPPluginCall) {
        if customMediaRecorder == nil {
            call.reject(Messages.RECORDING_HAS_NOT_STARTED)
        } else {
            call.resolve(ResponseGenerator.fromBoolean(customMediaRecorder?.resumeRecording() ?? false))
        }
    }

    @objc func getCurrentRecordingStatus(_ call: CAPPluginCall) {
        if customMediaRecorder == nil {
            call.resolve(ResponseGenerator.recordingStatusResponse(CurrentRecordingStatus.NONE))
        } else {
            call.resolve(ResponseGenerator.recordingStatusResponse(customMediaRecorder?.getCurrentStatus() ?? CurrentRecordingStatus.NONE))
        }
    }

    func doesUserGaveAudioRecordingPermission() -> Bool {
        return AVAudioSession.sharedInstance().recordPermission == AVAudioSession.RecordPermission.granted
    }

    func readFileAsBase64(_ filePath: URL?) -> String? {
        if filePath == nil {
            return nil
        }

        do {
            let fileData = try Data.init(contentsOf: filePath!)
            let fileStream = fileData.base64EncodedString(options: NSData.Base64EncodingOptions.init(rawValue: 0))
            
            return fileStream
        } catch {}

        return nil
    }

    func getMsDurationOfAudioFile(_ filePath: URL?) -> Int {
        if filePath == nil {
            return -1
        }
        return Int(CMTimeGetSeconds(AVURLAsset(url: filePath!).duration) * 1000)
    }

}
