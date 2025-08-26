import { WebPlugin } from '@capacitor/core';

import { VoiceRecorderImpl } from './VoiceRecorderImpl';
import type {
    CurrentRecordingStatus,
    RecordingData,
    VoiceRecorderPlugin,
    RecordingPermissionStatus,
    GenericResponse
} from './definitions';

export class VoiceRecorderWeb extends WebPlugin implements VoiceRecorderPlugin {

    private voiceRecorderInstance = new VoiceRecorderImpl();

    public canDeviceVoiceRecord(): Promise<GenericResponse> {
        return VoiceRecorderImpl.canDeviceVoiceRecord();
    }

    public requestAudioRecordingPermission(): Promise<RecordingPermissionStatus> {
        return VoiceRecorderImpl.requestAudioRecordingPermission();
    }

    public getAudioRecordingPermissionStatus(): Promise<RecordingPermissionStatus> {
        return VoiceRecorderImpl.getAudioRecordingPermissionStatus();
    }

    public startRecording(): Promise<void> {
        return this.voiceRecorderInstance.startRecording();
    }

    public stopRecording(): Promise<RecordingData> {
        return this.voiceRecorderInstance.stopRecording();
    }

    public pauseRecording(): Promise<GenericResponse> {
        return this.voiceRecorderInstance.pauseRecording();
    }

    public resumeRecording(): Promise<GenericResponse> {
        return this.voiceRecorderInstance.resumeRecording();
    }

    public getCurrentRecordingStatus(): Promise<CurrentRecordingStatus> {
        return this.voiceRecorderInstance.getCurrentStatus();
    }
    
}
