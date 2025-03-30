import * as React from 'react'
import { useRef, useState, useCallback, useMemo } from 'react'
import type { GestureResponderEvent } from 'react-native'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import type { PinchGestureHandlerGestureEvent } from 'react-native-gesture-handler'
import { PinchGestureHandler, TapGestureHandler } from 'react-native-gesture-handler'
import type { CameraProps, CameraRuntimeError, PhotoFile, VideoFile } from 'react-native-vision-camera'
import {
    runAtTargetFps,
    useCameraDevice,
    useCameraFormat,
    useFrameProcessor,
    useLocationPermission,
    useMicrophonePermission,
} from 'react-native-vision-camera'
import { Camera } from 'react-native-vision-camera'
import { CONTENT_SPACING, CONTROL_BUTTON_SIZE, MAX_ZOOM_FACTOR, SAFE_AREA_PADDING, SCREEN_HEIGHT, SCREEN_WIDTH } from 'constant'
import Reanimated, { Extrapolate, interpolate, runOnJS, useAnimatedGestureHandler, useAnimatedProps, useSharedValue } from 'react-native-reanimated'
import { useEffect } from 'react'
import { useIsForeground } from '../hooks/useIsForeground'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useIsFocused } from '@react-navigation/core'
import { usePreferredCameraDevice } from '../hooks/usePreferredCameraDevice'
import { Routes } from 'tabs/routes'
import { CaptureButton } from './CaptureButton'
import { StatusBarBlurBackground } from './StatusBarBlurBackground'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import IonIcon from 'react-native-vector-icons/Ionicons'
import { NativeModules } from 'react-native'

const { FacialRecognition } = NativeModules // Import the native module

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera)
Reanimated.addWhitelistedNativeProps({
    zoom: true,
})

const SCALE_FULL_ZOOM = 3

type Props = NativeStackScreenProps<Routes, 'CameraPage'>
export default function CameraPage({ navigation }: Props): React.ReactElement {
    const camera = useRef<Camera>(null)
    const [isCameraInitialized, setIsCameraInitialized] = useState(false)
    const microphone = useMicrophonePermission()
    const location = useLocationPermission()
    const zoom = useSharedValue(1)
    const isPressingButton = useSharedValue(false)

    // check if camera page is active
    const isFocussed = useIsFocused()
    const isForeground = useIsForeground()
    const isActive = isFocussed && isForeground

    const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('back')
    const [enableHdr, setEnableHdr] = useState(false)
    const [flash, setFlash] = useState<'off' | 'on'>('off')
    const [enableNightMode, setEnableNightMode] = useState(false)

    // camera device settings
    const [preferredDevice] = usePreferredCameraDevice()
    let device = useCameraDevice(cameraPosition)

    if (preferredDevice != null && preferredDevice.position === cameraPosition) {
        // override default device with the one selected by the user in settings
        device = preferredDevice
    }

    const [targetFps, setTargetFps] = useState(60)

    const screenAspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH
    const format = useCameraFormat(device, [
        { fps: targetFps },
        { videoAspectRatio: screenAspectRatio },
        { videoResolution: 'max' },
        { photoAspectRatio: screenAspectRatio },
        { photoResolution: 'max' },
    ])
    const fps = Math.min(format?.maxFps ?? 1, targetFps)

    const supportsFlash = device?.hasFlash ?? false
    const supportsHdr = format?.supportsPhotoHdr
    const supports60Fps = useMemo(() => device?.formats.some((f) => f.maxFps >= 60), [device?.formats])
    const canToggleNightMode = device?.supportsLowLightBoost ?? false

    //#region Animated Zoom
    const minZoom = device?.minZoom ?? 1
    const maxZoom = Math.min(device?.maxZoom ?? 1, MAX_ZOOM_FACTOR)

    const cameraAnimatedProps = useAnimatedProps<CameraProps>(() => {
        const z = Math.max(Math.min(zoom.value, maxZoom), minZoom)
        return {
            zoom: z,
        }
    }, [maxZoom, minZoom, zoom])
    //#endregion

    //#region Callbacks
    const setIsPressingButton = useCallback(
        (_isPressingButton: boolean) => {
            isPressingButton.value = _isPressingButton
        },
        [isPressingButton],
    )
    const onError = useCallback((error: CameraRuntimeError) => {
        console.error(error)
    }, [])
    const onInitialized = useCallback(() => {
        console.log('Camera initialized!')
        setIsCameraInitialized(true)
    }, [])
    const onMediaCaptured = useCallback(
        (media: PhotoFile | VideoFile, type: 'photo' | 'video') => {
            console.log(`Media captured! ${JSON.stringify(media)}`)
            navigation.navigate('MediaPage', {
                path: media.path,
                type: type,
            })
        },
        [navigation],
    )
    const onFlipCameraPressed = useCallback(() => {
        setCameraPosition((p) => (p === 'back' ? 'front' : 'back'))
    }, [])
    const onFlashPressed = useCallback(() => {
        setFlash((f) => (f === 'off' ? 'on' : 'off'))
    }, [])
    //#endregion

    //#region Tap Gesture
    const onFocusTap = useCallback(
        ({ nativeEvent: event }: GestureResponderEvent) => {
            if (!device?.supportsFocus) return
            camera.current?.focus({
                x: event.locationX,
                y: event.locationY,
            })
        },
        [device?.supportsFocus],
    )
    const onDoubleTap = useCallback(() => {
        onFlipCameraPressed()
    }, [onFlipCameraPressed])
    //#endregion

    //#region Effects
    useEffect(() => {
        // Reset zoom to it's default everytime the `device` changes.
        zoom.value = device?.neutralZoom ?? 1
    }, [zoom, device])
    //#endregion

    //#region Pinch to Zoom Gesture
    // The gesture handler maps the linear pinch gesture (0 - 1) to an exponential curve since a camera's zoom
    // function does not appear linear to the user. (aka zoom 0.1 -> 0.2 does not look equal in difference as 0.8 -> 0.9)
    const onPinchGesture = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent, { startZoom?: number }>({
        onStart: (_, context) => {
            context.startZoom = zoom.value
        },
        onActive: (event, context) => {
            // we're trying to map the scale gesture to a linear zoom here
            const startZoom = context.startZoom ?? 0
            const scale = interpolate(event.scale, [1 - 1 / SCALE_FULL_ZOOM, 1, SCALE_FULL_ZOOM], [-1, 0, 1], Extrapolate.CLAMP)
            zoom.value = interpolate(scale, [-1, 0, 1], [minZoom, startZoom, maxZoom], Extrapolate.CLAMP)
        },
    })
    //#endregion

    useEffect(() => {
        const f =
            format != null
                ? `(${format.photoWidth}x${format.photoHeight} photo / ${format.videoWidth}x${format.videoHeight}@${format.maxFps} video @ ${fps}fps)`
                : undefined
        console.log(`Camera: ${device?.name} | Format: ${f}`)
    }, [device?.name, format, fps])

    useEffect(() => {
        location.requestPermission()
    }, [location])

    async function processImageBuffer(buffer: ArrayBuffer, width: number, height: number) {
        const base64Image = Buffer.from(new Uint8Array(buffer)).toString('base64');
        try {
            const faces = await FacialRecognition.detectFaces(base64Image);
            console.log('Detected Faces:', faces);
        } catch (error) {
            console.error('Error detecting faces:', error);
        }
    }

    const frameProcessor = useFrameProcessor((frame) => {
        'worklet'

        runAtTargetFps(10, () => {
            'worklet'
            try {
                console.log("vo day");
                if (frame.pixelFormat === 'rgb') {
                    const buffer = frame.toArrayBuffer();

                    runOnJS(processImageBuffer)(buffer, frame.width, frame.height);
                }
            } catch (error) {
                console.error('Error processing frame:', error);
            }
        })
    }, [])

    const videoHdr = format?.supportsVideoHdr && enableHdr
    const photoHdr = format?.supportsPhotoHdr && enableHdr && !videoHdr

    return (
        <View style={styles.container}>
            {device != null ? (
                <PinchGestureHandler onGestureEvent={onPinchGesture} enabled={isActive}>
                    <Reanimated.View onTouchEnd={onFocusTap} style={StyleSheet.absoluteFill}>
                        <TapGestureHandler onEnded={onDoubleTap} numberOfTaps={2}>
                            <ReanimatedCamera
                                style={StyleSheet.absoluteFill}
                                device={device}
                                isActive={isActive}
                                ref={camera}
                                onInitialized={onInitialized}
                                onError={onError}
                                onStarted={() => console.log('Camera started!')}
                                onStopped={() => console.log('Camera stopped!')}
                                onPreviewStarted={() => console.log('Preview started!')}
                                onPreviewStopped={() => console.log('Preview stopped!')}
                                onOutputOrientationChanged={(o) => console.log(`Output orientation changed to ${o}!`)}
                                onPreviewOrientationChanged={(o) => console.log(`Preview orientation changed to ${o}!`)}
                                onUIRotationChanged={(degrees) => console.log(`UI Rotation changed: ${degrees}°`)}
                                format={format}
                                fps={fps}
                                photoHdr={photoHdr}
                                videoHdr={videoHdr}
                                photoQualityBalance="quality"
                                lowLightBoost={device.supportsLowLightBoost && enableNightMode}
                                enableZoomGesture={false}
                                animatedProps={cameraAnimatedProps}
                                exposure={0}
                                enableFpsGraph={true}
                                outputOrientation="device"
                                photo={true}
                                video={true}
                                audio={microphone.hasPermission}
                                enableLocation={location.hasPermission}
                                frameProcessor={frameProcessor}
                            />
                        </TapGestureHandler>
                    </Reanimated.View>
                </PinchGestureHandler>
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.text}>Your phone does not have a Camera.</Text>
                </View>
            )}

            <CaptureButton
                style={styles.captureButton}
                camera={camera}
                onMediaCaptured={onMediaCaptured}
                cameraZoom={zoom}
                minZoom={minZoom}
                maxZoom={maxZoom}
                flash={supportsFlash ? flash : 'off'}
                enabled={isCameraInitialized && isActive}
                setIsPressingButton={setIsPressingButton}
            />

            <StatusBarBlurBackground />

            <View style={styles.rightButtonRow}>
                <TouchableOpacity style={styles.button} onPress={onFlipCameraPressed}>
                    {/* <IonIcon name="camera-reverse" color="white" size={24} /> */}
                    <Text style={{ color: "white" }}>Change</Text>
                </TouchableOpacity>
                {supportsFlash && (
                    <TouchableOpacity style={styles.button} onPress={onFlashPressed}>
                        {/* <IonIcon name={flash === 'on' ? 'flash' : 'flash-off'} color="white" size={24} /> */}
                        <Text style={{ color: "white" }}>flash</Text>
                    </TouchableOpacity>
                )}
                {supports60Fps && (
                    <TouchableOpacity style={styles.button} onPress={() => setTargetFps((t) => (t === 30 ? 60 : 30))}>
                        <Text style={styles.text}>{`${targetFps}\nFPS`}</Text>
                    </TouchableOpacity>
                )}
                {supportsHdr && (
                    <TouchableOpacity style={styles.button} onPress={() => setEnableHdr((h) => !h)}>
                        {/* <MaterialIcon name={enableHdr ? 'hdr' : 'hdr-off'} color="white" size={24} /> */}
                        <Text style={{ color: "white" }}>hdr</Text>
                    </TouchableOpacity>
                )}
                {canToggleNightMode && (
                    <TouchableOpacity style={styles.button} onPress={() => setEnableNightMode(!enableNightMode)}>
                        {/* <IonIcon name={enableNightMode ? 'moon' : 'moon-outline'} color="white" size={24} /> */}
                        <Text style={{ color: "white" }}>moon</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Devices')}>
                    {/* <IonIcon name="settings-outline" color="white" size={24} /> */}
                    <Text style={{ color: "white" }}>setting</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CodeScannerPage')}>
                    {/* <IonIcon name="qr-code-outline" color="white" size={24} /> */}
                    <Text style={{ color: "white" }}>qrcode</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    captureButton: {
        position: 'absolute',
        alignSelf: 'center',
        bottom: SAFE_AREA_PADDING.paddingBottom,
    },
    button: {
        marginBottom: CONTENT_SPACING,
        width: CONTROL_BUTTON_SIZE,
        height: CONTROL_BUTTON_SIZE,
        borderRadius: CONTROL_BUTTON_SIZE / 2,
        backgroundColor: 'rgba(140, 140, 140, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightButtonRow: {
        position: 'absolute',
        right: SAFE_AREA_PADDING.paddingRight,
        top: SAFE_AREA_PADDING.paddingTop,
    },
    text: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})
