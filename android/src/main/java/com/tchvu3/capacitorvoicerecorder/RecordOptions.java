package com.tchvu3.capacitorvoicerecorder;

public class RecordOptions {

    private String directory;
    private String subDirectory;
    private String audioEncoder;
    private String extension;

    public RecordOptions(String directory, String subDirectory, String audioEncoder, String extension) {
        this.directory = directory;
        this.subDirectory = subDirectory;
        this.audioEncoder = audioEncoder;
        this.extension = extension;
    }

    public String getDirectory() {
        return directory;
    }

    public String getSubDirectory() {
        return subDirectory;
    }

    public String getAudioEncoder() {
        return audioEncoder;
    }

    public String getExtension() {
        return extension;
    }

    public void setSubDirectory(String subDirectory) {
        this.subDirectory = subDirectory;
    }

}
