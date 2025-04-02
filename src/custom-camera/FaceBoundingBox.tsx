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
                    console.log("Face", face.yawAngle);

                    return (
                        <>
                            {/* Vẽ bounding box */}
                            <Rect
                                x={correctedX}
                                // x={x / phoneScale}
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
                                    if (index > 17) { //Trái
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
                                    } else { //Phải
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
                            {/* {
                                face.contours?.FACE && face.contours?.FACE.map((point, index) => (
                                    <Circle
                                        key={index}
                                        cx={handleCoordinate(point.x, SCREEN_WIDTH)}
                                        cy={point.y / phoneScale}
                                        r="2"
                                        fill="white"
                                    />
                                ))
                            } */}

                            {/* LEFT_EYEBROWk */}
                            {
                                face.contours?.LEFT_EYEBROW_BOTTOM && face.contours?.LEFT_EYEBROW_BOTTOM.map((point, index) => {
                                    const handledLeftEyeBrowBotCoord = handleCoordinate(point.x, SCREEN_WIDTH);
                                    const tempCoord = correctedX + imageWidthScaled - handledLeftEyeBrowBotCoord;
                                    const fixedXCoord = correctedX + tempCoord;
                                    return (
                                        <Circle
                                            key={index}
                                            cx={fixedXCoord}
                                            cy={point.y / phoneScale}
                                            r="2"
                                            fill="orange"
                                        />
                                    )
                                })
                            }
                            {
                                face.contours?.LEFT_EYEBROW_TOP && face.contours?.LEFT_EYEBROW_TOP.map((point, index) => {
                                    const handledLeftEyeBrowTopCoord = handleCoordinate(point.x, SCREEN_WIDTH);
                                    const tempCoord = correctedX + imageWidthScaled - handledLeftEyeBrowTopCoord;
                                    const fixedXCoord = correctedX + tempCoord;
                                    return (
                                        <Circle
                                            key={index}
                                            cx={fixedXCoord}
                                            cy={point.y / phoneScale}
                                            r="2"
                                            fill="orange"
                                        />
                                    )
                                })
                            }

                            {
                                face.contours?.LEFT_EYE && face.contours?.LEFT_EYE.map((point, index) => {
                                    const handledLeftEyeCoord = handleCoordinate(point.x, SCREEN_WIDTH);
                                    const tempCoord = correctedX + imageWidthScaled - handledLeftEyeCoord;
                                    const fixedXCoord = correctedX + tempCoord;
                                    return (
                                        <Circle
                                            key={index}
                                            cx={fixedXCoord}
                                            cy={point.y / phoneScale}
                                            r="2"
                                            fill="orange"
                                        />
                                    )
                                })
                            }

                            {/* LEFT_CHEEK */}
                            {
                                face.contours?.LEFT_CHEEK && face.contours?.LEFT_CHEEK.map((point, index) => {
                                    const handledLeftCheekCoord = handleCoordinate(point.x, SCREEN_WIDTH);
                                    const tempCoord = correctedX + imageWidthScaled - handledLeftCheekCoord;
                                    const fixedXCoord = correctedX + tempCoord;
                                    return (
                                        <Circle
                                            key={index}
                                            cx={fixedXCoord}
                                            cy={point.y / phoneScale}
                                            r="2"
                                            fill="yellow"
                                        />
                                    )
                                })
                            }
                            {
                                face.contours?.RIGHT_EYE && face.contours?.RIGHT_EYE.map((point, index) => {
                                    const handledRightEyeCoord = handleCoordinate(point.x, SCREEN_WIDTH);
                                    const tempCoord = handledRightEyeCoord - correctedX;
                                    const fixedXCoord = imageWidthScaled + correctedX - tempCoord;
                                    return (
                                        <Circle
                                            key={index}
                                            cx={fixedXCoord}
                                            cy={point.y / phoneScale}
                                            r="2"
                                            fill="pink"
                                        />
                                    )
                                })
                            }
                            {
                                face.contours?.RIGHT_EYEBROW_BOTTOM && face.contours?.RIGHT_EYEBROW_BOTTOM.map((point, index) => {
                                    const handledRightEyeBrowBotCoord = handleCoordinate(point.x, SCREEN_WIDTH);
                                    const tempCoord = handledRightEyeBrowBotCoord - correctedX;
                                    const fixedXCoord = imageWidthScaled + correctedX - tempCoord;
                                    return (
                                        <Circle
                                            key={index}
                                            cx={fixedXCoord}
                                            cy={point.y / phoneScale}
                                            r="2"
                                            fill="pink"
                                        />
                                    )
                                })
                            }
                            {
                                face.contours?.RIGHT_EYEBROW_TOP && face.contours?.RIGHT_EYEBROW_TOP.map((point, index) => {
                                    const handledRightEyeBrowTopCoord = handleCoordinate(point.x, SCREEN_WIDTH);
                                    const tempCoord = handledRightEyeBrowTopCoord - correctedX;
                                    const fixedXCoord = imageWidthScaled + correctedX - tempCoord;
                                    return (
                                        <Circle
                                            key={index}
                                            cx={fixedXCoord}
                                            cy={point.y / phoneScale}
                                            r="2"
                                            fill="pink"
                                        />
                                    )
                                })
                            }
                            {
                                face.contours?.RIGHT_CHEEK && face.contours?.RIGHT_CHEEK.map((point, index) => {
                                    const handledRightEyeCheekCoord = handleCoordinate(point.x, SCREEN_WIDTH);
                                    const tempCoord = handledRightEyeCheekCoord - correctedX;
                                    const fixedXCoord = imageWidthScaled + correctedX - tempCoord;
                                    return (
                                        <Circle
                                            key={index}
                                            cx={fixedXCoord}
                                            cy={point.y / phoneScale}
                                            r="2"
                                            fill="green"
                                        />
                                    )
                                })
                            }
                            {
                                face.contours?.NOSE_BRIDGE && face.contours?.NOSE_BRIDGE.map((point, index) => (
                                    <Circle
                                        key={index}
                                        cx={handleCoordinate(point.x, SCREEN_WIDTH)}
                                        cy={point.y / phoneScale}
                                        r="2"
                                        fill="cyan"
                                    />))
                            }
                            {
                                face.contours?.NOSE_BOTTOM && face.contours?.NOSE_BOTTOM.map((point, index) => (
                                    <Circle
                                        key={index}
                                        cx={handleCoordinate(point.x, SCREEN_WIDTH)}
                                        // cx={point.x / phoneScale}
                                        cy={point.y / phoneScale}
                                        r="2"
                                        fill="cyan"
                                    />))
                            }
                            {
                                face.contours?.LOWER_LIP_BOTTOM && face.contours?.LOWER_LIP_BOTTOM.map((point, index) => (
                                    <Circle
                                        key={index}
                                        cx={handleCoordinate(point.x, SCREEN_WIDTH)}
                                        // cx={point.x / phoneScale}
                                        cy={point.y / phoneScale}
                                        r="2"
                                        fill="brown"
                                    />))
                            }
                            {
                                face.contours?.LOWER_LIP_TOP && face.contours?.LOWER_LIP_TOP.map((point, index) => (
                                    <Circle
                                        key={index}
                                        cx={handleCoordinate(point.x, SCREEN_WIDTH)}
                                        // cx={point.x / phoneScale}
                                        cy={point.y / phoneScale}
                                        r="2"
                                        fill="brown"
                                    />))
                            }
                            {
                                face.contours?.UPPER_LIP_BOTTOM && face.contours?.UPPER_LIP_BOTTOM.map((point, index) => (
                                    <Circle
                                        key={index}
                                        cx={handleCoordinate(point.x, SCREEN_WIDTH)}
                                        // cx={point.x / phoneScale}
                                        cy={point.y / phoneScale}
                                        r="2"
                                        fill="brown"
                                    />))
                            }
                            {
                                face.contours?.UPPER_LIP_TOP && face.contours?.UPPER_LIP_TOP.map((point, index) => (
                                    <Circle
                                        key={index}
                                        cx={handleCoordinate(point.x, SCREEN_WIDTH)}
                                        // cx={point.x / phoneScale}
                                        cy={point.y / phoneScale}
                                        r="2"
                                        fill="brown"
                                    />))
                            }
                        </>
                    );
                })}
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
