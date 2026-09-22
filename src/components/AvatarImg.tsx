import { getAvatarInfo } from '../avatars'

interface AvatarImgProps {
  avatarId?: string
  className?: string
  alt?: string
}

export function AvatarImg({ avatarId, className, alt }: AvatarImgProps) {
  const info = getAvatarInfo(avatarId)
  return (
    <img
      src={info.src}
      alt={alt || info.name}
      className={className}
      loading="lazy"
      draggable={false}
    />
  )
}
