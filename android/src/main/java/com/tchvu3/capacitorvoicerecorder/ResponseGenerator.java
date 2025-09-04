package com.tchvu3.capacitorvoicerecorder;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;

public class ResponseGenerator {

    private static final String VALUE_RESPONSE_KEY = "value";
    private static final String STATUS_RESPONSE_KEY = "status";

    public static JSObject fromBooleanResponse(boolean value) {
        return value ? successResponse() : failResponse();
    }

    public static JSObject successResponse() {
        JSObject success = new JSObject();
        success.put(VALUE_RESPONSE_KEY, true);

        return success;
    }

    public static JSObject failResponse() {
        JSObject fail = new JSObject();
        fail.put(VALUE_RESPONSE_KEY, false);

        return fail;
    }

    public static JSObject recordingStatusResponse(CurrentRecordingStatus status) {
        JSObject statusResponse = new JSObject();
        statusResponse.put(STATUS_RESPONSE_KEY, status.name());

        return statusResponse;
    }

    public static JSObject permissionStatusResponse(PermissionState status) {
        JSObject statusResponse = new JSObject();
        statusResponse.put(STATUS_RESPONSE_KEY, status.toString().toUpperCase());

        return statusResponse;
    }

}
