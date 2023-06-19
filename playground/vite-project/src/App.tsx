import { Header } from './components/Header'
import styles from './index.module.css'
import SwiperDemo from './SwiperDemo'
import CalendarDemo from './CalendarDemo'

function App() {
  return (
    <div>
      <Header />
      <div className={styles.font}>rem-font</div>
      <div className='other'>px-other</div>

      <SwiperDemo />
      <CalendarDemo />
    </div>
  )
}

// eslint-disable-next-line no-restricted-syntax
export default App
