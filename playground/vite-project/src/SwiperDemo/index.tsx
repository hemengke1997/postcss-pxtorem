import { Swiper } from 'react-vant'
import { items } from './items'
import './index.less'

const SwiperDemo = () => {
  return (
    <div className='demo-swiper'>
      <Swiper autoplay={5000}>{items}</Swiper>
    </div>
  )
}

export default SwiperDemo
