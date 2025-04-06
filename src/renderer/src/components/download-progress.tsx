import { Download, HardDriveDownload } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'
import { useAtomValue } from 'jotai'
import { downloadProgressesAtom } from '@renderer/atoms/download'
import { Progress } from './ui/progress'
import { cn } from '@renderer/utils/shadcn'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { useMemo } from 'react'

export function DownloadProgress() {
  const downloadProgresses = useAtomValue(downloadProgressesAtom)
  const hasDownloads = useMemo(
    () => Object.keys(downloadProgresses).length > 0,
    [downloadProgresses],
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          className={cn(
            'rounded-full absolute bottom-4 right-4',
            hasDownloads && 'animate-pulse',
          )}
        >
          <Download className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={16} className="bg-zinc-900">
        <p className="text-sm text-zinc-50 mb-4">Download Progress</p>
        <div className="flex flex-col gap-3">
          {Object.entries(downloadProgresses).map(([downloadId, download]) => (
            <div key={downloadId} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full bg-zinc-500 animate-pulse',
                      download.status === 'pending' && 'bg-yellow-500',
                      download.status === 'downloading' && 'bg-blue-500',
                      download.status === 'finished' && 'bg-green-500',
                      download.status === 'error' && 'bg-red-500',
                    )}
                  />
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-zinc-50 font-bold">
                      {download.type === 'video' ? 'Video' : 'Audio'}:
                    </p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-xs text-zinc-200 max-w-[100px] truncate">
                          {download.videoTitle}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{download.videoTitle}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <span className="text-xs text-zinc-200">
                  {download.progress}% | {download.speed} MB/s
                </span>
              </div>
              <Progress value={download.progress} />
            </div>
          ))}
          {!hasDownloads && (
            <p className="text-sm text-zinc-500 text-center max-w-[200px] mx-auto py-6 flex flex-col items-center gap-2">
              <HardDriveDownload className="size-10" />
              Nenhum download no sistema atualmente.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
