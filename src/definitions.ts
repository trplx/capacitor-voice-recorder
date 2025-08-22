import type { Directory } from '@capacitor/filesystem';

export type Base64String = string;

export interface RecordingData {   
    recordDataBase64?: Base64String;
    msDuration: number;
    mimeType: string;
    path?: string;
}

export interface RecordingOptions {
    directory: Directory;
    subDirectory?: string;
    encoder?: string;
};

export interface RecordingPermissionStatus {
    status: PermissionStatus;
}

export interface CurrentRecordingStatus {
    status: RecordingStatus;
}

export enum RecordingStatus {
    Recording = 'RECORDING',
    Paused = 'PAUSED',
    None = 'NONE',
};

export enum PermissionStatus {
    Granted = 'GRANTED',
    Denied = 'DENIED'
};

export interface VoiceRecorderPlugin {

    canDeviceVoiceRecord(): Promise<boolean>;

    requestAudioRecordingPermission(): Promise<RecordingPermissionStatus>;

    getAudioRecordingPermissionStatus(): Promise<RecordingPermissionStatus>;

    startRecording(options?: RecordingOptions): Promise<void>;

    stopRecording(): Promise<RecordingData>;

    pauseRecording(): Promise<boolean>;

    resumeRecording(): Promise<boolean>;

    getCurrentRecordingStatus(): Promise<CurrentRecordingStatus>;

}
