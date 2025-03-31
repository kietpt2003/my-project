import { Frame, FrameProcessorPlugin } from "react-native-vision-camera";

//the value is in percentage
export interface CropRegion {
    left: number;
    top: number;
    width: number;
    height: number;
}

export interface FacialConfig {
    cropRegion?: CropRegion;
    includeImageBase64?: boolean;
    saveAsFile?: boolean;
}

export interface FaceBoundingBox {
    left: number;
    top: number;
    width: number;
    height: number;
}

export interface FacialRecognitionResult {
    faces: FaceData[];
}

export interface FaceData {
    bounds: FaceBoundingBox;
    leftEyeOpenProbability: number;
    rightEyeOpenProbability: number;
    smilingProbability: number;
}

export function facialRecognition(frame: Frame, config?: FacialConfig, plugin?: FrameProcessorPlugin | undefined): FacialRecognitionResult {
    'worklet'

    if (plugin == null || plugin == undefined) throw new Error('Failed to load Plugin!')

    if (config) {
        let record: Record<string, any> = {};
        if (config.includeImageBase64 != undefined && config.includeImageBase64 != null) {
            record["includeImageBase64"] = config.includeImageBase64;
        }
        if (config.saveAsFile != undefined && config.saveAsFile != null) {
            record["saveAsFile"] = config.saveAsFile;
        }
        if (config.cropRegion) {
            let cropRegionRecord: Record<string, any> = {};
            cropRegionRecord["left"] = config.cropRegion.left;
            cropRegionRecord["top"] = config.cropRegion.top;
            cropRegionRecord["width"] = config.cropRegion.width;
            cropRegionRecord["height"] = config.cropRegion.height;
            record["cropRegion"] = cropRegionRecord;
        }
        return plugin.call(frame, record) as any;
    } else {
        return plugin.call(frame) as any;
    }
}