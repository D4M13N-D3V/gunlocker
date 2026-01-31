import { useState, useRef } from 'react'
import { getThumbUrl } from '../../lib/pocketbase'

export default function PhotoUpload({
  photos = [],
  existingPhotos = [],
  record = null,
  onChange,
  onRemoveExisting,
  maxFiles = 10,
}) {
  const [previews, setPreviews] = useState([])
  const inputRef = useRef(null)

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }))
    setPreviews([...previews, ...newPreviews])
    onChange([...photos, ...files])
  }

  const handleRemoveNew = (index) => {
    const newPreviews = [...previews]
    URL.revokeObjectURL(newPreviews[index].url)
    newPreviews.splice(index, 1)
    setPreviews(newPreviews)

    const newPhotos = [...photos]
    newPhotos.splice(index, 1)
    onChange(newPhotos)
  }

  const totalPhotos = existingPhotos.length + previews.length

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {/* Existing photos */}
        {existingPhotos.map((photo, index) => (
          <div key={`existing-${index}`} className="relative group aspect-square">
            <img
              src={getThumbUrl(record, photo, '150x150')}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
            {onRemoveExisting && (
              <button
                type="button"
                onClick={() => onRemoveExisting(photo)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}

        {/* New photo previews */}
        {previews.map((preview, index) => (
          <div key={`new-${index}`} className="relative group aspect-square">
            <img
              src={preview.url}
              alt={`New photo ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => handleRemoveNew(index)}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        {/* Upload button */}
        {totalPhotos < maxFiles && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-primary-500 hover:text-primary-500 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs mt-1">Add Photo</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="text-xs text-gray-500">
        {totalPhotos} / {maxFiles} photos
      </p>
    </div>
  )
}
