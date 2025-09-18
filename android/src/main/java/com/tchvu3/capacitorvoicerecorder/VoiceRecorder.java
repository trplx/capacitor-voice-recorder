package com.tchvu3.capacitorvoicerecorder;

import android.Manifest;
import android.content.Context;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.net.Uri;
import android.util.Base64;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

@CapacitorPlugin(
    name = "VoiceRecorder",
    permissions = { @Permission(alias = VoiceRecorder.RECORD_AUDIO_ALIAS, strings = { Manifest.permission.RECORD_AUDIO }) }
)
public class VoiceRecorder extends Plugin {

    static final String RECORD_AUDIO_ALIAS = "voice recording";
    private CustomMediaRecorder mediaRecorder;


    @PluginMethod
    public void canDeviceVoiceRecord(PluginCall call) {
        if (CustomMediaRecorder.canPhoneCreateMediaRecorder(getContext())) {
            call.resolve(ResponseGenerator.successResponse());
        } else {
            call.resolve(ResponseGenerator.failResponse());
        }
    }

    @PluginMethod
    public void requestAudioRecordingPermission(PluginCall call) {
        if (doesUserGaveAudioRecordingPermission()) {
            call.resolve(ResponseGenerator.permissionStatusResponse(PermissionState.GRANTED));
        } else {
            requestPermissionForAlias(RECORD_AUDIO_ALIAS, call, "recordAudioPermissionCallback");
        }
    }

    @PermissionCallback
    private void recordAudioPermissionCallback(PluginCall call) {
        this.getAudioRecordingPermissionStatus(call);
    }

    @PluginMethod
    public void getAudioRecordingPermissionStatus(PluginCall call) {
        if (doesUserGaveAudioRecordingPermission()) {
            call.resolve(ResponseGenerator.permissionStatusResponse(PermissionState.GRANTED));
        } else {
            call.resolve(ResponseGenerator.permissionStatusResponse(PermissionState.DENIED));
        }
    }

    @PluginMethod
    public void startRecording(PluginCall call) {

        if (!CustomMediaRecorder.canPhoneCreateMediaRecorder(getContext())) {
            call.reject(Messages.CANNOT_RECORD_ON_THIS_PHONE);

            return;
        }

        if (!doesUserGaveAudioRecordingPermission()) {
            call.reject(Messages.MISSING_PERMISSION);

            return;
        }

        if (this.isMicrophoneOccupied()) {
            call.reject(Messages.MICROPHONE_BEING_USED);

            return;
        }

        if (mediaRecorder != null) {
            call.reject(Messages.ALREADY_RECORDING);

            return;
        }

        try {
            String directory = call.getString("directory");
            String subDirectory = call.getString("subDirectory");
            String audioEncoder = call.getString("audioEncoder");
            String outputFormat = call.getString("outputFormat");
            String extension = call.getString("extension");

            RecordOptions options = new RecordOptions(directory, subDirectory, audioEncoder, outputFormat, extension);
            mediaRecorder = new CustomMediaRecorder(getContext(), options);
            mediaRecorder.startRecording();
            call.resolve();
        } catch (Exception exp) {
            mediaRecorder = null;
            call.reject(Messages.FAILED_TO_RECORD, exp);
        }
    }

    @PluginMethod
    public void stopRecording(PluginCall call) {
        if (mediaRecorder == null) {
            call.reject(Messages.RECORDING_HAS_NOT_STARTED);

            return;
        }

        try {
            mediaRecorder.stopRecording();
            File recordedFile = mediaRecorder.getOutputFile();
            RecordOptions options = mediaRecorder.getRecordOptions();

            String path = null;
            String recordDataBase64 = null;
            if (options.getDirectory() != null) {
                path = recordedFile.getName();
                if (options.getSubDirectory() != null) {
                    path = options.getSubDirectory() + "/" + path;
                }
            } else {
                recordDataBase64 = readRecordedFileAsBase64(recordedFile);
            }

            RecordData recordData = new RecordData(
                recordDataBase64,
                getMsDurationOfAudioFile(recordedFile.getAbsolutePath()),
                "audio/aac",
                path
            );
            if ((recordDataBase64 == null && path == null) || recordData.getMsDuration() < 0) {
                call.reject(Messages.EMPTY_RECORDING);
            } else {
                call.resolve(recordData.toJSObject());
            }
        } catch (Exception exp) {
            call.reject(Messages.FAILED_TO_FETCH_RECORDING, exp);
        } finally {
            RecordOptions options = mediaRecorder.getRecordOptions();
            if (options.getDirectory() == null) {
                mediaRecorder.deleteOutputFile();
            }

            mediaRecorder = null;
        }
    }

    @PluginMethod
    public void pauseRecording(PluginCall call) {
        if (mediaRecorder == null) {
            call.reject(Messages.RECORDING_HAS_NOT_STARTED);
            return;
        }
        try {
            call.resolve(ResponseGenerator.fromBooleanResponse(mediaRecorder.pauseRecording()));
        } catch (NotSupportedOsVersion exception) {
            call.reject(Messages.NOT_SUPPORTED_OS_VERSION);
        }
    }

    @PluginMethod
    public void resumeRecording(PluginCall call) {
        if (mediaRecorder == null) {
            call.reject(Messages.RECORDING_HAS_NOT_STARTED);
            return;
        }
        try {
            call.resolve(ResponseGenerator.fromBooleanResponse(mediaRecorder.resumeRecording()));
        } catch (NotSupportedOsVersion exception) {
            call.reject(Messages.NOT_SUPPORTED_OS_VERSION);
        }
    }

    @PluginMethod
    public void getCurrentRecordingStatus(PluginCall call) {
        if (mediaRecorder == null) {
            call.resolve(ResponseGenerator.recordingStatusResponse(CurrentRecordingStatus.NONE));
        } else {
            call.resolve(ResponseGenerator.recordingStatusResponse(mediaRecorder.getCurrentStatus()));
        }
    }

    private boolean doesUserGaveAudioRecordingPermission() {
        return getPermissionState(VoiceRecorder.RECORD_AUDIO_ALIAS).equals(PermissionState.GRANTED);
    }

    private String readRecordedFileAsBase64(File recordedFile) {
        BufferedInputStream bufferedInputStream;
        byte[] bArray = new byte[(int) recordedFile.length()];

        try {
            bufferedInputStream = new BufferedInputStream(new FileInputStream(recordedFile));
            bufferedInputStream.read(bArray);
            bufferedInputStream.close();
        } catch (IOException exp) {
            return null;
        }

        return Base64.encodeToString(bArray, Base64.DEFAULT);
    }

    private int getMsDurationOfAudioFile(String recordedFilePath) {
        try {
            MediaPlayer mediaPlayer = new MediaPlayer();
            mediaPlayer.setDataSource(recordedFilePath);
            mediaPlayer.prepare();
            return mediaPlayer.getDuration();
        } catch (Exception ignore) {
            return -1;
        }
    }

    private boolean isMicrophoneOccupied() {
        AudioManager audioManager = (AudioManager) this.getContext().getSystemService(Context.AUDIO_SERVICE);
        if (audioManager == null) return true;

        return audioManager.getMode() != AudioManager.MODE_NORMAL;
    }

}
