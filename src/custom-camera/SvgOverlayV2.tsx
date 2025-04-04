import { Colors } from 'constant';
import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedProps,
  useDerivedValue,
} from 'react-native-reanimated';
import Svg, { Rect, Circle, Defs, Mask } from 'react-native-svg';
import { Face } from 'react-native-vision-camera-face-detector';

export interface SvgOverlayProps {
  leftFace: SharedValue<Face | null>;
  rightFace: SharedValue<Face | null>;
  upperFace: SharedValue<Face | null>;
  bottomFace: SharedValue<Face | null>;
}

const AnimatedLeftCircle = Animated.createAnimatedComponent(Circle);
const AnimatedRightCircle = Animated.createAnimatedComponent(Circle);
const AnimatedUpperCircle = Animated.createAnimatedComponent(Circle);
const AnimatedBottomCircle = Animated.createAnimatedComponent(Circle);

export default function SvgOverlayV2({
  leftFace,
  rightFace,
  upperFace,
  bottomFace,
}: SvgOverlayProps) {
  const { width, height } = useWindowDimensions();
  const radius = Math.min(width, height) * 0.45; // Điều chỉnh kích thước hình tròn

  const strokeWidth = 5;
  const circumference = 2 * Math.PI * (radius + strokeWidth);

  // Trả về phần trăm nếu quét được face left
  const percentRotationLeft = useDerivedValue(() => {
    if (leftFace.value == null) {
      return 0;
    } else {
      return 25;
    }
  });
  const percentRotationRight = useDerivedValue(() => {
    if (rightFace.value == null) {
      return 0;
    } else {
      return 25;
    }
  });
  const percentRotationUpper = useDerivedValue(() => {
    if (upperFace.value == null) {
      return 0;
    } else {
      return 25;
    }
  });
  const percentRotationBottom = useDerivedValue(() => {
    if (bottomFace.value == null) {
      return 0;
    } else {
      return 25;
    }
  });

  // Dùng phần trăm tính được để tính toán viền vòng tròn
  const dashLeftLength = useDerivedValue(() => {
    return (percentRotationLeft.value / 100) * circumference; // Phần viền sẽ được vẽ theo phần trăm
  });
  const dashRightLength = useDerivedValue(() => {
    return (percentRotationRight.value / 100) * circumference;
  });
  const dashUpperLength = useDerivedValue(() => {
    return (percentRotationUpper.value / 100) * circumference;
  });
  const dashBottomLength = useDerivedValue(() => {
    return (percentRotationBottom.value / 100) * circumference;
  });

  const dashLeftGap = useDerivedValue(() => {
    return circumference - dashLeftLength.value; // Phần vòng tròn không được vẽ
  });
  const dashRightGap = useDerivedValue(() => {
    return circumference - dashRightLength.value;
  });
  const dashUpperGap = useDerivedValue(() => {
    return circumference - dashUpperLength.value;
  });
  const dashBottomGap = useDerivedValue(() => {
    return circumference - dashBottomLength.value;
  });

  // Animated Props để gán vào transform và strokeDasharray
  const animatedPropsLeft = useAnimatedProps(() => {
    return {
      strokeDasharray: [dashLeftLength.value, dashLeftGap.value], // Vẽ phần viền theo phần trăm
    };
  });
  const animatedPropsRight = useAnimatedProps(() => {
    return {
      strokeDasharray: [dashRightLength.value, dashRightGap.value],
    };
  });
  const animatedPropsUpper = useAnimatedProps(() => {
    return {
      strokeDasharray: [dashUpperLength.value, dashUpperGap.value],
    };
  });
  const animatedPropsBottom = useAnimatedProps(() => {
    return {
      strokeDasharray: [dashBottomLength.value, dashBottomGap.value],
    };
  });

  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg width={width} height={height}>
        <Defs>
          <Mask id="mask" x="0" y="0" width={width} height={height}>
            <Rect width={width} height={height} fill="white" />
            <Circle
              cx={width / 2}
              cy={height / 2.5}
              r={radius}
              fill="black"
              strokeWidth={strokeWidth}
            />
          </Mask>
        </Defs>

        <Rect
          width={width}
          height={height}
          fill="rgba(255, 255, 255, 1)"
          mask="url(#mask)"
        />

        <AnimatedLeftCircle
          cx={width / 2}
          cy={height / 2.5}
          r={radius}
          stroke={Colors.background}
          strokeWidth={5}
          fill="none"
          transform={`rotate(90 ${width / 2} ${height / 2.5})`}
          animatedProps={animatedPropsLeft}
        />
        <AnimatedRightCircle
          cx={width / 2}
          cy={height / 2.5}
          r={radius}
          stroke={Colors.background}
          strokeWidth={5}
          fill="none"
          transform={`rotate(-90 ${width / 2} ${height / 2.5})`}
          animatedProps={animatedPropsRight}
        />
        <AnimatedUpperCircle
          cx={width / 2}
          cy={height / 2.5}
          r={radius}
          stroke={Colors.background}
          strokeWidth={5}
          fill="none"
          transform={`rotate(180 ${width / 2} ${height / 2.5})`}
          animatedProps={animatedPropsUpper}
        />
        <AnimatedBottomCircle
          cx={width / 2}
          cy={height / 2.5}
          r={radius}
          stroke={Colors.background}
          strokeWidth={5}
          fill="none"
          transform={`rotate(0 ${width / 2} ${height / 2.5})`}
          animatedProps={animatedPropsBottom}
        />
      </Svg>
    </View>
  );
}
