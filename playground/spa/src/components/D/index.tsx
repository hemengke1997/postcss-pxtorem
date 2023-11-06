import styles from './index.module.css'

const D = () => {
  return (
    <div className={'box'}>
      <div id='d_1' className={styles.d1}>
        这是在css文件中不修改rootValue的16px
      </div>
      <div id='d_2' className={styles.d2}>
        这是在css文件中动态修改rootValue为32px后的16px（缩小一倍）
      </div>
      <div id='d_3' className={styles.d3}>
        这是在css文件中动态修改rootValue为8px后的16px（放大一倍）
      </div>
      <div id='d_4' className={styles.d4}>
        放大一倍
      </div>
    </div>
  )
}

export default D
