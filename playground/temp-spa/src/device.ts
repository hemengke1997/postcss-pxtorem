export const DEVICE = [
  { isDevice: (clientWidth: number) => clientWidth < 750, UIWidth: 375, deviceWidthRange: [300, 375], type: '手机' }, // 手机
  {
    isDevice: (clientWidth: number) => clientWidth >= 750 && clientWidth < 1280,
    UIWidth: 1280,
    deviceWidthRange: [960, 1280],
    type: '平板',
  }, // 平板
  {
    isDevice: (clientWidth: number) => clientWidth >= 1280,
    UIWidth: 1920,
    deviceWidthRange: [1280, 1920],
    type: '电脑',
  }, // 电脑
]
