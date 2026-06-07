interface ElectronAPI {
    resizeWindow: (width: number, height: number) => void
    closeWindow: () => void
}

interface Window {
    electronAPI: ElectronAPI
}
