import { app, ipcMain, BrowserWindow, Notification, shell } from 'electron'
import path from 'path'
import ytdl from '@distube/ytdl-core'
import icon from '../../../resources/icon.png?asset'
import { dispatchNotification } from '../utils/dispatch-notification'
import { platform } from '@electron-toolkit/utils'
import { VideoDownloader } from '../process/downloader'

export function setVideoListeners() {
  ipcMain.handle('video:get-info', async (_, url: string) => {
    const videoInfo = await ytdl.getInfo(url)

    const qualityOptions = ytdl.filterFormats(
      videoInfo.formats,
      'videoandaudio',
    )

    return {
      video: videoInfo,
      qualityOptions,
    }
  })

  ipcMain.handle('video:is-valid-url', async (_, url: string) => {
    try {
      return ytdl.validateURL(url)
    } catch (error) {
      return false
    }
  })

  ipcMain.on('video:download-count', (_, count: number) => {
    if (!platform.isWindows) {
      app.setBadgeCount(count)
    }
  })

  ipcMain.on(
    'video:download',
    async (event, { videoUrl, downloadId, quality, type }) => {
      try {
        const mainWindow = BrowserWindow.fromWebContents(event.sender)
        if (!mainWindow) {
          return
        }

        const videoDownloader = new VideoDownloader()
        await videoDownloader.download({
          videoUrl,
          quality,
          onlyAudio: type === 'audio',
          onDownloadStart: ({ videoInfo }) => {
            dispatchNotification({
              window: event.sender,
              title: 'Taurius-YT',
              message: `O ${type} "${videoInfo.videoDetails.title}" foi adicionado à fila de downloads`,
              type: 'info',
            })
          },
          onProgress: ({ progress, speed, videoInfo }) => {
            mainWindow.webContents.send('video:download-progress', {
              videoTitle: videoInfo.videoDetails.title,
              type,
              downloadId,
              progress,
              speed,
              status: 'downloading',
            })
          },
          onError: () => {
            dispatchNotification({
              window: event.sender,
              title: 'Taurius-YT',
              message:
                'Não foi possível realizar o download, por favor, tente novamente.',
              type: 'error',
            })
          },
          onFinish: ({ videoInfo, videoFormat }) => {
            mainWindow.webContents.send('video:download-finished', {
              downloadId,
              videoTitle: videoInfo.videoDetails.title,
              type,
              status: 'finished',
            })

            if (Notification.isSupported()) {
              const notification = new Notification({
                title: 'Download concluído',
                body: `O ${type} "${videoInfo.videoDetails.title}" foi salvo na pasta downloads`,
                icon,
                closeButtonText: 'Fechar',
              })

              notification.on('click', (_) => {
                shell.openPath(
                  path.join(
                    app.getPath('downloads'),
                    `${videoInfo.videoDetails.title}.${videoFormat?.container || 'mp4'}`,
                  ),
                )
              })

              notification.show()
            }
          },
        })
      } catch (error) {
        dispatchNotification({
          window: event.sender,
          title: 'Taurius-YT',
          message:
            'Não foi possível realizar o download, por favor, tente novamente.',
          type: 'error',
        })
      }
    },
  )
}
