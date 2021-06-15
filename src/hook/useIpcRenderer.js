import { useEffect } from 'react'
const { ipcRenderer } = require('electron')


const useIpcRenderer = (keyCallback) => {
  useEffect(() => {
    Object.keys(keyCallback).forEach(key => {
      ipcRenderer.on(key, keyCallback[key])
    })
    return () => {
      Object.keys(keyCallback).forEach(key => {
        ipcRenderer.removeListener(key, keyCallback[key])
      })
    }
  })
}

export default useIpcRenderer