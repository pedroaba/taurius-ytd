import { cn } from '@renderer/utils/shadcn'
import type { ComponentProps } from 'react'

type ContainerProps = ComponentProps<'div'>

export function Container({ className, ...props }: ContainerProps) {
  return (
    <div
      className={cn('w-screen max-w-[1200px] mx-auto p-4 pt-0 grow', className)}
      {...props}
    />
  )
}
