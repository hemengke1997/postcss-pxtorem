import { Header } from './components/Header'
import styles from './index.module.css'

function App() {
  return (
    <div>
      <Header />
      <div className={styles.font}>rem-font</div>
      <div className='other text-[16px]'>px-other</div>
    </div>
  )
}

// eslint-disable-next-line no-restricted-syntax
export default App
