import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  Button,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  CameraRuntimeError,
  Frame,
  Camera as VisionCamera,
  runAtTargetFps,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
} from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/core';
import {
  Camera,
  Face,
  FaceDetectionOptions,
} from 'react-native-vision-camera-face-detector';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from 'constant';
import { SvgOverlay } from '../custom-camera/index';

const cameraFacing = 'front';

export default function CameraPageV2(): JSX.Element {
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const { width, height } = useWindowDimensions();
  const { hasPermission, requestPermission } = useCameraPermission();
  const [cameraPaused, setCameraPaused] = useState<boolean>(false);
  const [autoMode, setAutoMode] = useState<boolean>(true);

  const faceDetectionOptions = useRef<FaceDetectionOptions>({
    performanceMode: 'accurate',
    classificationMode: 'all',
    contourMode: 'none', //Should disable for tracking enable
    landmarkMode: 'all',
    windowWidth: width,
    windowHeight: height,
    trackingEnabled: true,
  }).current;
  const isFocused = useIsFocused();
  const isCameraActive = !cameraPaused && isFocused;
  const cameraDevice = useCameraDevice(cameraFacing);
  //
  // vision camera ref
  //
  const camera = useRef<VisionCamera>(null);
  //
  // face rectangle position
  //
  const aFaceW = useSharedValue(0);
  const aFaceH = useSharedValue(0);
  const aFaceX = useSharedValue(0);
  const aFaceY = useSharedValue(0);
  const aRot = useSharedValue(0);
  const boundingBoxStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    borderWidth: 4,
    borderLeftColor: 'rgb(0,255,0)',
    borderRightColor: 'rgb(0,255,0)',
    borderBottomColor: 'rgb(0,255,0)',
    borderTopColor: 'rgb(255,0,0)',
    width: withTiming(aFaceW.value, {
      duration: 100,
    }),
    height: withTiming(aFaceH.value, {
      duration: 100,
    }),
    left: withTiming(aFaceX.value, {
      duration: 100,
    }),
    top: withTiming(aFaceY.value, {
      duration: 100,
    }),
    transform: [
      {
        rotate: `${aRot.value}deg`,
      },
    ],
  }));

  useEffect(() => {
    if (hasPermission) {
      return;
    }
    requestPermission();
  }, []);

  const [targetFps, setTargetFps] = useState(60);

  const screenAspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH;
  const format = useCameraFormat(cameraDevice, [
    { fps: targetFps },
    { videoAspectRatio: screenAspectRatio },
    { videoResolution: 'max' },
    { photoAspectRatio: screenAspectRatio },
    { photoResolution: 'max' },
  ]);
  const fps = Math.min(format?.maxFps ?? 1, targetFps);

  function handleUiRotation(rotation: number) {
    aRot.value = rotation;
  }

  const onError = useCallback((error: CameraRuntimeError) => {
    console.error(error);
  }, []);
  const onInitialized = useCallback(() => {
    console.log('Camera initialized!');
    setIsCameraInitialized(true);
  }, []);

  function handleFacesDetected(faces: Face[], frame: Frame): void {
    // if no faces are detected we do nothing
    if (Object.keys(faces).length <= 0) {
      aFaceW.value = 0;
      aFaceH.value = 0;
      aFaceX.value = 0;
      aFaceY.value = 0;
      return;
    }

    const { bounds } = faces[0];
    const { width, height, x, y } = bounds;
    // aFaceW.value = width;
    // aFaceH.value = height;
    // aFaceX.value = x;
    // aFaceY.value = y;

    // console.log("check", faces[0]);

    // only call camera methods if ref is defined
    if (camera.current) {
      // take photo, capture video, etc...
    }
  }

  const [faces, setFaces] = useState<Face[]>([]);
  function handleFacesDetectedV2(faces: Face[], frame: Frame) {
    if (Object.keys(faces).length <= 0) {
      // facesData.value = [];
      return;
    }

    runAtTargetFps(10, () => {
      console.log('checkV2', faces);

      try {
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

        // console.log("check", detectedFaces.length);

        // facesData.value = detectedFaces;
        setFaces(detectedFaces);
        // console.log("data", facesData.value.length);
      } catch (error) {
        console.log('hâh', error);
      }
    });
  }

  // function handleSkiaActions(faces: Face[], frame: DrawableFrame): void {
  //   'worklet';

  //   // if no faces are detected we do nothing
  //   if (Object.keys(faces).length <= 0) {
  //     return;
  //   }

  //   console.log('SKIA - faces', faces.length, 'frame', frame.toString());

  //   const { bounds, contours, landmarks } = faces[0];

  //   // draw a blur shape around the face points
  //   const blurRadius = 25;
  //   const blurFilter = Skia.ImageFilter.MakeBlur(
  //     blurRadius,
  //     blurRadius,
  //     TileMode.Repeat,
  //     null,
  //   );
  //   const blurPaint = Skia.Paint();
  //   blurPaint.setImageFilter(blurFilter);
  //   const contourPath = Skia.Path.Make();
  //   const necessaryContours: (keyof Contours)[] = [
  //     'FACE',
  //     'LEFT_CHEEK',
  //     'RIGHT_CHEEK',
  //   ];

  //   necessaryContours.map(key => {
  //     contours?.[key]?.map((point, index) => {
  //       if (index === 0) {
  //         // it's a starting point
  //         contourPath.moveTo(point.x, point.y);
  //       } else {
  //         // it's a continuation
  //         contourPath.lineTo(point.x, point.y);
  //       }
  //     });
  //     contourPath.close();
  //   });

  //   frame.save();
  //   frame.clipPath(contourPath, ClipOp.Intersect, true);
  //   frame.render(blurPaint);
  //   frame.restore();

  //   // draw mouth shape
  //   const mouthPath = Skia.Path.Make();
  //   const mouthPaint = Skia.Paint();
  //   mouthPaint.setColor(Skia.Color('red'));
  //   const necessaryLandmarks: (keyof Landmarks)[] = [
  //     'MOUTH_BOTTOM',
  //     'MOUTH_LEFT',
  //     'MOUTH_RIGHT',
  //   ];

  //   necessaryLandmarks.map((key, index) => {
  //     const point = landmarks?.[key];
  //     if (!point) {
  //       return;
  //     }

  //     if (index === 0) {
  //       // it's a starting point
  //       mouthPath.moveTo(point.x, point.y);
  //     } else {
  //       // it's a continuation
  //       mouthPath.lineTo(point.x, point.y);
  //     }
  //   });
  //   mouthPath.close();
  //   frame.drawPath(mouthPath, mouthPaint);

  //   // draw a rectangle around the face
  //   const rectPaint = Skia.Paint();
  //   rectPaint.setColor(Skia.Color('blue'));
  //   rectPaint.setStyle(1);
  //   rectPaint.setStrokeWidth(5);
  //   frame.drawRect(bounds, rectPaint);
  // }

  const [currentPercent, setCurrentPercent] = useState(0);

  function handlePercent() {
    if (currentPercent < 100 && currentPercent >= 0) {
      setCurrentPercent(c => c + 20);
    }
  }

  return (
    <>
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}>
        {hasPermission && cameraDevice ? (
          <>
            <Camera
              ref={camera}
              style={StyleSheet.absoluteFill}
              isActive={isCameraInitialized && isCameraActive}
              device={cameraDevice}
              onError={onError}
              onInitialized={onInitialized}
              faceDetectionCallback={handleFacesDetected}
              onUIRotationChanged={handleUiRotation}
              faceDetectionOptions={{
                ...faceDetectionOptions,
                autoMode,
                cameraFacing,
              }}
              format={format}
              fps={fps}
              photo={true}
              video={false}
              enableFpsGraph={true}
            />

            {/* <Animated.View style={boundingBoxStyle} /> */}

            {cameraPaused && (
              <Text
                style={{
                  width: '100%',
                  backgroundColor: 'rgb(0,0,255)',
                  textAlign: 'center',
                  color: 'white',
                }}>
                Camera is PAUSED
              </Text>
            )}

            <SvgOverlay currentPercent={currentPercent} totalDuration={2000} />
          </>
        ) : (
          <Text
            style={{
              width: '100%',
              backgroundColor: 'rgb(255,0,0)',
              textAlign: 'center',
              color: 'white',
            }}>
            No camera device or permission
          </Text>
        )}
      </View>

      <View style={styles.controls}>
        <Button
          onPress={() => setAutoMode(c => !c)}
          title={`${autoMode ? 'Disable' : 'Enable'} AutoMode`}
        />
        <Button onPress={() => handlePercent()} title={`Increase`} />
        <Button
          onPress={() => setCameraPaused(c => !c)}
          title={`${cameraPaused ? 'Resume' : 'Pause'} Cam`}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  boundingBox: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: 'rgb(0,255,0)',
  },
  permissionText: {
    width: '100%',
    backgroundColor: 'rgb(255,0,0)',
    textAlign: 'center',
    color: 'white',
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    rowGap: 5,
  },
});
