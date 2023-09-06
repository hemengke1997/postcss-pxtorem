;(function () {
  if (typeof window === 'undefined') return

  const maxWidth = 1024
  const uiWidth = 375

  function resize() {
    let width = window.innerWidth

    if (width > window.screen.width) {
    } else {
      if (width >= maxWidth) {
        width = maxWidth
      }
      document.documentElement.style.fontSize = `${(width * 16) / uiWidth}px`
    }
  }

  resize()

  let timer: NodeJS.Timer
  const interval = 500

  window.addEventListener('resize', () => {
    clearTimeout(timer)
    timer = setTimeout(resize, interval)
  })
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      clearTimeout(timer)
      timer = setTimeout(resize, interval)
      resize()
    }
  })
})()
