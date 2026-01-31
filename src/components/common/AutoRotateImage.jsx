import { useState, useRef, useEffect } from 'react'

export default function AutoRotateImage({ src, alt, className = '', containerClassName = '' }) {
  const [shouldRotate, setShouldRotate] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef(null)

  useEffect(() => {
    // Reset state when src changes
    setShouldRotate(false)
    setLoaded(false)
  }, [src])

  const handleLoad = () => {
    if (imgRef.current) {
      const { naturalWidth, naturalHeight } = imgRef.current
      // Rotate if image is taller than it is wide (portrait orientation)
      setShouldRotate(naturalHeight > naturalWidth)
      setLoaded(true)
    }
  }

  if (!src) return null

  return (
    <div className={`overflow-hidden ${containerClassName}`}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={handleLoad}
        className={`
          ${className}
          ${!loaded ? 'opacity-0' : 'opacity-100'}
          ${shouldRotate ? 'rotate-90 scale-[1.4]' : ''}
          transition-opacity duration-200
        `}
        style={shouldRotate ? { transformOrigin: 'center center' } : undefined}
      />
    </div>
  )
}
