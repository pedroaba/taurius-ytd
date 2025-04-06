import { updateTaskbarBadgeAtom } from '@renderer/atoms/download'
import { useAtom } from 'jotai'
import { useEffect } from 'react'

export function BadgeDispatcher() {
  const [downloadingCount] = useAtom(updateTaskbarBadgeAtom)

  useEffect(() => {
    window.api.updateTaskbarBadge(downloadingCount)
  }, [downloadingCount])

  return null
}
