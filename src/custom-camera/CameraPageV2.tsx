import React, {
    useEffect,
    useRef,
    useState
} from 'react'
import {
    StyleSheet,
    Text,
    Button,
    View,
    useWindowDimensions
} from 'react-native'
import {
    CameraPosition,
    DrawableFrame,
    Frame,
    Camera as VisionCamera,
    useCameraDevice,
    useCameraPermission
} from 'react-native-vision-camera'
import { useIsFocused } from '@react-navigation/core'
import {
    Camera,
    Face,
    FaceDetectionOptions,
    Contours,
    Landmarks
} from 'react-native-vision-camera-face-detector'
import {
    ClipOp,
    Skia,
    TileMode
} from '@shopify/react-native-skia'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated'
import { Worklets } from 'react-native-worklets-core'


export default function CameraPageV2(): JSX.Element {
    const {
        width,
        height
    } = useWindowDimensions()
    const {
        hasPermission,
        requestPermission
    } = useCameraPermission()
    const [
        cameraMounted,
        setCameraMounted
    ] = useState<boolean>(false)
    const [
        cameraPaused,
        setCameraPaused
    ] = useState<boolean>(false)
    const [
        autoMode,
        setAutoMode
    ] = useState<boolean>(true)
    const [
        cameraFacing,
        setCameraFacing
    ] = useState<CameraPosition>('front')
    const faceDetectionOptions = useRef<FaceDetectionOptions>({
        performanceMode: 'fast',
        classificationMode: 'all',
        contourMode: 'all',
        landmarkMode: 'all',
        windowWidth: width,
        windowHeight: height
    }).current
    const isFocused = useIsFocused()
    const isCameraActive = (
        !cameraPaused &&
        isFocused
    )
    const cameraDevice = useCameraDevice(cameraFacing)
    //
    // vision camera ref
    //
    const camera = useRef<VisionCamera>(null)
    //
    // face rectangle position
    //
    const aFaceW = useSharedValue(0)
    const aFaceH = useSharedValue(0)
    const aFaceX = useSharedValue(0)
    const aFaceY = useSharedValue(0)
    const aRot = useSharedValue(0)
    const boundingBoxStyle = useAnimatedStyle(() => ({
        position: 'absolute',
        borderWidth: 4,
        borderLeftColor: 'rgb(0,255,0)',
        borderRightColor: 'rgb(0,255,0)',
        borderBottomColor: 'rgb(0,255,0)',
        borderTopColor: 'rgb(255,0,0)',
        width: withTiming(aFaceW.value, {
            duration: 100
        }),
        height: withTiming(aFaceH.value, {
            duration: 100
        }),
        left: withTiming(aFaceX.value, {
            duration: 100
        }),
        top: withTiming(aFaceY.value, {
            duration: 100
        }),
        transform: [{
            rotate: `${aRot.value}deg`
        }]
    }))
    const facesData = useSharedValue<{ x: number, y: number, width: number, height: number }[]>([]);

    useEffect(() => {
        if (hasPermission) return
        requestPermission()
    }, [])

    /**
     * Handle camera UI rotation
     * 
     * @param {number} rotation Camera rotation
     */
    function handleUiRotation(
        rotation: number
    ) {
        aRot.value = rotation
    }

    /**
     * Hanldes camera mount error event
     *
     * @param {any} error Error event
     */
    function handleCameraMountError(
        error: any
    ) {
        console.error('camera mount error', error)
    }

    /**
     * Handle detection result
     * 
     * @param {Face[]} faces Detection result 
     * @param {Frame} frame Current frame
     * @returns {void}
     */
    function handleFacesDetected(
        faces: Face[],
        frame: Frame
    ): void {
        // if no faces are detected we do nothing
        if (Object.keys(faces).length <= 0) {
            aFaceW.value = 0
            aFaceH.value = 0
            aFaceX.value = 0
            aFaceY.value = 0
            return
        }

        const { bounds } = faces[0]
        const {
            width,
            height,
            x,
            y
        } = bounds
        aFaceW.value = width
        aFaceH.value = height
        aFaceX.value = x
        aFaceY.value = y

        console.log("check", faces[0]);


        // only call camera methods if ref is defined
        if (camera.current) {
            // take photo, capture video, etc...
        }
    }

    function handleFacesDetectedV2(faces: Face[], frame: Frame) {
        if (Object.keys(faces).length <= 0) {
            // facesData.value = [];
            return;
        }

        console.log("checkV2", faces);

        try {

            const detectedFaces = Object.keys(faces).map(key => {
                const face = faces[key]
                return {
                    x: face.bounds.x,
                    y: face.bounds.y,
                    width: face.bounds.width,
                    height: face.bounds.height
                }
            })

            facesData.value = detectedFaces
        } catch (error) {

            console.log("hâh", error);
        }


    }

    return (<>
        <View
            style={[
                StyleSheet.absoluteFill, {
                    alignItems: 'center',
                    justifyContent: 'center'
                }
            ]}
        >
            {hasPermission && cameraDevice ? <>
                {cameraMounted && <>
                    <Camera
                        // @ts-ignore
                        ref={camera}
                        style={StyleSheet.absoluteFill}
                        isActive={isCameraActive}
                        device={cameraDevice}
                        onError={handleCameraMountError}
                        faceDetectionCallback={handleFacesDetectedV2}
                        onUIRotationChanged={handleUiRotation}
                        // @ts-ignore
                        // skiaActions={handleSkiaActions}
                        faceDetectionOptions={{
                            ...faceDetectionOptions,
                            autoMode,
                            cameraFacing
                        }}
                    />

                    <Animated.View
                        style={boundingBoxStyle}
                    />
                    {/* {facesData.value.map((face, index) => (
                        <Animated.View
                            key={index}
                            style={useAnimatedStyle(() => ({
                                position: 'absolute',
                                borderWidth: 4,
                                borderColor: 'rgb(0,255,0)',
                                width: withTiming(face.width, { duration: 100 }),
                                height: withTiming(face.height, { duration: 100 }),
                                left: withTiming(face.x, { duration: 100 }),
                                top: withTiming(face.y, { duration: 100 })
                            }))}
                        />
                    ))} */}

                    {cameraPaused && <Text
                        style={{
                            width: '100%',
                            backgroundColor: 'rgb(0,0,255)',
                            textAlign: 'center',
                            color: 'white'
                        }}
                    >
                        Camera is PAUSED
                    </Text>}
                </>}

                {!cameraMounted && <Text
                    style={{
                        width: '100%',
                        backgroundColor: 'rgb(255,255,0)',
                        textAlign: 'center'
                    }}
                >
                    Camera is NOT mounted
                </Text>}
            </> : <Text
                style={{
                    width: '100%',
                    backgroundColor: 'rgb(255,0,0)',
                    textAlign: 'center',
                    color: 'white'
                }}
            >
                No camera device or permission
            </Text>}
        </View>

        <View style={styles.controls}>
            <Button onPress={() => setCameraFacing(c => (c === 'front' ? 'back' : 'front'))} title={`Toggle Cam ${facesData.value.length}`} />
            <Button onPress={() => setAutoMode(c => !c)} title={`${autoMode ? 'Disable' : 'Enable'} AutoMode`} />
            <Button onPress={() => setCameraPaused(c => !c)} title={`${cameraPaused ? 'Resume' : 'Pause'} Cam`} />
            <Button onPress={() => setCameraMounted(c => !c)} title={`${cameraMounted ? 'Unmount' : 'Mount'} Cam`} />
        </View>
    </>)
}

const styles = StyleSheet.create({
    boundingBox: {
        position: 'absolute',
        borderWidth: 3,
        borderColor: 'rgb(0,255,0)'
    },
    permissionText: {
        width: '100%',
        backgroundColor: 'rgb(255,0,0)',
        textAlign: 'center',
        color: 'white'
    },
    controls: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        flexWrap: "wrap",
        rowGap: 5
    }
});
