import { Copyright } from './components/copyright'
import { Header } from './components/header'
import { Home } from './pages/home'
import { Toaster } from './components/ui/sonner'
import { DownloadProgress } from './components/download-progress'
import { TooltipProvider } from './components/ui/tooltip'
import { NotificationsListeners } from './components/notifications-listeners'
import { BadgeDispatcher } from './components/badge-dispatcher'

export function App() {
  return (
    <div className="h-screen w-screen flex flex-col">
      <TooltipProvider skipDelayDuration={0} delayDuration={0}>
        <Header />
        <Home />
        <Copyright />
        <Toaster />
        <DownloadProgress />
        <NotificationsListeners />
        <BadgeDispatcher />
      </TooltipProvider>
    </div>
  )
}
