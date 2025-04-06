import { app, ipcMain, BrowserWindow, Notification, shell } from 'electron'
import { createWriteStream } from 'fs'
import path from 'path'
import ytdl from '@distube/ytdl-core'
import icon from '../../../resources/icon.png?asset'
import { dispatchNotification } from '../utils/dispatch-notification'
import { platform } from '@electron-toolkit/utils'

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
    'video:download-mp3',
    async (
      event,
      { videoUrl, downloadId }: { videoUrl: string; downloadId: string },
    ) => {
      try {
        const mainWindow = BrowserWindow.fromWebContents(event.sender)
        if (!mainWindow) {
          if (Notification.isSupported()) {
            const notification = new Notification({
              title: 'Taurius-YT',
              body: 'Não foi possível identificar a janela principal, por favor, tente novamente.',
              icon,
            })

            notification.show()
          }
          return
        }

        const videoInfo = await ytdl.getInfo(videoUrl)
        // const downloadId = `audio_${randomUUID()}:${videoInfo.videoDetails.title}`

        const mp3Stream = await ytdl.downloadFromInfo(videoInfo, {
          quality: 'highestaudio',
          filter: 'audioonly',
        })

        mainWindow.webContents.send('video:download-started', {
          downloadId,
          videoTitle: videoInfo.videoDetails.title,
          status: 'downloading',
          type: 'audio',
        })

        dispatchNotification({
          window: event.sender,
          title: 'Taurius-YT',
          message: `O video "${videoInfo.videoDetails.title}" foi adicionado à fila de downloads`,
          type: 'info',
        })

        const writeStream = createWriteStream(
          path.join(
            app.getPath('downloads'),
            `${videoInfo.videoDetails.title}.mp3`,
          ),
        )

        mp3Stream.pipe(writeStream)

        let downloadStats = {
          lastTime: 0,
          lastBytes: 0,
        }

        mp3Stream.on('progress', (_, downloaded, total) => {
          const progress = ((downloaded / total) * 100).toFixed(2)
          const currentTime = Date.now()

          if (!downloadStats) {
            downloadStats = {
              lastTime: currentTime,
              lastBytes: 0,
            }
          }

          const timeDiff = (currentTime - downloadStats.lastTime) / 1000
          const bytesDiff = downloaded - downloadStats.lastBytes

          if (timeDiff >= 1) {
            downloadStats.lastTime = currentTime
            downloadStats.lastBytes = downloaded
          }

          const speed =
            timeDiff > 0 ? (bytesDiff / timeDiff / 1024 / 1024).toFixed(2) : '-'

          // TODO: remove this
          // process.stdout.write(
          //   `\rProgresso do download: ${progress}% | ${speed} MB/s`,
          // )

          mainWindow.webContents.send('video:download-progress', {
            videoTitle: videoInfo.videoDetails.title,
            type: 'audio',
            downloadId,
            progress,
            speed,
            status: 'downloading',
          })
        })

        writeStream.on('finish', () => {
          mainWindow.webContents.send('video:download-finished', {
            downloadId,
            videoTitle: videoInfo.videoDetails.title,
            type: 'audio',
            status: 'finished',
          })

          if (Notification.isSupported()) {
            const notification = new Notification({
              title: 'Download concluído',
              body: `O mp3 "${videoInfo.videoDetails.title}" foi salvo na pasta downloads`,
              icon,
              closeButtonText: 'Fechar',
            })

            notification.on('click', (_) => {
              shell.openPath(
                path.join(
                  app.getPath('downloads'),
                  `${videoInfo.videoDetails.title}.mp3`,
                ),
              )
            })

            notification.show()
          }
        })

        writeStream.on('error', () => {
          dispatchNotification({
            window: event.sender,
            title: 'Taurius-YT',
            message:
              'Não foi possível baixar o video, por favor, tente novamente.',
            type: 'error',
          })
        })
      } catch (error) {
        dispatchNotification({
          window: event.sender,
          title: 'Taurius-YT',
          message:
            'Não foi possível baixar o video, por favor, tente novamente.',
          type: 'error',
        })
      }
    },
  )

  ipcMain.handle('video:get-quality-options', async (_, url: string) => {
    const videoInfo = await ytdl.getInfo(url)

    const qualityOptions = ytdl.filterFormats(
      videoInfo.formats,
      'videoandaudio',
    )

    return qualityOptions.map((format) => ({
      quality: format.quality,
      url: format.url,
      container: format.container,
    }))
  })

  ipcMain.on(
    'video:download-video',
    async (event, { videoUrl, downloadId, quality }) => {
      try {
        const mainWindow = BrowserWindow.fromWebContents(event.sender)
        if (!mainWindow) {
          return
        }

        const videoInfo = await ytdl.getInfo(videoUrl)
        const qualityOptions = ytdl.filterFormats(
          videoInfo.formats,
          'videoandaudio',
        )

        const selectedFormat = qualityOptions.find(
          (format) => format.quality === quality,
        )

        if (!selectedFormat) {
          throw new Error('Formato de qualidade não encontrado')
        }

        const videoStream = await ytdl.downloadFromInfo(videoInfo, {
          format: selectedFormat,
        })

        dispatchNotification({
          window: event.sender,
          title: 'Taurius-YT',
          message: `O video "${videoInfo.videoDetails.title}" foi adicionado à fila de downloads`,
          type: 'info',
        })

        const writeStream = createWriteStream(
          path.join(
            app.getPath('downloads'),
            `${videoInfo.videoDetails.title}.${selectedFormat.container}`,
          ),
        )

        videoStream.pipe(writeStream)

        let downloadStats = {
          lastTime: 0,
          lastBytes: 0,
        }

        videoStream.on('progress', (_, downloaded, total) => {
          const progress = ((downloaded / total) * 100).toFixed(2)
          const currentTime = Date.now()

          if (!downloadStats) {
            downloadStats = {
              lastTime: currentTime,
              lastBytes: 0,
            }
          }

          const timeDiff = (currentTime - downloadStats.lastTime) / 1000
          const bytesDiff = downloaded - downloadStats.lastBytes

          if (timeDiff >= 1) {
            downloadStats.lastTime = currentTime
            downloadStats.lastBytes = downloaded
          }

          const speed =
            timeDiff > 0 ? (bytesDiff / timeDiff / 1024 / 1024).toFixed(2) : '-'

          // TODO: remove this
          // process.stdout.write(
          //   `\rProgresso do download: ${progress}% | ${speed} MB/s`,
          // )

          mainWindow.webContents.send('video:download-progress', {
            videoTitle: videoInfo.videoDetails.title,
            type: 'video',
            downloadId,
            progress,
            speed,
            status: 'downloading',
          })
        })

        writeStream.on('finish', () => {
          mainWindow.webContents.send('video:download-finished', {
            downloadId,
            videoTitle: videoInfo.videoDetails.title,
            type: 'video',
            status: 'finished',
          })

          if (Notification.isSupported()) {
            const notification = new Notification({
              title: 'Download concluído',
              body: `O video "${videoInfo.videoDetails.title}" foi salvo na pasta downloads`,
              icon,
              closeButtonText: 'Fechar',
            })

            notification.on('click', (_) => {
              shell.openPath(
                path.join(
                  app.getPath('downloads'),
                  `${videoInfo.videoDetails.title}.${selectedFormat.container}`,
                ),
              )
            })

            notification.show()
          }
        })

        writeStream.on('error', () => {
          dispatchNotification({
            window: event.sender,
            title: 'Taurius-YT',
            message:
              'Não foi possível baixar o video, por favor, tente novamente.',
            type: 'error',
          })
        })
      } catch (error) {
        dispatchNotification({
          window: event.sender,
          title: 'Taurius-YT',
          message:
            'Não foi possível baixar o video, por favor, tente novamente.',
          type: 'error',
        })
      }
    },
  )
}
