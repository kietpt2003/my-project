import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { Face } from 'react-native-vision-camera-face-detector';
import Svg, { Circle, Rect } from 'react-native-svg';

interface FaceBoundBoxProps {
  faces: Face[];
}

const FaceBoundingBoxV2 = ({ faces }: FaceBoundBoxProps) => {
  return (
    <View
      style={[
        styles.container,
        // { transform: [{ scaleX: -1 }] }
      ]}>
      <Svg width={'100%'} height={'100%'} style={StyleSheet.absoluteFill}>
        {faces.map((face, index) => {
          const { x, y, width, height } = face.bounds;
          return (
            <>
              {/* Vẽ bounding box */}
              <Rect
                x={x}
                y={y}
                width={width}
                height={height}
                stroke="red"
                strokeWidth={2}
                fill="none"
                key={index}
              />

              {/* Vẽ contours */}
              {face.contours?.FACE &&
                face.contours?.FACE.map((point, index) => {
                  if (index > 17) {
                    //Trái
                    return (
                      <Circle
                        key={index}
                        cx={point.x}
                        cy={point.y}
                        r="2"
                        fill="white"
                      />
                    );
                  } else {
                    //Phải
                    return (
                      <Circle
                        key={index}
                        cx={point.x}
                        // cx={point.x / phoneScale}
                        cy={point.y}
                        r="2"
                        fill="blue"
                      />
                    );
                  }
                })}
              {/* {
                                    face.contours?.FACE && face.contours?.FACE.map((point, index) => (
                                        <Circle
                                            key={index}
                                            cx={point.x}
                                            cy={point.y}
                                            r="2"
                                            fill="white"
                                        />
                                    ))
                                } */}

              {/* LEFT_EYEBROWk */}
              {face.contours?.LEFT_EYEBROW_BOTTOM &&
                face.contours?.LEFT_EYEBROW_BOTTOM.map((point, index) => {
                  return (
                    <Circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r="2"
                      fill="orange"
                    />
                  );
                })}
              {face.contours?.LEFT_EYEBROW_TOP &&
                face.contours?.LEFT_EYEBROW_TOP.map((point, index) => {
                  return (
                    <Circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r="2"
                      fill="orange"
                    />
                  );
                })}

              {face.contours?.LEFT_EYE &&
                face.contours?.LEFT_EYE.map((point, index) => {
                  return (
                    <Circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r="2"
                      fill="orange"
                    />
                  );
                })}

              {/* LEFT_CHEEK */}
              {face.contours?.LEFT_CHEEK &&
                face.contours?.LEFT_CHEEK.map((point, index) => {
                  return (
                    <Circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r="2"
                      fill="yellow"
                    />
                  );
                })}
              {face.contours?.RIGHT_EYE &&
                face.contours?.RIGHT_EYE.map((point, index) => {
                  return (
                    <Circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r="2"
                      fill="pink"
                    />
                  );
                })}
              {face.contours?.RIGHT_EYEBROW_BOTTOM &&
                face.contours?.RIGHT_EYEBROW_BOTTOM.map((point, index) => {
                  return (
                    <Circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r="2"
                      fill="pink"
                    />
                  );
                })}
              {face.contours?.RIGHT_EYEBROW_TOP &&
                face.contours?.RIGHT_EYEBROW_TOP.map((point, index) => {
                  return (
                    <Circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r="2"
                      fill="pink"
                    />
                  );
                })}
              {face.contours?.RIGHT_CHEEK &&
                face.contours?.RIGHT_CHEEK.map((point, index) => {
                  return (
                    <Circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r="2"
                      fill="green"
                    />
                  );
                })}
              {face.contours?.NOSE_BRIDGE &&
                face.contours?.NOSE_BRIDGE.map((point, index) => (
                  <Circle
                    key={index}
                    cx={point.x}
                    cy={point.y}
                    r="2"
                    fill="cyan"
                  />
                ))}
              {face.contours?.NOSE_BOTTOM &&
                face.contours?.NOSE_BOTTOM.map((point, index) => (
                  <Circle
                    key={index}
                    cx={point.x}
                    // cx={point.x / phoneScale}
                    cy={point.y}
                    r="2"
                    fill="cyan"
                  />
                ))}
              {face.contours?.LOWER_LIP_BOTTOM &&
                face.contours?.LOWER_LIP_BOTTOM.map((point, index) => (
                  <Circle
                    key={index}
                    cx={point.x}
                    // cx={point.x / phoneScale}
                    cy={point.y}
                    r="2"
                    fill="brown"
                  />
                ))}
              {face.contours?.LOWER_LIP_TOP &&
                face.contours?.LOWER_LIP_TOP.map((point, index) => (
                  <Circle
                    key={index}
                    cx={point.x}
                    // cx={point.x / phoneScale}
                    cy={point.y}
                    r="2"
                    fill="brown"
                  />
                ))}
              {face.contours?.UPPER_LIP_BOTTOM &&
                face.contours?.UPPER_LIP_BOTTOM.map((point, index) => (
                  <Circle
                    key={index}
                    cx={point.x}
                    // cx={point.x / phoneScale}
                    cy={point.y}
                    r="2"
                    fill="brown"
                  />
                ))}
              {face.contours?.UPPER_LIP_TOP &&
                face.contours?.UPPER_LIP_TOP.map((point, index) => (
                  <Circle
                    key={index}
                    cx={point.x}
                    // cx={point.x / phoneScale}
                    cy={point.y}
                    r="2"
                    fill="brown"
                  />
                ))}
            </>
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default FaceBoundingBoxV2;
