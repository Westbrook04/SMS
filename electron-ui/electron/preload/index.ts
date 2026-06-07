import { contextBridge,ipcRenderer } from 'electron'
contextBridge.exposeInMainWorld('electronAPI', {
    resizeWindow:(width:number, height:number)=>{
        ipcRenderer.send('resize-window',width,height)
    },
    closeWindow:()=>{
        ipcRenderer.send('close-window')
    }
})
