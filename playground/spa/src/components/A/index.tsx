import classNames from 'classnames'
import { type FC } from 'react'
import styles from './index.module.css'

const A: FC = () => {
  return (
    <div className={classNames('box')}>
      <span id='a_1' className={classNames(styles.noFixed)}>
        这是 16px 转成了 1rem
      </span>
      <span id='a_2' className={styles.fixed}>
        这是固定的16px（使用了/* pxtorem-disable-next-line */）
      </span>
    </div>
  )
}

export default A
