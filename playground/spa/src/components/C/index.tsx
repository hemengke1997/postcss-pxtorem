import styles from './index.module.css'

const C = () => {
  return (
    <div className={'box'}>
      <div id='c_1' className={styles.c}>
        这是在css文件中动态修改rootValue为32px后的16px（缩小一倍）
      </div>
    </div>
  )
}

export default C
