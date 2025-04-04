import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  PhotoFile,
  VideoFile,
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
import { Colors, SCREEN_HEIGHT, SCREEN_WIDTH } from 'constant';
import { SvgOverlay, SvgOverlayV2 } from '../custom-camera/index';
import { objectFacesParse, width } from 'utils';

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
  const flash = useSharedValue<'off' | 'auto' | 'on' | undefined>('off');
  const camera = useRef<VisionCamera>(null);
  const aRot = useSharedValue(0);

  const circleCenterX = useRef(width / 2);
  const circleCenterY = useRef(height / 2.5);
  const initFaceCenter = useSharedValue<Face | null>(null);
  const leftFace = useSharedValue<Face | null>(null);
  const rightFace = useSharedValue<Face | null>(null);
  const upperFace = useSharedValue<Face | null>(null);
  const bottomFace = useSharedValue<Face | null>(null);

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

  const aFaceYaw = useSharedValue(0);
  const aFacePitch = useSharedValue(0);
  const aFaceRoll = useSharedValue(0);

  const [faceMsgWarning, setFaceMsgWarning] = useState('');

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
      }

      // Bottom face processor
      if (
        initFaceCenter.value != null &&
        pitchAngle >= -30 &&
        pitchAngle <= -10 &&
        yawAngle >= -15 &&
        yawAngle <= 15 &&
        rollAngle >= -15 &&
        rollAngle <= 15
      ) {
        bottomFace.value = facesParse[0];
      }
    }

    // only call camera methods if ref is defined
    if (camera.current) {
      // take photo, capture video, etc...
    }
  }

  const [currentPercent, setCurrentPercent] = useState(30);

  function handlePercent() {
    if (currentPercent < 100 && currentPercent >= 0) {
      setCurrentPercent(c => c + 20);
    }
  }

  const onMediaCaptured = useCallback(
    (media: PhotoFile | VideoFile, type: 'photo' | 'video') => {
      console.log(`Media captured! ${JSON.stringify(media)}`);
    },
    [],
  );

  const takePhoto = useCallback(async () => {
    try {
      if (camera.current == null) {
        throw new Error('Camera ref is null!');
      }

      console.log('Taking photo...');
      const photo = await camera.current.takePhoto({
        flash: flash.value,
        enableShutterSound: false,
      });
      onMediaCaptured(photo, 'photo');
    } catch (e) {
      console.error('Failed to take photo!', e);
    }
  }, [camera, flash, onMediaCaptured]);

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
});
