<p align="center">
  <img src="https://user-images.githubusercontent.com/236501/85893648-1c92e880-b7a8-11ea-926d-95355b8175c7.png" width="128" height="128" />
</p>
<h3 align="center">Capacitor Voice Recorder</h3>
<p align="center"><strong><code>@trplx/capacitor-voice-recorder</code></strong></p>
<p align="center">Capacitor plugin for simple voice recording. </p>
<p align="center">This is fork of <a href="https://github.com/tchvu3/capacitor-voice-recorder">tchvu3/capacitor-voice-recorder</a> plugin.</p>
 


## Supported platforms

| Platform | Availability |
|:-------- |:------------ |
| iOS      |     ✅      | 
| Android  |     ✅      | 
| Web      |     ✅      |


## Install

```
npm install --save @trplx/capacitor-voice-recorder
npx cap sync
```

## iOS

Add the following usage description to your `Info.plist`:

```xml

<key>NSMicrophoneUsageDescription</key>
<string>This app uses the microphone to record audio.</string>
```

## Android

Add the following permission to your `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```


## API

* [`canDeviceVoiceRecord()`](#canDeviceVoiceRecord())
* [`requestAudioRecordingPermission()`](#requestAudioRecordingPermission())
* [`hasAudioRecordingPermission()`](#hasAudioRecordingPermission())
* [`startRecording(...)`](#startRecording(...))
* [`stopRecording()`](#stopRecording())
* [`pauseRecording()`](#pauseRecording())
* [`resumeRecording()`](#resumeRecording())
* [`getCurrentRecordingStatus()`](#getCurrentRecordingStatus())

</br>

--------------------

</br>

### canDeviceVoiceRecord()

```typescript
VoiceRecorder.canDeviceVoiceRecord() => Promise<boolean>
```

Check if the device/browser can record audio.

**Returns:** <code>Promise&lt;boolean&gt;</code>


`true` - the device/browser can record audio. \
`false` - the browser cannot record audio (on mobile it always returns `true`). 

</br>

--------------------

</br>


### requestAudioRecordingPermission()

```typescript
VoiceRecorder.requestAudioRecordingPermission() => Promise<PermissionStatus>
```

Request audio recording permission from the user.

**Returns:** <code>Promise&lt;<a href="#permissionstatus">PermissionStatus</a>&gt;</code>

</br>

--------------------

</br>

### hasAudioRecordingPermission()

```typescript
VoiceRecorder.hasAudioRecordingPermission() => Promise<PermissionStatus>
```

Check if the audio recording permission has been granted.

**Returns:** <code>Promise&lt;<a href="#permissionstatus">PermissionStatus</a>&gt;</code>


| Error code                          | Description                        |
|-------------------------------------|------------------------------------|
| `COULD_NOT_QUERY_PERMISSION_STATUS` | Failed to query permission status. |


</br>

--------------------

</br>

### startRecording(...)

```typescript
VoiceRecorder.startRecording(options?: RecordingOptions) => Promise<void>
```

Start the audio recording.

Optional options can be used with this method to save the file in the device's filesystem and return a path to that file instead of a base64 string. This greatly increases performance for large files.

| Param         | Type                                                          |
| ------------- | ------------------------------------------------------------- |
| **`options`** | <code><a href="#recordingOptions">RecordingOptions</a></code> |


**Returns:** <code>Promise&lt;void&gt;</code>

| Error code                   | Description                              |
|------------------------------|------------------------------------------|
| `MISSING_PERMISSION`         | Required permission is missing.          |
| `DEVICE_CANNOT_VOICE_RECORD` | Device/browser cannot record audio.      |
| `ALREADY_RECORDING`          | A recording is already in progress.      |
| `MICROPHONE_BEING_USED`      | Microphone is being used by another app. |
| `FAILED_TO_RECORD`           | Unknown error occurred during recording. |

</br>

--------------------

</br>

### stopRecording

Stops the audio recording and returns the recording data.

When a `directory` option has been passed to the `VoiceRecorder.startRecording` method the data will include a `path` instead of a `recordDataBase64`

```typescript
VoiceRecorder.stopRecording()
    .then((result: RecordingData) => console.log(result.value))
    .catch(error => console.log(error));
```

| Return Value       | Description                                    |
|--------------------|------------------------------------------------|
| `recordDataBase64` | The recorded audio data in Base64 format.      |
| `msDuration`       | The duration of the recording in milliseconds. |
| `mimeType`         | The MIME type of the recorded audio.           |
| `path`             | The path to the audio file                     |

| Error Code                  | Description                                          |
|-----------------------------|------------------------------------------------------|
| `RECORDING_HAS_NOT_STARTED` | No recording in progress.                            |
| `EMPTY_RECORDING`           | Recording stopped immediately after starting.        |
| `FAILED_TO_FETCH_RECORDING` | Unknown error occurred while fetching the recording. |

#### pauseRecording

Pause the ongoing audio recording.

```typescript
VoiceRecorder.pauseRecording()
    .then((result: GenericResponse) => console.log(result.value))
    .catch(error => console.log(error));
```

| Return Value       | Description                    |
|--------------------|--------------------------------|
| `{ value: true }`  | Recording paused successfully. |
| `{ value: false }` | Recording is already paused.   |

| Error Code                  | Description                                        |
|-----------------------------|----------------------------------------------------|
| `RECORDING_HAS_NOT_STARTED` | No recording in progress.                          |
| `NOT_SUPPORTED_OS_VERSION`  | Operation not supported on the current OS version. |

#### resumeRecording

Resumes a paused audio recording.

```typescript
VoiceRecorder.resumeRecording()
    .then((result: GenericResponse) => console.log(result.value))
    .catch(error => console.log(error));
```

| Return Value       | Description                     |
|--------------------|---------------------------------|
| `{ value: true }`  | Recording resumed successfully. |
| `{ value: false }` | Recording is already running.   |

| Error Code                  | Description                                        |
|-----------------------------|----------------------------------------------------|
| `RECORDING_HAS_NOT_STARTED` | No recording in progress.                          |
| `NOT_SUPPORTED_OS_VERSION`  | Operation not supported on the current OS version. |

### getCurrentStatus

Retrieves the current status of the recorder.

```typescript
VoiceRecorder.getCurrentStatus()
    .then((result: CurrentRecordingStatus) => console.log(result.status))
    .catch(error => console.log(error));
```

| Status Code | Description                                          |
|-------------|------------------------------------------------------|
| `NONE`      | Plugin is idle and waiting to start a new recording. |
| `RECORDING` | Plugin is currently recording.                       |
| `PAUSED`    | Recording is paused.                                 |


### Interfaces

#### PermissionStatus

| Prop             | Type                      | Description                     |
|------------------|---------------------------|---------------------------------|
| **`value`**      | ` 'granted' \| 'denied' ` |Permission status of recordind   |


#### RecordingOptions

| Prop            | Type                                                               | Description                                 |
|-----------------|--------------------------------------------------------------------|---------------------------------------------|
| directory       | [Directory](https://capacitorjs.com/docs/apis/filesystem#directory)| Specifies a Capacitor Filesystem Directory  |
| subDirectory    | string                                                             | Specifies a custom sub-directory (optional) |
| encoder         | string                                                             |                                             |
| extension       | string                                                             |                                             |

## Format and Mime type

The plugin will return the recording in one of several possible formats.
The format is dependent on the os / web browser that the user uses.
On android and ios the mime type will be `audio/aac`, while on chrome and firefox it
will be `audio/webm;codecs=opus` and on safari it will be `audio/mp4`.
Note that these three browsers have been tested on.
The plugin should still work on other browsers,
as there is a list of mime types that the plugin checks against the user's browser.

Note that this fact might cause unexpected behavior in case you'll try to play recordings
between several devices or browsers—as they do not all support the same set of audio formats.
It is recommended to convert the recordings to a format that all your target devices support.
As this plugin focuses on the recording aspect, it does not provide any conversion between formats.

## Playback

To play the recorded file, you can use plain JavaScript:

### With Base64 string
```typescript
const base64Sound = '...' // from plugin
const mimeType = '...'  // from plugin
const audioRef = new Audio(`data:${mimeType};base64,${base64Sound}`)
audioRef.oncanplaythrough = () => audioRef.play()
audioRef.load()
```

### With Blob
```typescript
import { Capacitor } from '@capacitor/core'
import { Directory, Filesystem } from '@capacitor/filesystem'

const PATH = '...' // from plugin

/** Generate a URL to the blob file with @capacitor/core and @capacitor/filesystem */
const getBlobURL = async (path: string) => {
  const directory = Directory.Data // Same Directory as the one you used with VoiceRecorder.startRecording

  if (config.public.platform === 'web') {
    const { data } = await Filesystem.readFile({ directory, path })
    return URL.createObjectURL(data)
  }

  const { uri } = await Filesystem.getUri({ directory, path })
  return Capacitor.convertFileSrc(uri)
}

/** Read the audio file */
const play = async () => {
  const url = await getBlobURL(PATH)
  const audioRef = new Audio(url)
  audioRef.onended = () => { URL.revokeObjectUrl(url) }
  audioRef.play()
}

/** Load the audio file (ie: to send to a Cloud Storage service) */
const load = async () => {
  const url = await getBlobURL(PATH)
  const response = await fetch(url)
  return response.blob()
}
```

## Compatibility

Versioning follows Capacitor versioning.
Major versions of the plugin are compatible with major versions of Capacitor.
You can find each version in its own dedicated branch.

| Plugin Version | Capacitor Version |
|----------------|-------------------|
| 5.*            | 5                 |
| 6.*            | 6                 |
| 7.*            | 7                 |


## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

