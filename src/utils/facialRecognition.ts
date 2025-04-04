import { Frame, FrameProcessorPlugin } from 'react-native-vision-camera';
import { Face } from 'react-native-vision-camera-face-detector';

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
  right: number;
  bottom: number;
}

export interface PointData {
  x: number;
  y: number;
}

export interface ContourData {
  faceContourType: number;
  points: PointData[];
}

export interface LandmarkData {
  ladmarkType: number;
  positionX: number;
  positionY: number;
}

export interface FacialRecognitionResult {
  faces: FaceData[];
}

export interface FacialRecognitionResultV2 {
  faces: Face[];
}

export interface FaceData {
  bounds: FaceBoundingBox;
  leftEyeOpenProbability: number;
  rightEyeOpenProbability: number;
  smilingProbability: number;
  headEulerAngleX: number;
  headEulerAngleY: number;
  headEulerAngleZ: number;
  allContours: ContourData[];
  allLandmarks: LandmarkData[];
  imageWidth: number;
  imageHeight: number;
}

export function facialRecognition(
  frame: Frame,
  config?: FacialConfig,
  plugin?: FrameProcessorPlugin | undefined,
): FacialRecognitionResult {
  'worklet';

  if (plugin == null || plugin == undefined) {
    throw new Error('Failed to load Plugin!');
  }

  if (config) {
    let record: Record<string, any> = {};
    if (
      config.includeImageBase64 != undefined &&
      config.includeImageBase64 != null
    ) {
      record.includeImageBase64 = config.includeImageBase64;
    }
    if (config.saveAsFile != undefined && config.saveAsFile != null) {
      record.saveAsFile = config.saveAsFile;
    }
    if (config.cropRegion) {
      let cropRegionRecord: Record<string, any> = {};
      cropRegionRecord.left = config.cropRegion.left;
      cropRegionRecord.top = config.cropRegion.top;
      cropRegionRecord.width = config.cropRegion.width;
      cropRegionRecord.height = config.cropRegion.height;
      record.cropRegion = cropRegionRecord;
    }
    return plugin.call(frame, record) as any;
  } else {
    return plugin.call(frame) as any;
  }
}
