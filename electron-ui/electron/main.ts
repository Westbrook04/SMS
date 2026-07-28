import { app, BrowserWindow, shell , ipcMain } from 'electron'
import { join } from 'path'

let mainWindow: BrowserWindow | null = null

function createWindow() {
    const iconPath = app.isPackaged
        ? join(process.resourcesPath, 'icon.ico')
        : join(app.getAppPath(), 'resources', 'icon.ico')

    mainWindow = new BrowserWindow({
        width: 900,
        height: 580,
        icon: iconPath,
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            contextIsolation: true,
            nodeIntegration: false
        },
        title: '威少学生管理系统',
        frame:false,
        resizable:false
    })

    // 如果是在开发模式下，使用 Vite 开发服务器地址加载
    if (process.env.ELECTRON_RENDERER_URL) {
        mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }

    // 外部链接使用系统默认浏览器打开
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url)
        return { action: 'deny' }
    })
}

/**
 * 监听渲染进程发来的”调整窗口大小”请求
 */
ipcMain.on('resize-window',(_event,width:number,height: number)=>{
    if(mainWindow){
        mainWindow.setResizable(true)
        mainWindow.setSize(width,height)
        mainWindow.center()
        mainWindow.setResizable(false)
    }
})

/**
 * 监听渲染进程发来的”关闭窗口”请求
 */
ipcMain.on('close-window',()=>{
    if(mainWindow){
        mainWindow.close()
    }
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
