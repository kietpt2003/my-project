export default {
  camera: 'TAB.Camera',
};

export type Routes = {
  PermissionsPage: undefined;
  CameraPage: undefined;
  CodeScannerPage: undefined;
  MediaPage: {
    path: string;
    type: 'video' | 'photo';
  };
  Devices: undefined;
  SuccessPage: undefined;
};
