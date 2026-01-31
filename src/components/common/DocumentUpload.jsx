import { useRef } from 'react'
import { getFileUrl } from '../../lib/pocketbase'

export default function DocumentUpload({
  documents = [],
  existingDocuments = [],
  record = null,
  onChange,
  onRemoveExisting,
  maxFiles = 10,
}) {
  const inputRef = useRef(null)

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    onChange([...documents, ...files])
  }

  const handleRemoveNew = (index) => {
    const newDocs = [...documents]
    newDocs.splice(index, 1)
    onChange(newDocs)
  }

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') {
      return (
        <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zm-2.5 9.5a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5zm0 2a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5z" />
        </svg>
      )
    }
    return (
      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  }

  const totalDocs = existingDocuments.length + documents.length

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {/* Existing documents */}
        {existingDocuments.map((doc, index) => (
          <div
            key={`existing-${index}`}
            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg group"
          >
            {getFileIcon(doc)}
            <a
              href={getFileUrl(record, doc)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-sm text-primary-600 hover:underline truncate"
            >
              {doc}
            </a>
            {onRemoveExisting && (
              <button
                type="button"
                onClick={() => onRemoveExisting(doc)}
                className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        ))}

        {/* New documents */}
        {documents.map((doc, index) => (
          <div
            key={`new-${index}`}
            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg group"
          >
            {getFileIcon(doc.name)}
            <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
              {doc.name}
            </span>
            <span className="text-xs text-gray-500">
              {(doc.size / 1024).toFixed(1)} KB
            </span>
            <button
              type="button"
              onClick={() => handleRemoveNew(index)}
              className="p-1 text-gray-400 hover:text-red-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {totalDocs < maxFiles && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:border-primary-500 hover:text-primary-500 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm">Add Document</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="text-xs text-gray-500">
        {totalDocs} / {maxFiles} documents (PDF, JPG, PNG)
      </p>
    </div>
  )
}
