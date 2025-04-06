import { Container } from '@renderer/components/container'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@renderer/components/ui/form'
import { useEffect } from 'react'
import type { videoInfo } from '@distube/ytdl-core'
import {
  downloadProgressesAtom,
  isDownloadModalOpenAtom,
  qualityOptionsAtom,
  videoInfoAtom,
} from '@renderer/atoms/download'
import { useAtom, useSetAtom } from 'jotai'
import { DownloadModal } from '@renderer/components/download-modal'

const schema = z.object({
  url: z
    .string({
      required_error: 'URL é obrigatório',
    })
    .url({
      message:
        'A url informada não está de acordo com o padrão de url utilizado.',
    })
    .transform((url) => {
      return url.trim()
    })
    .refine(
      (url) => {
        return ['youtube.com', 'youtu.be'].some((domain) =>
          url.includes(domain),
        )
      },
      {
        message:
          'A url informada não está de acordo com o padrão de url utilizado. Exemplo de url válida: https://youtube.com/watch?v=dQw4w9WgXcQ',
      },
    ),
})

type Schema = z.infer<typeof schema>

export function Home() {
  const [, setIsDialogOpen] = useAtom(isDownloadModalOpenAtom)
  const [, setVideoInfo] = useAtom(videoInfoAtom)
  const [, setQualityOptions] = useAtom(qualityOptionsAtom)

  const setDownloadProgresses = useSetAtom(downloadProgressesAtom)

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
  })

  async function handleSubmitVideoUrl({ url }: Schema) {
    const isValidYoutubeUrl = await window.api.isValidYoutubeUrl(url)
    if (!isValidYoutubeUrl) {
      form.setError('url', {
        message:
          'A url informada não segue o padrão de url utilizado pelo youtube. Exemplo de url válida: https://youtube.com/watch?v=dQw4w9WgXcQ',
      })

      return
    }

    const { video, qualityOptions } = await window.api.getVideoInfo(url)
    setVideoInfo(video as unknown as videoInfo)
    setQualityOptions(qualityOptions)
    console.log(qualityOptions)

    setIsDialogOpen(true)

    form.reset({
      url: '',
    })
  }

  useEffect(() => {
    window.electron.ipcRenderer.on(
      'video:download-progress',
      (_, { progress, speed, downloadId, videoTitle, type, status }) => {
        setDownloadProgresses((prev) => ({
          ...prev,
          [downloadId]: {
            progress,
            speed,
            videoTitle,
            type,
            status,
          },
        }))
      },
    )

    window.electron.ipcRenderer.on(
      'video:download-finished',
      (_, { downloadId }) => {
        setDownloadProgresses((prev) => {
          const newProgresses = { ...prev }
          delete newProgresses[downloadId]

          // toast.success('Download concluído com sucesso!', {
          //   description: `O video "${videoTitle}" foi salvo na pasta downloads`,
          // })

          return newProgresses
        })
      },
    )

    window.electron.ipcRenderer.on(
      'video:download-started',
      (_, { downloadId, videoTitle, type, status }) => {
        setDownloadProgresses((prev) => ({
          ...prev,
          [downloadId]: { videoTitle, type, status, progress: 0, speed: 0 },
        }))
      },
    )

    return () => {
      window.electron.ipcRenderer.removeAllListeners('video:download-progress')
      window.electron.ipcRenderer.removeAllListeners('video:download-finished')
      window.electron.ipcRenderer.removeAllListeners('video:download-started')
    }
  }, [])

  return (
    <Container>
      <div className="w-full h-full flex flex-col gap-4 items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <p className="text-3xl font-bold">Taurius Youtube Video Downloader</p>
          <span className="text-sm text-zinc-500">
            Baixe videos do Youtube com facilidade
          </span>
        </div>

        <Form {...form}>
          <form
            className="flex items-start justify-center gap-2"
            onSubmit={form.handleSubmit(handleSubmitVideoUrl)}
          >
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Digite o link do video"
                        className="w-96"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage className="text-xs max-w-80" />
                  </FormItem>
                )
              }}
            />

            <Button
              isLoading={form.formState.isSubmitting}
              className="bg-primary text-primary-foreground"
            >
              {form.formState.isSubmitting ? 'Buscando' : 'Buscar'}
            </Button>
          </form>
        </Form>
      </div>

      <DownloadModal />
    </Container>
  )
}
