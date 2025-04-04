/* eslint-disable prettier/prettier */
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'react-native-reanimated/plugin',
      {
        processNestedWorklets: true,
      },
    ],
    ['react-native-worklets-core/plugin'],
    [
      'module-resolver',
      {
        'root': ['./src'],
        'extensions': ['.js', '.ios.js', '.android.js'],
        'alias': {
          'constant': './src/constants',
          'layout': './src/views/Layout',
          'utils': './src/utils',
        },
      },
    ],
  ],
};
