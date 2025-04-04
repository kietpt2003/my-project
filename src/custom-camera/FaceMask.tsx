/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';

export default function FaceMask() {
  const { width, height } = useWindowDimensions();
  const radius = Math.min(width, height) * 0.3; // Điều chỉnh kích thước vòng tròn

  // Tạo hình chữ nhật phủ toàn bộ màn hình
  const path = Skia.Path.Make();
  path.addRect({ x: 0, y: 0, width, height });

  // Tạo một vòng tròn ở giữa
  const circlePath = Skia.Path.Make();
  circlePath.addCircle(width / 2, height / 2, radius);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 2500);
  }, []);

  if (!mounted) {
    return null;
  } // Đợi trước khi render Skia

  return (
    <Canvas style={{ position: 'absolute', width, height }}>
      {/* Vẽ phần mask và cắt vòng tròn */}
      <Path path={path} color="white" clip={circlePath} invertClip />
    </Canvas>
  );
}
