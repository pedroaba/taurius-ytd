import { BrowserWindow, Notification } from 'electron'
import icon from '../../../resources/icon.png?asset'

type DispatchNotificationArgs = {
  window: any
  title: string
  message: string
  type:
    | 'normal'
    | 'action'
    | 'success'
    | 'info'
    | 'warning'
    | 'error'
    | 'loading'
    | 'default'
}

export function dispatchNotification({
  window,
  title,
  message,
  type,
}: DispatchNotificationArgs) {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title,
      body: message,
      icon,
    })

    notification.show()
  }

  const mainWindow = BrowserWindow.fromWebContents(window)
  if (!mainWindow) {
    return
  }

  mainWindow.webContents.send('notifications:tauri', {
    title,
    description: message,
    type,
  })
}
