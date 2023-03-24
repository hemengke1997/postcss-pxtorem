import { Toast } from 'react-vant'
import { useEffect } from 'react'
import { Header } from './components/Header'
import styles from './index.module.css'

function App() {
  useEffect(() => {
    Toast.info({
      message: 'haha',
      duration: 0,
    })
  }, [])

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
