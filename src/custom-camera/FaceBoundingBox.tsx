import { transformOrigin } from "@shopify/react-native-skia";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "constant";
import React from "react";
import { PixelRatio } from "react-native";
import { View, StyleSheet } from "react-native";
import Svg, { Rect, Circle, Text } from "react-native-svg";
import { FacialRecognitionResultV2 } from "utils/facialRecognition";

const FaceBoundingBox: React.FC<FacialRecognitionResultV2> = ({ faces }) => {
    const phoneScale = PixelRatio.get();

    const handleCorrectX = (x: number, width: number) => {
        return SCREEN_WIDTH - (x / phoneScale) - (width / phoneScale);
    }

    const handleCoordinate = (coor: number, size: number) => {
        return size - coor / phoneScale
    }

    return (
        <View style={[
            styles.container,
            // { transform: [{ scaleX: -1 }] }
        ]}>
            <Svg width={"100%"} height={"100%"} style={StyleSheet.absoluteFill}>
                {faces.map((face, index) => {
                    const { x, y, width, height } = face.bounds;
                    const imageWidthScaled = width / phoneScale;
                    const correctedX = SCREEN_WIDTH - (x / phoneScale) - imageWidthScaled;
                    const correctedY = SCREEN_HEIGHT - (y / phoneScale) - (height / phoneScale);
                    console.log("Face", x, y,);

                    return (
                        <>
                            {/* Vẽ bounding box */}
                            <Rect
                                x={correctedX}
                                // y={correctedY}
                                y={y / phoneScale}
                                width={width / phoneScale}
                                height={height / phoneScale}
                                stroke="red"
                                strokeWidth={2}
                                fill="none"
                                key={index}
                            />

                            {/* Vẽ contours */}
                            {
                                face.contours?.FACE && face.contours?.FACE.map((point, index) => {
                                    if (index > 17) {
                                        return (
                                            <Circle
                                                key={index}
                                                cx={handleCoordinate(point.x, SCREEN_WIDTH)}
                                                // cx={point.x / phoneScale}
                                                cy={point.y / phoneScale}
                                                r="2"
                                                fill="white"
                                            />
                                        );
                                    } else {
                                        return (
                                            <Circle
                                                key={index}
                                                cx={handleCoordinate(point.x, SCREEN_WIDTH)}
                                                // cx={point.x / phoneScale}
                                                cy={point.y / phoneScale}
                                                r="2"
                                                fill="blue"
                                            />
                                        )
                                    }
                                })
                            }
                            {
                                face.contours?.LEFT_EYE && face.contours?.LEFT_EYE.map((point, index) => {
                                    const handledLeftEyeCoord = handleCoordinate(point.x, SCREEN_WIDTH);
                                    const fixedXCoord = imageWidthScaled - handledLeftEyeCoord;
                                    return (
                                        <Circle
                                            key={index}
                                            // cx={handleCoordinate(point.x, SCREEN_WIDTH)}
                                            cx={-fixedXCoord}
                                            cy={point.y / phoneScale}
                                            r="2"
                                            fill="green"
                                        />
                                    )
                                })
                            }
                            {
                                face.contours?.RIGHT_EYE && face.contours?.RIGHT_EYE.map((point, index) => {
                                    const handledRightEyeCoord = handleCoordinate(point.x, SCREEN_WIDTH);
                                    const tempCoord = handledRightEyeCoord - correctedX;
                                    const fixedXCoord = imageWidthScaled + correctedX - handledRightEyeCoord;
                                    return (
                                        <Circle
                                            key={index}
                                            // cx={handleCoordinate(point.x, SCREEN_WIDTH)}
                                            cx={-fixedXCoord}
                                            cy={point.y / phoneScale}
                                            r="2"
                                            fill="white"
                                        />
                                    )
                                })
                            }
                            {
                                face.contours?.LEFT_EYEBROW_BOTTOM && face.contours?.LEFT_EYEBROW_BOTTOM.map((point, index) => (
                                    <Circle
                                        key={index}
                                        // cx={handleCoordinate(point.x, SCREEN_WIDTH)}
                                        cx={point.x / phoneScale}
                                        cy={point.y / phoneScale}
                                        r="2"
                                        fill="orange"
                                    />))
                            }
                            {
                                face.contours?.RIGHT_EYEBROW_BOTTOM && face.contours?.RIGHT_EYEBROW_BOTTOM.map((point, index) => (
                                    <Circle
                                        key={index}
                                        // cx={handleCoordinate(point.x, SCREEN_WIDTH)}
                                        cx={point.x / phoneScale}
                                        cy={point.y / phoneScale}
                                        r="2"
                                        fill="purple"
                                    />))
                            }
                            {
                                face.contours?.LEFT_EYEBROW_TOP && face.contours?.LEFT_EYEBROW_TOP.map((point, index) => (
                                    <Circle
                                        key={index}
                                        // cx={handleCoordinate(point.x, SCREEN_WIDTH)}
                                        cx={point.x / phoneScale}
                                        cy={point.y / phoneScale}
                                        r="2"
                                        fill="red"
                                    />))
                            }
                            {
                                face.contours?.RIGHT_EYEBROW_TOP && face.contours?.RIGHT_EYEBROW_TOP.map((point, index) => (
                                    <Circle
                                        key={index}
                                        // cx={handleCoordinate(point.x, SCREEN_WIDTH)}
                                        cx={point.x / phoneScale}
                                        cy={point.y / phoneScale}
                                        r="2"
                                        fill="green"
                                    />))
                            }
                            {
                                face.contours?.LOWER_LIP_BOTTOM && face.contours?.LOWER_LIP_BOTTOM.map((point, index) => (
                                    <Circle
                                        key={index}
                                        // cx={handleCoordinate(point.x, SCREEN_WIDTH)}
                                        cx={point.x / phoneScale}
                                        cy={point.y / phoneScale}
                                        r="2"
                                        fill="blue"
                                    />))
                            }
                            {
                                face.contours?.LOWER_LIP_TOP && face.contours?.LOWER_LIP_TOP.map((point, index) => (
                                    <Circle
                                        key={index}
                                        // cx={handleCoordinate(point.x, SCREEN_WIDTH)}
                                        cx={point.x / phoneScale}
                                        cy={point.y / phoneScale}
                                        r="2"
                                        fill="blue"
                                    />))
                            }
                            {
                                face.contours?.NOSE_BOTTOM && face.contours?.NOSE_BOTTOM.map((point, index) => (
                                    <Circle
                                        key={index}
                                        // cx={handleCoordinate(point.x, SCREEN_WIDTH)}
                                        cx={point.x / phoneScale}
                                        cy={point.y / phoneScale}
                                        r="2"
                                        fill="green"
                                    />))
                            }
                            {
                                face.contours?.NOSE_BRIDGE && face.contours?.NOSE_BRIDGE.map((point, index) => (
                                    <Circle
                                        key={index}
                                        // cx={handleCoordinate(point.x, SCREEN_WIDTH)}
                                        cx={point.x / phoneScale}
                                        cy={point.y / phoneScale}
                                        r="2"
                                        fill="purple"
                                    />))
                            }
                            {
                                face.contours?.RIGHT_CHEEK && face.contours?.RIGHT_CHEEK.map((point, index) => (
                                    <Circle
                                        key={index}
                                        // cx={handleCoordinate(point.x, SCREEN_WIDTH)}
                                        cx={point.x / phoneScale}
                                        cy={point.y / phoneScale}
                                        r="2"
                                        fill="purple"
                                    />))
                            }
                            {
                                face.contours?.LEFT_CHEEK && face.contours?.LEFT_CHEEK.map((point, index) => (
                                    <Circle
                                        key={index}
                                        // cx={handleCoordinate(point.x, SCREEN_WIDTH)}
                                        cx={point.x / phoneScale}
                                        cy={point.y / phoneScale}
                                        r="2"
                                        fill="purple"
                                    />))
                            }
                            {
                                face.contours?.UPPER_LIP_BOTTOM && face.contours?.UPPER_LIP_BOTTOM.map((point, index) => (
                                    <Circle
                                        key={index}
                                        // cx={handleCoordinate(point.x, SCREEN_WIDTH)}
                                        cx={point.x / phoneScale}
                                        cy={point.y / phoneScale}
                                        r="2"
                                        fill="red"
                                    />))
                            }
                            {
                                face.contours?.UPPER_LIP_TOP && face.contours?.UPPER_LIP_TOP.map((point, index) => (
                                    <Circle
                                        key={index}
                                        // cx={handleCoordinate(point.x, SCREEN_WIDTH)}
                                        cx={point.x / phoneScale}
                                        cy={point.y / phoneScale}
                                        r="2"
                                        fill="pink"
                                    />))
                            }

                        </>
                    );
                })}
                <Circle
                    cx={10}
                    cy={10}
                    r="4"
                    fill="green"
                />
                <Circle
                    cx={210}
                    cy={10}
                    r="4"
                    fill="green"
                />
            </Svg>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    }
});

export default FaceBoundingBox;
