import write_blob from 'capacitor-blob-writer';
import getBlobDuration from 'get-blob-duration';

import type {
    Base64String,
    CurrentRecordingStatus,
    RecordingPermissionStatus,
    RecordingData,
    RecordingOptions
} from './definitions';
import { RecordingStatus, PermissionStatus } from './definitions';
import {
    alreadyRecordingError,
    couldNotQueryPermissionStatusError,
    deviceCannotVoiceRecordError,
    emptyRecordingError,
    failedToFetchRecordingError,
    failedToRecordError,
    failureResponse,
    missingPermissionError,
    recordingHasNotStartedError,
    successResponse,
} from './predefined-web-responses';

// these mime types will be checked one by one in order until one of them is found to be supported by the current browser
const POSSIBLE_MIME_TYPES = {
    'audio/aac': '.aac',
    'audio/mp4': '.mp3',
    'audio/webm;codecs=opus': '.ogg',
    'audio/webm': '.ogg',
    'audio/ogg;codecs=opus': '.ogg',
};
const neverResolvingPromise = (): Promise<any> => new Promise(() => undefined);

export class VoiceRecorderImpl {

    private mediaRecorder: MediaRecorder | null = null;
    private chunks: any[] = [];
    private pendingResult: Promise<RecordingData> = neverResolvingPromise();

    public static async canDeviceVoiceRecord(): Promise<boolean> {
        if (navigator?.mediaDevices?.getUserMedia == null || VoiceRecorderImpl.getSupportedMimeType() == null) {
            return failureResponse();
        } else {
            return successResponse();
        }
    }

    public static async requestAudioRecordingPermission(): Promise<RecordingPermissionStatus> {
        const havingPermission: RecordingPermissionStatus = await VoiceRecorderImpl.getAudioRecordingPermissionStatus()
            .catch(() => {
                return { status: PermissionStatus.Denied } as RecordingPermissionStatus;
            });

        if (havingPermission.status === PermissionStatus.Granted) {
            return { status: PermissionStatus.Granted } as RecordingPermissionStatus;
        }

        return navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then(() => { 
                return { status: PermissionStatus.Granted } as RecordingPermissionStatus; 
            })
            .catch(() => { 
                return { status: PermissionStatus.Denied } as RecordingPermissionStatus; 
            });
    }

    public static async getAudioRecordingPermissionStatus(): Promise<RecordingPermissionStatus> {
        if (navigator.permissions.query == null) {
            if (navigator.mediaDevices == null) {
                return Promise.reject(couldNotQueryPermissionStatusError());
            }

            return navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then(() => { 
                    return { status: PermissionStatus.Granted } as RecordingPermissionStatus; 
                })
                .catch(() => {
                    throw couldNotQueryPermissionStatusError();
                });
        }

        return navigator.permissions
            .query({ name: 'microphone' as any })
            .then((result) => {
                return { status: result.state === 'granted' ? PermissionStatus.Granted : PermissionStatus.Denied };
            })
            .catch(() => {
                throw couldNotQueryPermissionStatusError();
            });
    }

    public async startRecording(): Promise<void> {

        if (this.mediaRecorder != null) {
            throw alreadyRecordingError();
        }

        const deviceCanRecord: boolean = await VoiceRecorderImpl.canDeviceVoiceRecord();

        if (!deviceCanRecord) {
            throw deviceCannotVoiceRecordError();
        }

        const havingPermission: RecordingPermissionStatus = await VoiceRecorderImpl.getAudioRecordingPermissionStatus()
            .catch(() => {
                return { status: PermissionStatus.Denied } as RecordingPermissionStatus;
            });

        if (havingPermission.status === PermissionStatus.Denied) {
            throw missingPermissionError();
        }

        return navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => this.onSuccessfullyStartedRecording(stream))
            .catch(this.onFailedToStartRecording.bind(this));
    }

    public async stopRecording(): Promise<RecordingData> {
        if (this.mediaRecorder == null) {
            throw recordingHasNotStartedError();
        }
        try {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());

            return this.pendingResult;
        } catch (ignore) {
            throw failedToFetchRecordingError();
        } finally {
            this.prepareInstanceForNextOperation();
        }
    }    

    public pauseRecording(): Promise<boolean> {
        if (this.mediaRecorder == null) {
            throw recordingHasNotStartedError();
        } else if (this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.pause();
            return Promise.resolve(successResponse());
        } else {
            return Promise.resolve(failureResponse());
        }
    }

    public resumeRecording(): Promise<boolean> {
        if (this.mediaRecorder == null) {
            throw recordingHasNotStartedError();
        } else if (this.mediaRecorder.state === 'paused') {
            this.mediaRecorder.resume();
            return Promise.resolve(successResponse());
        } else {
            return Promise.resolve(failureResponse());
        }
    }

    public getCurrentStatus(): Promise<CurrentRecordingStatus> {
        if (this.mediaRecorder == null) {
            return Promise.resolve({ status: RecordingStatus.None });
        } else if (this.mediaRecorder.state === 'recording') {
            return Promise.resolve({ status: RecordingStatus.Recording });
        } else if (this.mediaRecorder.state === 'paused') {
            return Promise.resolve({ status: RecordingStatus.Paused });
        } else {
            return Promise.resolve({ status: RecordingStatus.None });
        }
    }

    public static getSupportedMimeType<T extends keyof typeof POSSIBLE_MIME_TYPES>(): T | null {
        if (MediaRecorder?.isTypeSupported == null) return null;

        const foundSupportedType = Object.keys(POSSIBLE_MIME_TYPES).find((type) => MediaRecorder.isTypeSupported(type)) as
            | T
            | undefined;

        return foundSupportedType ?? null;
    }

    private onSuccessfullyStartedRecording(stream: MediaStream, options?: RecordingOptions): void {
        this.pendingResult = new Promise((resolve, reject) => {
            this.mediaRecorder = new MediaRecorder(stream);

            this.mediaRecorder.onerror = () => {
                this.prepareInstanceForNextOperation();
                reject(failedToRecordError());
            };

            this.mediaRecorder.onstop = async () => {
                const mimeType = VoiceRecorderImpl.getSupportedMimeType();

                if (mimeType == null) {
                    this.prepareInstanceForNextOperation();
                    reject(failedToFetchRecordingError());

                    return;
                }

                const blobVoiceRecording = new Blob(this.chunks, { type: mimeType });

                if (blobVoiceRecording.size <= 0) {
                    this.prepareInstanceForNextOperation();
                    reject(emptyRecordingError());

                    return;
                }

                let path;
                let recordDataBase64;
                if (options != null) {
                    const subDirectory = options.subDirectory?.match(/^\/?(.+[^/])\/?$/)?.[1] ?? '';
                    path = `${subDirectory}/recording-${new Date().getTime()}${POSSIBLE_MIME_TYPES[mimeType]}`;

                    await write_blob({
                        blob: blobVoiceRecording,
                        directory: options.directory,
                        fast_mode: true,
                        path,
                        recursive: true,
                    });
                } else {
                    recordDataBase64 = await VoiceRecorderImpl.blobToBase64(blobVoiceRecording);
                }

                const recordingDuration = await getBlobDuration(blobVoiceRecording);
                this.prepareInstanceForNextOperation();
                resolve({ recordDataBase64, mimeType, msDuration: recordingDuration * 1000, path } as RecordingData);
            };

            this.mediaRecorder.ondataavailable = (event: any) => this.chunks.push(event.data);
            this.mediaRecorder.start();
        });

        return void 0;
    }

    private onFailedToStartRecording(): void {
        this.prepareInstanceForNextOperation();
        throw failedToRecordError();
    }

    private static blobToBase64(blob: Blob): Promise<Base64String> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const recordingResult = String(reader.result);
                const splitResult = recordingResult.split('base64,');
                const toResolve = splitResult.length > 1 ? splitResult[1] : recordingResult;
                resolve(toResolve.trim());
            };
            reader.readAsDataURL(blob);
        });
    }

    private prepareInstanceForNextOperation(): void {
        if (this.mediaRecorder != null && this.mediaRecorder.state === 'recording') {
            try {
                this.mediaRecorder.stop();
            } catch (error) {
                console.warn('While trying to stop a media recorder, an error was thrown', error);
            }
        }
        this.pendingResult = neverResolvingPromise();
        this.mediaRecorder = null;
        this.chunks = [];
    }
}
