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

export function objectFacesParse(faces: Face[]) {
  const detectedFaces = Object.keys(faces).map(key => {
    const face = faces[parseInt(key)];

    // Contours FACE
    const FACE = face.contours
      ? Object.keys(face.contours.FACE).map(k => {
          const data = face.contours!.FACE[parseInt(k)];
          return {
            x: data.x,
            y: data.y,
          };
        })
      : [];

    // Contours LEFT_EYEBROW_TOP
    const LEFT_EYEBROW_TOP = face.contours
      ? Object.keys(face.contours.LEFT_EYEBROW_TOP).map(k => {
          const data = face.contours!.LEFT_EYEBROW_TOP[parseInt(k)];
          return {
            x: data.x,
            y: data.y,
          };
        })
      : [];

    // Contours LEFT_EYEBROW_BOTTOM
    const LEFT_EYEBROW_BOTTOM = face.contours
      ? Object.keys(face.contours.LEFT_EYEBROW_BOTTOM).map(k => {
          const data = face.contours!.LEFT_EYEBROW_BOTTOM[parseInt(k)];
          return {
            x: data.x,
            y: data.y,
          };
        })
      : [];

    // Contours RIGHT_EYEBROW_TOP
    const RIGHT_EYEBROW_TOP = face.contours
      ? Object.keys(face.contours.RIGHT_EYEBROW_TOP).map(k => {
          const data = face.contours!.RIGHT_EYEBROW_TOP[parseInt(k)];
          return {
            x: data.x,
            y: data.y,
          };
        })
      : [];

    // Contours RIGHT_EYEBROW_BOTTOM
    const RIGHT_EYEBROW_BOTTOM = face.contours
      ? Object.keys(face.contours.RIGHT_EYEBROW_BOTTOM).map(k => {
          const data = face.contours!.RIGHT_EYEBROW_BOTTOM[parseInt(k)];
          return {
            x: data.x,
            y: data.y,
          };
        })
      : [];

    // Contours LEFT_EYE
    const LEFT_EYE = face.contours
      ? Object.keys(face.contours.LEFT_EYE).map(k => {
          const data = face.contours!.LEFT_EYE[parseInt(k)];
          return {
            x: data.x,
            y: data.y,
          };
        })
      : [];

    // Contours RIGHT_EYE
    const RIGHT_EYE = face.contours
      ? Object.keys(face.contours.RIGHT_EYE).map(k => {
          const data = face.contours!.RIGHT_EYE[parseInt(k)];
          return {
            x: data.x,
            y: data.y,
          };
        })
      : [];

    // Contours UPPER_LIP_TOP
    const UPPER_LIP_TOP = face.contours
      ? Object.keys(face.contours.UPPER_LIP_TOP).map(k => {
          const data = face.contours!.UPPER_LIP_TOP[parseInt(k)];
          return {
            x: data.x,
            y: data.y,
          };
        })
      : [];

    // Contours UPPER_LIP_BOTTOM
    const UPPER_LIP_BOTTOM = face.contours
      ? Object.keys(face.contours.UPPER_LIP_BOTTOM).map(k => {
          const data = face.contours!.UPPER_LIP_BOTTOM[parseInt(k)];
          return {
            x: data.x,
            y: data.y,
          };
        })
      : [];

    // Contours LOWER_LIP_TOP
    const LOWER_LIP_TOP = face.contours
      ? Object.keys(face.contours.LOWER_LIP_TOP).map(k => {
          const data = face.contours!.LOWER_LIP_TOP[parseInt(k)];
          return {
            x: data.x,
            y: data.y,
          };
        })
      : [];

    // Contours LOWER_LIP_BOTTOM
    const LOWER_LIP_BOTTOM = face.contours
      ? Object.keys(face.contours.LOWER_LIP_BOTTOM).map(k => {
          const data = face.contours!.LOWER_LIP_BOTTOM[parseInt(k)];
          return {
            x: data.x,
            y: data.y,
          };
        })
      : [];

    // Contours NOSE_BRIDGE
    const NOSE_BRIDGE = face.contours
      ? Object.keys(face.contours.NOSE_BRIDGE).map(k => {
          const data = face.contours!.NOSE_BRIDGE[parseInt(k)];
          return {
            x: data.x,
            y: data.y,
          };
        })
      : [];

    // Contours NOSE_BOTTOM
    const NOSE_BOTTOM = face.contours
      ? Object.keys(face.contours.NOSE_BOTTOM).map(k => {
          const data = face.contours!.NOSE_BOTTOM[parseInt(k)];
          return {
            x: data.x,
            y: data.y,
          };
        })
      : [];

    // Contours LEFT_CHEEK
    const LEFT_CHEEK = face.contours
      ? Object.keys(face.contours.LEFT_CHEEK).map(k => {
          const data = face.contours!.LEFT_CHEEK[parseInt(k)];
          return {
            x: data.x,
            y: data.y,
          };
        })
      : [];

    // Contours RIGHT_CHEEK
    const RIGHT_CHEEK = face.contours
      ? Object.keys(face.contours.RIGHT_CHEEK).map(k => {
          const data = face.contours!.RIGHT_CHEEK[parseInt(k)];
          return {
            x: data.x,
            y: data.y,
          };
        })
      : [];

    return {
      bounds: face.bounds,
      contours: face.contours
        ? {
            FACE,
            LEFT_EYEBROW_TOP,
            LEFT_EYEBROW_BOTTOM,
            RIGHT_EYEBROW_TOP,
            RIGHT_EYEBROW_BOTTOM,
            LEFT_EYE,
            RIGHT_EYE,
            UPPER_LIP_TOP,
            UPPER_LIP_BOTTOM,
            LOWER_LIP_TOP,
            LOWER_LIP_BOTTOM,
            NOSE_BRIDGE,
            NOSE_BOTTOM,
            LEFT_CHEEK,
            RIGHT_CHEEK,
          }
        : undefined,
      landmarks: face.landmarks,
      leftEyeOpenProbability: face.leftEyeOpenProbability,
      pitchAngle: face.pitchAngle,
      rightEyeOpenProbability: face.rightEyeOpenProbability,
      rollAngle: face.rollAngle,
      smilingProbability: face.smilingProbability,
      yawAngle: face.yawAngle,
    };
  });

  return detectedFaces;
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
