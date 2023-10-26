const B = () => {
  return (
    <div className={'box'}>
      <div id='b_1' className={'text-[16px]'}>
        这是tailwindcss的text-[16px]，转了rem
      </div>
      <div id='b_2' className={'text-[length:16PX]'}>
        这是tailwindcss的text-[length:16PX]，不转rem
      </div>
    </div>
  )
}

export default B
