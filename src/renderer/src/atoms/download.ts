import { atom } from 'jotai'
import { atomWithObservable } from 'jotai/utils'
import { Observable } from 'rxjs'
import { videoInfo, videoFormat } from '@distube/ytdl-core'

type DownloadProgress = {
  progress: number
  speed: number
  videoTitle: string
  type: 'video' | 'audio'
  status: 'downloading' | 'finished' | 'error' | 'pending'
}

type DownloadProgresses = {
  [key: string]: DownloadProgress
}

export const isDownloadModalOpenAtom = atom(false)
export const videoInfoAtom = atom<videoInfo | null>(null)
export const qualityOptionsAtom = atom<videoFormat[]>([])

export const downloadProgressesAtom = atom<DownloadProgresses>({})

export const addDownloadToQueueAtom = atom(
  null,
  (_get, set, downloadProgress: DownloadProgress, downloadId: string) => {
    set(downloadProgressesAtom, (prev) => ({
      ...prev,
      [downloadId]: downloadProgress,
    }))
  },
)

export const updateTaskbarBadgeAtom = atomWithObservable<number>(
  (get) =>
    new Observable<number>((subscriber) => {
      const emitValue = () => {
        const value = Object.values(get(downloadProgressesAtom)).filter(
          (progress) => progress.status === 'downloading',
        ).length
        subscriber.next(value)
      }

      emitValue()

      const intervalId = setInterval(emitValue, 500)
      return () => clearInterval(intervalId)
    }),
  {
    initialValue: 0,
  },
)
