import { FileAudio, FileVideo2 } from 'lucide-react'
import { VideoOff } from 'lucide-react'
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

import { Dialog } from './ui/dialog'
import { SelectContent, SelectItem } from './ui/select'
import { SelectTrigger, SelectValue } from './ui/select'
import { Select } from './ui/select'
import { Button } from './ui/button'
import {
  videoInfoAtom,
  isDownloadModalOpenAtom,
  addDownloadToQueueAtom,
  qualityOptionsAtom,
} from '../atoms/download'
import { useAtom, useSetAtom } from 'jotai'
import { useState } from 'react'
import { toast } from 'sonner'
import { Label } from './ui/label'

export function DownloadModal() {
  const [videoInfo] = useAtom(videoInfoAtom)
  const [isDialogOpen, setIsDialogOpen] = useAtom(isDownloadModalOpenAtom)
  const [qualityOptions] = useAtom(qualityOptionsAtom)

  const [selectedQuality, setSelectedQuality] = useState<string | null>(null)
  const [videoQuality, setVideoQuality] = useState<string | null>(null)
  const [audioQuality, setAudioQuality] = useState<string | null>(null)

  const addDownloadToQueue = useSetAtom(addDownloadToQueueAtom)

  async function handleDownloadVideo() {
    if (!videoInfo?.videoDetails.video_url || !selectedQuality) {
      toast.error('Selecione uma qualidade para baixar o video')
      return
    }

    const downloadId = `video_${crypto.randomUUID()}`

    addDownloadToQueue(
      {
        videoTitle: videoInfo?.videoDetails.title,
        type: 'video',
        status: 'pending',
        progress: 0,
        speed: 0,
      },
      downloadId,
    )

    await window.api.downloadVideo({
      videoUrl: videoInfo?.videoDetails.video_url,
      downloadId,
      quality: selectedQuality,
    })

    setIsDialogOpen(false)
    setSelectedQuality(null)
  }

  async function handleDownloadMP3() {
    if (!videoInfo?.videoDetails.video_url) {
      return
    }

    const downloadId = `audio_${crypto.randomUUID()}`

    addDownloadToQueue(
      {
        videoTitle: videoInfo?.videoDetails.title,
        type: 'audio',
        status: 'pending',
        progress: 0,
        speed: 0,
      },
      downloadId,
    )

    await window.api.downloadMP3({
      videoUrl: videoInfo?.videoDetails.video_url,
      downloadId,
    })

    setIsDialogOpen(false)
    setSelectedQuality(null)

    // setIsDownloading(false)
    // if (isDownloaded) {
    //   setIsDialogOpen(false)
    // }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="bg-zinc-900 border-zinc-800 w-10/12">
        <DialogHeader>
          <DialogTitle>Download do video</DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            Nesta seção você pode escolher o formato e a qualidade do video que
            deseja baixar. Também é possível escolher a pasta onde o video será
            salvo.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-zinc-300">Título do video: </span>
              <p className="text-xs font-medium">
                {videoInfo?.videoDetails.title}
              </p>
            </div>
            <div></div>
            <iframe
              width="100%"
              height="800"
              src={`https://www.youtube.com/embed/${videoInfo?.videoDetails.videoId}`}
              title={videoInfo?.videoDetails.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-96 rounded-md"
            ></iframe>
            <div className="w-full h-full space-y-2">
              <div>
                <Label className="text-sm text-zinc-300">
                  Qualidade audio e video!!
                </Label>
                <Select
                  value={selectedQuality || undefined}
                  onValueChange={(value) => {
                    if (value === 'custom') {
                      setVideoQuality(null)
                      setAudioQuality(null)
                    }

                    setSelectedQuality(value)
                  }}
                >
                  <SelectTrigger className="w-full border-zinc-800 bg-zinc-950 data-[placeholder]:text-zinc-400">
                    <SelectValue
                      className=""
                      placeholder="Selecione a qualidade do video: Ex. 1080p60"
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 text-zinc-50 border-zinc-800">
                    {qualityOptions?.map((format) => {
                      return (
                        <SelectItem
                          key={format.quality}
                          className="data-[highlighted]:bg-zinc-800 data-[highlighted]:text-zinc-50"
                          value={format.quality}
                        >
                          {format.qualityLabel}
                          {format.fps}
                        </SelectItem>
                      )
                    })}

                    <SelectItem
                      value="lowest"
                      className="data-[highlighted]:bg-zinc-800 data-[highlighted]:text-zinc-50"
                    >
                      Baixa
                    </SelectItem>
                    <SelectItem
                      value="high"
                      className="data-[highlighted]:bg-zinc-800 data-[highlighted]:text-zinc-50"
                    >
                      Alta
                    </SelectItem>
                    <SelectItem
                      value="hightest"
                      className="data-[highlighted]:bg-zinc-800 data-[highlighted]:text-zinc-50"
                    >
                      Excelente
                    </SelectItem>
                    <SelectItem
                      value="custom"
                      className="data-[highlighted]:bg-zinc-800 data-[highlighted]:text-zinc-50"
                    >
                      Customizado
                    </SelectItem>

                    {qualityOptions?.length === 0 && (
                      <div className="w-full h-32 flex flex-col gap-4 justify-center items-center">
                        <VideoOff className="size-6 text-zinc-400" />
                        <span className="text-sm text-zinc-400">
                          Nenhum formato de video foi encontrado
                        </span>
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedQuality === 'custom' && (
                <div className="grid grid-cols-1 space-y-2">
                  <div>
                    <Label className="text-sm text-zinc-300">
                      Qualidade de video
                    </Label>
                    <Select
                      value={videoQuality || undefined}
                      onValueChange={setVideoQuality}
                    >
                      <SelectTrigger className="w-full border-zinc-800 bg-zinc-950 data-[placeholder]:text-zinc-400">
                        <SelectValue placeholder="Selecione o tipo de qualidade de video" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 text-zinc-50 border-zinc-800">
                        <SelectItem
                          value="hightest"
                          className="data-[highlighted]:bg-zinc-800 data-[highlighted]:text-zinc-50"
                        >
                          Qualidade excelente
                        </SelectItem>
                        <SelectItem
                          value="hightestvideo"
                          className="data-[highlighted]:bg-zinc-800 data-[highlighted]:text-zinc-50"
                        >
                          Qualidade alta de video
                        </SelectItem>
                        <SelectItem
                          value="lowest"
                          className="data-[highlighted]:bg-zinc-800 data-[highlighted]:text-zinc-50"
                        >
                          Qualidade baixa
                        </SelectItem>
                        <SelectItem
                          value="lowestvideo"
                          className="data-[highlighted]:bg-zinc-800 data-[highlighted]:text-zinc-50"
                        >
                          Qualidade baixa de video
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm text-zinc-300">
                      Qualidade de audio
                    </Label>
                    <Select
                      value={audioQuality || undefined}
                      onValueChange={setAudioQuality}
                    >
                      <SelectTrigger className="w-full border-zinc-800 bg-zinc-950 data-[placeholder]:text-zinc-400">
                        <SelectValue placeholder="Selecione o tipo de qualidade de audio" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 text-zinc-50 border-zinc-800">
                        <SelectItem
                          value="hightest"
                          className="data-[highlighted]:bg-zinc-800 data-[highlighted]:text-zinc-50"
                        >
                          Qualidade excelente
                        </SelectItem>
                        <SelectItem
                          value="hightestaudio"
                          className="data-[highlighted]:bg-zinc-800 data-[highlighted]:text-zinc-50"
                        >
                          Qualidade excelente de audio
                        </SelectItem>

                        <SelectItem
                          value="lowest"
                          className="data-[highlighted]:bg-zinc-800 data-[highlighted]:text-zinc-50"
                        >
                          Qualidade baixa
                        </SelectItem>
                        <SelectItem
                          value="lowestaudio"
                          className="data-[highlighted]:bg-zinc-800 data-[highlighted]:text-zinc-50"
                        >
                          Qualidade baixa de audio
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                <Button className="w-full" onClick={handleDownloadVideo}>
                  <FileVideo2 className="size-4" />
                  Baixar video
                </Button>
                <Button className="w-full" onClick={handleDownloadMP3}>
                  <FileAudio className="size-4" />
                  Baixar em MP3
                </Button>

                {/* {Object.entries(downloadProgresses).map(([key, value]) => {
              return (
                <div key={key} className="flex flex-col gap-2 mt-2">
                  <span className="text-xs text-zinc-200">
                    {value.videoTitle}
                  </span>
                  <span className="text-xs text-zinc-300">
                    Progresso: {value.progress}% | Velocidade:{' '}
                    {value.speed} MB/s
                  </span>
                  <Progress value={value.progress} />
                </div>
              )
            })} */}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
