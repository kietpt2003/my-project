import { Colors } from 'constant';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Svg, { Rect, Circle, Defs, Mask } from 'react-native-svg';

export interface SvgOverlayProps {
  currentPercent: number;
  totalDuration: number;
}

export default function SvgOverlay({
  currentPercent,
  totalDuration,
}: SvgOverlayProps) {
  const [progress, setProgress] = useState(0);
  // const progress = useSharedValue(0);

  const { width, height } = useWindowDimensions();
  const radius = Math.min(width, height) * 0.4; // Điều chỉnh kích thước hình tròn

  const strokeWidth = 5;
  const circumference = 2 * Math.PI * (radius + strokeWidth);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    if (currentPercent > 0) {
      const step = 2; // Mỗi lần tăng bao nhiêu step
      const steps = Math.ceil(currentPercent / step); // Tổng số bước cần thực hiện
      const intervalTime = totalDuration / steps; // Thời gian giữa mỗi lần tăng

      const interval = setInterval(() => {
        setProgress(prev =>
          prev < currentPercent ? prev + step : currentPercent,
        );
        // if (progress.value < currentPercent) {
        //   progress.value += step;
        // } else {
        //   progress.value = currentPercent;
        // }
      }, intervalTime);

      return () => clearInterval(interval);
    }
  }, [currentPercent]);

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

        <Circle
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
        />
      </Svg>
    </View>
  );
}
