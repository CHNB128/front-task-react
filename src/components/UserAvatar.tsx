interface UserAvatarProps {
  name: string
  src?: string
  size?: 'sm' | 'md'
  isActive?: boolean
  activeBorderClassName?: string
  inactiveBorderClassName?: string
  className?: string
}

const SIZE_CLASSES = {
  sm: 'h-10 w-10',
  md: 'h-14 w-14',
} as const

export function UserAvatar({
  name,
  src = '/img.png',
  size = 'md',
  isActive = true,
  activeBorderClassName = 'border-primary',
  inactiveBorderClassName = 'border-white',
  className,
}: UserAvatarProps) {
  return (
    <div
      className={[
        'rounded-full border-[1.5px] bg-white p-1 transition-colors duration-200',
        isActive ? activeBorderClassName : inactiveBorderClassName,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <img src={src} alt={name} className={[SIZE_CLASSES[size], 'rounded-full object-cover'].join(' ')} />
    </div>
  )
}
