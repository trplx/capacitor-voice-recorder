import type { Directory } from '@capacitor/filesystem';

export type Base64String = string;

export interface RecordingData {   
    recordDataBase64?: Base64String;
    msDuration: number;
    mimeType: string;
    path?: string;
}

export interface RecordingOptions {
    directory?: Directory;
    subDirectory?: string;
    audioEncoder?: 'AAC' | 'AAC_ELD'| 'OPUS';
    outputFormat?: 'AAC_ADTS' | 'MPEG_4';
    extension?: '.aac' | '.mp4' | '.m4a';
};

export interface GenericResponse {
    value: boolean;
}

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

    canDeviceVoiceRecord(): Promise<GenericResponse>;

    requestAudioRecordingPermission(): Promise<RecordingPermissionStatus>;

    getAudioRecordingPermissionStatus(): Promise<RecordingPermissionStatus>;

    startRecording(options?: RecordingOptions): Promise<void>;

    stopRecording(): Promise<RecordingData>;

    pauseRecording(): Promise<GenericResponse>;

    resumeRecording(): Promise<GenericResponse>;

    getCurrentRecordingStatus(): Promise<CurrentRecordingStatus>;

}
