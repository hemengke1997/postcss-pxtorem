import type { FC } from 'react'
import styles from './index.module.css'

const Header: FC = () => {
  return (
    <div className={styles.header}>
      <span>px-header</span>

      <span className={styles.headerContent}>px-headerContent</span>
    </div>
  )
}
export { Header }
