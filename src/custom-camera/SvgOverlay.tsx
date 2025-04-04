import { Colors } from 'constant';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedProps,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Rect, Circle, Defs, Mask, Text } from 'react-native-svg';

export interface SvgOverlayProps {
  currentPercent: number;
  totalDuration: number;
  yawAngle: SharedValue<number>;
  pitchAngle: SharedValue<number>;
  rollAngle: SharedValue<number>;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function SvgOverlay({
  currentPercent,
  totalDuration,
  yawAngle,
  pitchAngle,
  rollAngle,
}: SvgOverlayProps) {
  const [progress, setProgress] = useState(0);
  // const progress = useSharedValue(0);

  const { width, height } = useWindowDimensions();
  const radius = Math.min(width, height) * 0.45; // Điều chỉnh kích thước hình tròn

  const strokeWidth = 5;
  const circumference = 2 * Math.PI * (radius + strokeWidth);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // useEffect(() => {
  //   if (currentPercent > 0) {
  //     const step = 2; // Mỗi lần tăng bao nhiêu step
  //     const steps = Math.ceil(currentPercent / step); // Tổng số bước cần thực hiện
  //     const intervalTime = totalDuration / steps; // Thời gian giữa mỗi lần tăng

  //     const interval = setInterval(() => {
  //       setProgress(prev =>
  //         prev < currentPercent ? prev + step : currentPercent,
  //       );
  //       // if (progress.value < currentPercent) {
  //       //   progress.value += step;
  //       // } else {
  //       //   progress.value = currentPercent;
  //       // }
  //     }, intervalTime);

  //     return () => clearInterval(interval);
  //   }
  // }, [currentPercent]);

  function calculateFaceRotation(
    yaw: number,
    pitch: number,
    roll: number,
  ): number {
    'worklet';

    // Tính toán góc xoay dựa trên công thức
    const rotationAngle = Math.atan2(
      Math.sin(yaw),
      Math.cos(pitch) * Math.cos(roll),
    );

    const degree = (rotationAngle * 180) / Math.PI;
    if (degree >= 360) {
      return 359;
    } else {
      return degree;
    }
    // // Chuyển đổi kết quả từ radian sang độ
    // return (rotationAngle * 180) / Math.PI;
  }

  // Cập nhật góc xoay mỗi khi props thay đổi
  // Derived Value để tính góc động
  const rotation = useDerivedValue(() => {
    return calculateFaceRotation(
      yawAngle.value,
      pitchAngle.value,
      rollAngle.value,
    );
  });

  // Tính phần trăm từ góc quay (0 đến 360 độ)
  const percentRotation = useDerivedValue(() => {
    const angle = rotation.value;
    const normalizedAngle = (angle + 360) % 360; // Đảm bảo góc không bị âm
    return (normalizedAngle / 360) * 100; // Chuyển đổi góc thành phần trăm
  });

  // Dùng phần trăm tính được để tính toán viền vòng tròn
  const dashLength = useDerivedValue(() => {
    return (percentRotation.value / 100) * circumference; // Phần viền sẽ được vẽ theo phần trăm
  });

  const dashGap = useDerivedValue(() => {
    return circumference - dashLength.value; // Phần vòng tròn không được vẽ
  });

  // Animated Props để gán vào transform và strokeDasharray
  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDasharray: [dashLength.value, dashGap.value], // Vẽ phần viền theo phần trăm
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

        {/* <Circle
          cx={width / 2}
          cy={height / 2.5}
          r={radius + strokeWidth}
          stroke={Colors.background}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${width / 2} ${height / 2.5})`}
        /> */}

        <AnimatedCircle
          cx={width / 2}
          cy={height / 2.5}
          r={radius}
          stroke={Colors.background}
          strokeWidth={5}
          fill="none"
          transform={`rotate(90 ${width / 2} ${height / 2.5})`}
          animatedProps={animatedProps} // Gán animated transform
        />
      </Svg>
    </View>
  );
}
