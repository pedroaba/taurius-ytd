import ytdl from '@distube/ytdl-core'
import { app } from 'electron'
import { createWriteStream, type WriteStream } from 'fs'
import path from 'path'
import type Stream from 'stream'

type StandardDownloadParams = {
  videoUrl: string
  quality: string
  onlyAudio?: boolean
  onProgress?: (_: {
    progress: string
    speed: string
    videoInfo: ytdl.videoInfo
    videoFormat: ytdl.videoFormat | null
  }) => void
  onFinish?: (_: {
    videoInfo: ytdl.videoInfo
    videoFormat: ytdl.videoFormat | null
  }) => void
  onDownloadStart?: (_: { videoInfo: ytdl.videoInfo }) => void
  onError?: (error: Error) => void
}

export class VideoDownloader {
  constructor() {}

  public async download({
    videoUrl,
    quality,
    onlyAudio = false,
    onProgress,
    onFinish,
    onError,
    onDownloadStart,
  }: StandardDownloadParams) {
    const videoInfo = await ytdl.getInfo(videoUrl)
    let videoStream: Stream.Readable | null = null
    let writeStream: WriteStream | null = null
    let selectedFormat: ytdl.videoFormat | null = null

    if (onlyAudio) {
      videoStream = await ytdl.downloadFromInfo(videoInfo, {
        format: ytdl.filterFormats(videoInfo.formats, 'audioonly')[0],
      })

      writeStream = createWriteStream(
        path.join(
          app.getPath('downloads'),
          `${videoInfo.videoDetails.title}.mp3`,
        ),
      )
    } else {
      const qualityOptions = ytdl.filterFormats(
        videoInfo.formats,
        onlyAudio ? 'audioonly' : 'videoandaudio',
      )

      const selectedFormat = qualityOptions.find(
        (format) => format.quality === quality,
      )

      if (!selectedFormat) {
        throw new Error('Formato de qualidade não encontrado')
      }
      videoStream = await ytdl.downloadFromInfo(videoInfo, {
        format: selectedFormat,
      })

      writeStream = createWriteStream(
        path.join(
          app.getPath('downloads'),
          `${videoInfo.videoDetails.title}.${selectedFormat.container}`,
        ),
      )
    }

    onDownloadStart?.({ videoInfo })
    videoStream.pipe(writeStream)

    if (onProgress) {
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
        onProgress({ progress, speed, videoInfo, videoFormat: selectedFormat })
      })
    }

    return new Promise((resolve, reject) => {
      writeStream.on('finish', () => {
        onFinish?.({ videoInfo, videoFormat: selectedFormat })
        resolve(true)
      })

      writeStream.on('error', (error) => {
        onError?.(error)
        reject(error)
      })
    })
  }
}
