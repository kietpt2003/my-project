import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { FacialRecognitionResult } from "utils/facialRecognition";

const FaceBoundingBox: React.FC<FacialRecognitionResult> = ({ faces }) => {
    if (!faces || faces.length === 0) return null;

    return (
        <View style={styles.container}>
            <Svg style={StyleSheet.absoluteFill}>
                {faces.map((face, index) => {
                    const { left, top, width, height } = face.bounds;
                    return (
                        <Rect
                            key={index}
                            x={left || 0}
                            y={top || 0}
                            width={width || 0}
                            height={height || 0}
                            stroke="red"
                            strokeWidth={2}
                            fill="none"
                        />
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
    },
});

export default FaceBoundingBox;
