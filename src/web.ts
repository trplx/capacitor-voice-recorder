import { WebPlugin } from '@capacitor/core';

import { VoiceRecorderImpl } from './VoiceRecorderImpl';
import type {
    CurrentRecordingStatus,
    RecordingData,
    RecordingOptions,
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

    public hasAudioRecordingPermission(): Promise<RecordingPermissionStatus> {
        return VoiceRecorderImpl.hasAudioRecordingPermission();
    }

    public startRecording(options?: RecordingOptions): Promise<void> {
        return this.voiceRecorderInstance.startRecording(options);
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
