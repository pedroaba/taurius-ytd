import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

import { ElectronAPI } from '@electron-toolkit/preload'
import { videoInfo, type videoFormat } from '@distube/ytdl-core'
export interface API {
  getVideoInfo: (url: string) => Promise<{
    video: videoInfo
    qualityOptions: videoFormat[]
  }>
  isValidYoutubeUrl: (url: string) => Promise<boolean>
  downloadMP3: (videoInfo: {
    videoUrl: string
    downloadId: string
  }) => Promise<void>
  downloadVideo: (videoInfo: {
    videoUrl: string
    downloadId: string
    quality: string
  }) => Promise<void>
  updateTaskbarBadge: (count: number) => Promise<void>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}

const api = {
  getVideoInfo: async (url: string) => {
    const response = await ipcRenderer.invoke('video:get-info', url)

    return response
  },
  isValidYoutubeUrl: async (url: string) => {
    const response = await ipcRenderer.invoke('video:is-valid-url', url)

    return response
  },
  downloadMP3: async ({
    videoUrl,
    downloadId,
  }: {
    videoUrl: string
    downloadId: string
  }) => {
    await ipcRenderer.send('video:download', {
      videoUrl,
      downloadId,
      type: 'audio',
    })
  },
  updateTaskbarBadge: async (count: number) => {
    await ipcRenderer.sendSync('downloadCount', count)
    await ipcRenderer.send('video:download-count', count)
  },
  downloadVideo: async ({
    videoUrl,
    downloadId,
    quality,
  }: {
    videoUrl: string
    downloadId: string
    quality: string
  }) => {
    await ipcRenderer.send('video:download', {
      videoUrl,
      downloadId,
      quality,
      type: 'video',
    })
  },
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
