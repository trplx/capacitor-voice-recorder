package com.tchvu3.capacitorvoicerecorder;

public class RecordOptions {

    private String directory;
    private String subDirectory;
    private String audioEncoder;
    private String extention;

    public RecordOptions(String directory, String subDirectory, String audioEncoder, String extention) {
        this.directory = directory;
        this.subDirectory = subDirectory;
        this.audioEncoder = audioEncoder;
        this.extention = extention;
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

    public String getExtention() {
        return extention;
    }

    public void setSubDirectory(String subDirectory) {
        this.subDirectory = subDirectory;
    }

}
