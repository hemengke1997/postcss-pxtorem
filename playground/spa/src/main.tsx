import React from 'react'
import ReactDOM from 'react-dom/client'
import { flexible } from 'modern-flexible'
import App from './App'
import './index.css'

flexible({
  distinctDevice: [
    { isDevice: (w: number) => w < 750, UIWidth: 375, deviceWidthRange: [300, 375] },
    { isDevice: (w: number) => w >= 750, UIWidth: 1920, deviceWidthRange: [1080, 1920] },
  ],
})

ReactDOM.createRoot(document.querySelector('#root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
