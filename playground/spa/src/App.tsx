import { useLayoutEffect, useState } from 'react'
import { useWindowSize } from 'react-use'
import { Button } from 'react-vant'
import A from './components/A'
import B from './components/B'
import C from './components/C'
import D from './components/D'
import E from './components/E'
import { DEVICE } from './device'
import './App.css'

function App() {
  const [fontSize, setFontSize] = useState('')

  const [device, setDevice] = useState('')

  const size = useWindowSize()

  useLayoutEffect(() => {
    const t = setTimeout(() => {
      setFontSize(document.documentElement.style.fontSize)
    }, 100)

    DEVICE.find((d) => {
      if (d.isDevice(size.width)) {
        setDevice(d.type)
        return true
      }
      return false
    })
    return () => {
      clearTimeout(t)
    }
  }, [size])

  return (
    <div className='App flex flex-col gap-y-[12px]'>
      <div className={'flex box'}>
        <div className={'text-[24px] font-bold'}>预定义机型：</div>
        <div className={'flex divide-x'}>
          {DEVICE.map((d) => (
            <div key={d.type} className={'px-[8px]'}>
              【{d.type}】字体变化的窗口范围：{d.deviceWidthRange[0]}px~{d.deviceWidthRange[1]}px
            </div>
          ))}
        </div>
      </div>
      <div className={'text-xl'}>当前机型：{device}</div>
      <div className={'text-xl'}>当前html根font-size: {fontSize}</div>

      <div className={'text-2xl font-bold text-orange-400 mt-[32px]'}>请缩放浏览器窗口大小，感受字体大小变化</div>

      <A />
      <B />
      <C />
      <D />
      <E />

      <div className={'box'}>
        <div>Vant</div>
        <Button type='primary'>按钮很大</Button>
      </div>
    </div>
  )
}

export default App
