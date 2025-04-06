import { useEffect } from 'react'

import { toast, type ToastT } from 'sonner'

type NotificationArgs = ToastT

export function NotificationsListeners() {
  useEffect(() => {
    function handleNotification(
      _: Electron.IpcRendererEvent,
      args: NotificationArgs,
    ) {
      toast[args.type ?? 'normal'](args.title, {
        description: args.description,
      })
    }

    window.electron.ipcRenderer.on('notifications:tauri', handleNotification)

    return () => {
      window.electron.ipcRenderer.removeAllListeners('notifications:tauri')
    }
  }, [])

  return null
}
