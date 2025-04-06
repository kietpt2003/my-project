import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  Button,
  View,
  useWindowDimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  CameraRuntimeError,
  Frame,
  PhotoFile,
  VideoFile,
  Camera as VisionCamera,
  runAtTargetFps,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
} from 'react-native-vision-camera';
import { useIsFocused, useNavigation } from '@react-navigation/core';
import {
  Camera,
  Face,
  FaceDetectionOptions,
} from 'react-native-vision-camera-face-detector';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import RNFS from 'react-native-fs';
import { Colors, SCREEN_HEIGHT, SCREEN_WIDTH } from 'constant';
import { SvgOverlay, SvgOverlayV2 } from '../custom-camera/index';
import { height, objectFacesParse, width } from 'utils';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { Routes } from 'tabs/routes';

const cameraFacing = 'front';
type facePhotoPos = 'center' | 'left' | 'right' | 'upper' | 'bottom';

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
  const flash = useSharedValue<'off' | 'auto' | 'on' | undefined>('off');
  const camera = useRef<VisionCamera>(null);
  const aRot = useSharedValue(0);

  const navigation = useNavigation<NativeStackNavigationProp<Routes>>();

  const circleCenterX = useRef(width / 2);
  const circleCenterY = useRef(height / 2.5);
  const initFaceCenter = useSharedValue<Face | null>(null);
  const leftFace = useSharedValue<Face | null>(null);
  const rightFace = useSharedValue<Face | null>(null);
  const upperFace = useSharedValue<Face | null>(null);
  const bottomFace = useSharedValue<Face | null>(null);

  const [centerFaceState, setCenterFace] = useState<Face | null>(null);
  const [leftFaceState, setLeftFace] = useState<Face | null>(null);
  const [rightFaceState, setRightFace] = useState<Face | null>(null);
  const [upperFaceState, setUpperFace] = useState<Face | null>(null);
  const [bottomFaceState, setBottomFace] = useState<Face | null>(null);

  const [centerFacePhotoState, setCenterFacePhoto] = useState<string>('');
  const [leftFacePhotoState, setLeftFacePhoto] = useState<string>('');
  const [rightFacePhotoState, setRightFacePhoto] = useState<string>('');
  const [upperFacePhotoState, setUpperFacePhoto] = useState<string>('');
  const [bottomFacePhotoState, setBottomFacePhoto] = useState<string>('');

  const [isFetching, setFetching] = useState<boolean>(false);

  const [faceMsgWarning, setFaceMsgWarning] = useState('');

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
      initFaceCenter.value = null;
      leftFace.value = null;
      rightFace.value = null;
      upperFace.value = null;
      bottomFace.value = null;
      return;
    }

    // Break after have full picture info
    if (
      centerFacePhotoState != '' &&
      leftFacePhotoState != '' &&
      rightFacePhotoState != '' &&
      upperFacePhotoState != '' &&
      bottomFacePhotoState != ''
    ) {
      return;
    }

    const { bounds, rollAngle, yawAngle, pitchAngle } = faces[0];
    const { width, height, x, y } = bounds;
    const centerBoundX = x + width / 2;
    const centerBoundY = y + height / 2;
    const allowableX = Math.abs(centerBoundX - circleCenterX.current);
    const allowableY = Math.abs(centerBoundY - circleCenterY.current);
    const facesParse = objectFacesParse(faces);

    // Warning user to position their face
    if (initFaceCenter.value == null && faceMsgWarning.length == 0) {
      setFaceMsgWarning('Position your face within the frame.');
    }

    if (initFaceCenter.value != null) {
      setFaceMsgWarning('Move your head slowly to complete the circle.');
    }

    // Initialize center face
    if (
      allowableX >= 0 &&
      allowableX <= 30 &&
      allowableY >= 0 &&
      allowableY <= 40
    ) {
      // Should be looking straight foward
      if (
        rollAngle >= -5 &&
        rollAngle <= 5 &&
        pitchAngle >= -5 &&
        pitchAngle <= 30 &&
        yawAngle >= -5 &&
        yawAngle <= 5
      ) {
        initFaceCenter.value = facesParse[0];
        if (camera.current && initFaceCenter.value == null) {
          takePhoto('center');
        }
      }

      // Left face processor
      if (
        initFaceCenter.value != null &&
        yawAngle >= 10 &&
        yawAngle <= 60 &&
        pitchAngle >= -5 &&
        pitchAngle <= 25
      ) {
        leftFace.value = facesParse[0];
        if (camera.current && leftFace.value == null) {
          takePhoto('left');
        }
      }

      // Right face processor
      if (
        initFaceCenter.value != null &&
        yawAngle >= -60 &&
        yawAngle <= -20 &&
        pitchAngle >= -5 &&
        pitchAngle <= 25
      ) {
        rightFace.value = facesParse[0];
        if (camera.current && rightFace.value == null) {
          takePhoto('right');
        }
      }

      // Upper face processor
      if (
        initFaceCenter.value != null &&
        pitchAngle >= 20 &&
        pitchAngle <= 60 &&
        yawAngle >= -15 &&
        yawAngle <= 15 &&
        rollAngle >= -15 &&
        rollAngle <= 15
      ) {
        upperFace.value = facesParse[0];
        if (camera.current && upperFace.value == null) {
          takePhoto('upper');
        }
      }

      // Bottom face processor
      if (
        initFaceCenter.value != null &&
        pitchAngle >= -30 &&
        pitchAngle <= -8 &&
        yawAngle >= -15 &&
        yawAngle <= 15 &&
        rollAngle >= -15 &&
        rollAngle <= 15
      ) {
        bottomFace.value = facesParse[0];
        if (camera.current && bottomFace.value == null) {
          takePhoto('bottom');
        }
      }
    }
  }

  const onMediaCaptured = useCallback(
    (media: PhotoFile | VideoFile, type: 'photo' | 'video') => {
      console.log(`Media captured! ${JSON.stringify(media)}`);
    },
    [],
  );

  const takePhoto = useCallback(
    async (pos: string) => {
      try {
        if (camera.current == null) {
          throw new Error('Camera ref is null!');
        }

        const photo = await camera.current.takePhoto({
          flash: flash.value,
          enableShutterSound: false,
        });

        let photoPath = 'file://';
        if (Platform.OS == 'android') {
          photoPath += photo.path;
          const base64 = await RNFS.readFile(photoPath, 'base64');
          switch (pos) {
            case 'center':
              setCenterFacePhoto(base64);
              break;
            case 'left':
              setLeftFacePhoto(base64);
              break;
            case 'right':
              setRightFacePhoto(base64);
              break;
            case 'upper':
              setUpperFacePhoto(base64);
              break;
            case 'bottom':
              setBottomFacePhoto(base64);
              break;
            default:
              setCenterFacePhoto('');
              setLeftFacePhoto('');
              setRightFacePhoto('');
              setUpperFacePhoto('');
              setBottomFacePhoto('');
              break;
          }
        }
      } catch (e) {
        console.error('Failed to take photo!', e);
      }
    },
    [camera, flash, onMediaCaptured],
  );

  function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Set state shared value
  useAnimatedReaction(
    () => {
      return {
        initFaceCenter: initFaceCenter.value,
        leftFace: leftFace.value,
        rightFace: rightFace.value,
        upperFace: upperFace.value,
        bottomFace: bottomFace.value,
      };
    },
    (current, previous) => {
      if (current.initFaceCenter !== previous?.initFaceCenter) {
        runOnJS(setCenterFace)(current.initFaceCenter);
      }

      if (current.leftFace !== previous?.leftFace) {
        runOnJS(setLeftFace)(current.leftFace);
      }

      if (current.rightFace !== previous?.rightFace) {
        runOnJS(setRightFace)(current.rightFace);
      }

      if (current.upperFace !== previous?.upperFace) {
        runOnJS(setUpperFace)(current.upperFace);
      }

      if (current.bottomFace !== previous?.bottomFace) {
        runOnJS(setBottomFace)(current.bottomFace);
      }
    },
    [],
  );

  async function handleSendDataToServer(
    centerFaceData: Face,
    leftFaceData: Face,
    rightFaceData: Face,
    upperFaceData: Face,
    bottomFaceData: Face,
    centerPhoto: string,
    leftPhoto: string,
    rightPhoto: string,
    upperPhoto: string,
    bottomPhoto: string,
  ) {
    try {
      setFetching(true);
      await delay(2000);
      setFetching(false);
      navigation.replace('SuccessPage');
    } catch (error) {
      console.error('Send data fail');
    }
  }

  // Send data to server
  useEffect(() => {
    console.log(
      'checl',
      centerFaceState != null,
      leftFaceState != null,
      rightFaceState != null,
      upperFaceState != null,
      bottomFaceState != null,
      centerFacePhotoState.length > 0,
      leftFacePhotoState.length > 0,
      rightFacePhotoState.length > 0,
      upperFacePhotoState.length > 0,
      bottomFacePhotoState.length > 0,
    );

    if (
      centerFaceState != null &&
      leftFaceState != null &&
      rightFaceState != null &&
      upperFaceState != null &&
      bottomFaceState != null &&
      centerFacePhotoState.length > 0 &&
      leftFacePhotoState.length > 0 &&
      rightFacePhotoState.length > 0 &&
      upperFacePhotoState.length > 0 &&
      bottomFacePhotoState.length > 0
    ) {
      try {
        handleSendDataToServer(
          centerFaceState,
          leftFaceState,
          rightFaceState,
          upperFaceState,
          bottomFaceState,
          centerFacePhotoState,
          leftFacePhotoState,
          rightFacePhotoState,
          upperFacePhotoState,
          bottomFacePhotoState,
        );
      } catch (error) {
        console.error('loi ne');
      }
    }
  }, [
    centerFaceState,
    leftFaceState,
    rightFaceState,
    upperFaceState,
    bottomFaceState,
    centerFacePhotoState,
    leftFacePhotoState,
    rightFacePhotoState,
    upperFacePhotoState,
    bottomFacePhotoState,
  ]);

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
              isActive={(isCameraInitialized && isCameraActive) || !isFetching}
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

            {/* <SvgOverlay
              currentPercent={currentPercent}
              totalDuration={2000}
              yawAngle={aFaceYaw}
              pitchAngle={aFacePitch}
              rollAngle={aFaceRoll}
            /> */}
            <SvgOverlayV2
              leftFace={leftFace}
              rightFace={rightFace}
              upperFace={upperFace}
              bottomFace={bottomFace}
              leftFacePhoto={leftFacePhotoState}
              rightFacePhoto={rightFacePhotoState}
              upperFacePhoto={upperFacePhotoState}
              bottomFacePhoto={bottomFacePhotoState}
            />
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

      {faceMsgWarning.length > 0 && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningMsg} numberOfLines={2}>
            {faceMsgWarning}
          </Text>
        </View>
      )}

      {isFetching && (
        <View style={styles.indicatorContainer}>
          <ActivityIndicator size={50} color={Colors.background} />
        </View>
      )}
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
  warningContainer: {
    width: width,
    position: 'absolute',
    bottom: 200,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  warningMsg: {
    fontSize: 25,
    color: Colors.background,
    fontWeight: '500',
    textAlign: 'center',
  },
  indicatorContainer: {
    width: width,
    height: height,
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
