import { WebPlugin } from '@capacitor/core';

import { VoiceRecorderImpl } from './VoiceRecorderImpl';
import type {
    CurrentRecordingStatus,
    RecordingData,
    VoiceRecorderPlugin,
    RecordingPermissionStatus
} from './definitions';

export class VoiceRecorderWeb extends WebPlugin implements VoiceRecorderPlugin {

    private voiceRecorderInstance = new VoiceRecorderImpl();

    public canDeviceVoiceRecord(): Promise<boolean> {
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

    public pauseRecording(): Promise<boolean> {
        return this.voiceRecorderInstance.pauseRecording();
    }

    public resumeRecording(): Promise<boolean> {
        return this.voiceRecorderInstance.resumeRecording();
    }

    public getCurrentRecordingStatus(): Promise<CurrentRecordingStatus> {
        return this.voiceRecorderInstance.getCurrentStatus();
    }
    
}
