import { Header } from './components/Header'
import styles from './index.module.css'
import SwiperDemo from './SwiperDemo'

function App() {
  return (
    <div>
      <Header />
      <div className={styles.font}>rem-font</div>
      <div className='other'>px-other</div>

      <SwiperDemo />
    </div>
  )
}

// eslint-disable-next-line no-restricted-syntax
export default App
