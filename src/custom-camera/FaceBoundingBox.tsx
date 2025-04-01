// import { SCREEN_HEIGHT, SCREEN_WIDTH } from "constant";
// import React from "react";
// import { View, StyleSheet } from "react-native";
// import Svg, { Rect } from "react-native-svg";
// import { FacialRecognitionResult } from "utils/facialRecognition";

// const FaceBoundingBox: React.FC<FacialRecognitionResult> = ({ faces }) => {
//     if (!faces || faces.length === 0) return null;

//     return (
//         <View style={styles.container}>
//             <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT} style={StyleSheet.absoluteFill}>
//                 {faces.map((face, index) => {
//                     const { left, top, right, bottom } = face.bounds;

//                     // Tính width và height từ boundingBox
//                     const width = right - left;
//                     const height = bottom - top;

//                     // Điều chỉnh lại x, y để phù hợp với hệ tọa độ của màn hình
//                     const x = left;
//                     const y = top;

//                     return (
//                         <Rect
//                             key={index}
//                             x={x / 5}
//                             y={y}
//                             width={width / 5}
//                             height={height / 5}
//                             stroke="red"
//                             strokeWidth={2}
//                             fill="none"
//                         />
//                     );
//                 })}
//             </Svg>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         position: "absolute",
//         top: 0,
//         left: 0,
//         width: SCREEN_WIDTH,
//         height: SCREEN_HEIGHT,
//     },
// });

// export default FaceBoundingBox;

import { SCREEN_HEIGHT, SCREEN_WIDTH } from "constant";
import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Rect, Circle, Text } from "react-native-svg";
import { Face } from "react-native-vision-camera-face-detector";
import { FacialRecognitionResultV2 } from "utils/facialRecognition";

// const SCREEN_WIDTH = 1080;  // Điều chỉnh theo kích thước thực tế
// const SCREEN_HEIGHT = 1920;

const FaceBoundingBox: React.FC<FacialRecognitionResultV2> = ({ faces }) => {
    // const { left, top, right, bottom } = faceData.bounds;
    // const boxWidth = right - left;
    // const boxHeight = bottom - top;
    function calculateFaceScale(bounds: { width: number; height: number }): number {
        // Giá trị tham chiếu: Kích thước khuôn mặt ở khoảng cách chuẩn (1m)
        const referenceWidth = 300;
        const referenceHeight = 300;
        const referenceDistance = 1; // 1m

        // Tính tỷ lệ scale theo cả width và height
        const scaleWidth = referenceWidth / bounds.width;
        const scaleHeight = referenceHeight / bounds.height;

        // Trung bình hai scale để có kết quả chính xác hơn
        const scale = (scaleWidth + scaleHeight) / 2;

        // Giới hạn giá trị scale để tránh sai số quá lớn
        return Math.max(0.1, Math.min(scale, 5)); // Scale nằm trong khoảng [0.1, 5]
    }

    function ajustedWidth(x: number, face: Face) {
        const scale = calculateFaceScale({ width: face.bounds.width, height: face.bounds.height });
        return (SCREEN_WIDTH - x) * scale;
    }

    return (
        <View style={styles.container}>
            <Svg width={"100%"} height={"100%"} viewBox={`0 0 ${1920} ${1080}`} style={StyleSheet.absoluteFill}>
                {faces.map((face, index) => {
                    const { x, y, width, height } = face.bounds;
                    const scaleWidth = SCREEN_WIDTH * (x / 1920)
                    const scale = calculateFaceScale({ width: width, height: height });
                    const adjustedX = SCREEN_WIDTH * (SCREEN_WIDTH - x) / 1920;
                    const adjustedY = SCREEN_HEIGHT - (y + height);
                    console.log("Face", face);

                    return (
                        <>
                            {/* Vẽ bounding box */}
                            <Rect
                                x={1920 - x}
                                y={y}
                                width={width}
                                height={height}
                                stroke="red"
                                strokeWidth={2}
                                fill="none"
                                key={index}
                            />

                            {/* Vẽ contours */}
                            {
                                face.contours?.FACE && face.contours?.FACE.map((point, index) => (
                                    <Circle
                                        key={index}
                                        cx={point.x / 5}
                                        cy={point.y / 5}
                                        r="2"
                                        fill="blue"
                                    />))
                            }
                            {
                                face.contours?.LEFT_EYE && face.contours?.LEFT_EYE.map((point, index) => (
                                    <Circle
                                        key={index}
                                        cx={point.x / 5}
                                        cy={point.y / 5}
                                        r="2"
                                        fill="white"
                                    />))
                            }
                            {
                                face.contours?.RIGHT_EYE && face.contours?.RIGHT_EYE.map((point, index) => (
                                    <Circle
                                        key={index}
                                        cx={point.x / 5}
                                        cy={point.y / 5}
                                        r="2"
                                        fill="white"
                                    />))
                            }
                            {
                                face.contours?.LEFT_EYEBROW_BOTTOM && face.contours?.LEFT_EYEBROW_BOTTOM.map((point, index) => (
                                    <Circle
                                        key={index}
                                        cx={point.x / 5}
                                        cy={point.y / 5}
                                        r="2"
                                        fill="orange"
                                    />))
                            }
                            {
                                face.contours?.RIGHT_EYEBROW_BOTTOM && face.contours?.RIGHT_EYEBROW_BOTTOM.map((point, index) => (
                                    <Circle
                                        key={index}
                                        cx={point.x / 5}
                                        cy={point.y / 5}
                                        r="2"
                                        fill="purple"
                                    />))
                            }
                            {
                                face.contours?.LEFT_EYEBROW_TOP && face.contours?.LEFT_EYEBROW_TOP.map((point, index) => (
                                    <Circle
                                        key={index}
                                        cx={point.x / 5}
                                        cy={point.y / 5}
                                        r="2"
                                        fill="red"
                                    />))
                            }
                            {
                                face.contours?.RIGHT_EYEBROW_TOP && face.contours?.RIGHT_EYEBROW_TOP.map((point, index) => (
                                    <Circle
                                        key={index}
                                        cx={point.x / 5}
                                        cy={point.y / 5}
                                        r="2"
                                        fill="green"
                                    />))
                            }
                            {
                                face.contours?.LOWER_LIP_BOTTOM && face.contours?.LOWER_LIP_BOTTOM.map((point, index) => (
                                    <Circle
                                        key={index}
                                        cx={point.x / 5}
                                        cy={point.y / 5}
                                        r="2"
                                        fill="blue"
                                    />))
                            }
                            {
                                face.contours?.LOWER_LIP_TOP && face.contours?.LOWER_LIP_TOP.map((point, index) => (
                                    <Circle
                                        key={index}
                                        cx={point.x / 5}
                                        cy={point.y / 5}
                                        r="2"
                                        fill="blue"
                                    />))
                            }
                            {
                                face.contours?.NOSE_BOTTOM && face.contours?.NOSE_BOTTOM.map((point, index) => (
                                    <Circle
                                        key={index}
                                        cx={point.x / 5}
                                        cy={point.y / 5}
                                        r="2"
                                        fill="green"
                                    />))
                            }
                            {
                                face.contours?.NOSE_BRIDGE && face.contours?.NOSE_BRIDGE.map((point, index) => (
                                    <Circle
                                        key={index}
                                        cx={point.x / 5}
                                        cy={point.y / 5}
                                        r="2"
                                        fill="purple"
                                    />))
                            }
                            {
                                face.contours?.RIGHT_CHEEK && face.contours?.RIGHT_CHEEK.map((point, index) => (
                                    <Circle
                                        key={index}
                                        cx={point.x / 5}
                                        cy={point.y / 5}
                                        r="2"
                                        fill="purple"
                                    />))
                            }
                            {
                                face.contours?.LEFT_CHEEK && face.contours?.LEFT_CHEEK.map((point, index) => (
                                    <Circle
                                        key={index}
                                        cx={point.x / 5}
                                        cy={point.y / 5}
                                        r="2"
                                        fill="purple"
                                    />))
                            }
                            {
                                face.contours?.UPPER_LIP_BOTTOM && face.contours?.UPPER_LIP_BOTTOM.map((point, index) => (
                                    <Circle
                                        key={index}
                                        cx={point.x / 5}
                                        cy={point.y / 5}
                                        r="2"
                                        fill="red"
                                    />))
                            }
                            {
                                face.contours?.UPPER_LIP_TOP && face.contours?.UPPER_LIP_TOP.map((point, index) => (
                                    <Circle
                                        key={index}
                                        cx={point.x / 5}
                                        cy={point.y / 5}
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
