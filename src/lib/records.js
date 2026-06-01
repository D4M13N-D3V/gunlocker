// Builders for PocketBase create/update request bodies.
//
// These encapsulate three PocketBase quirks that the resource hooks all share:
//
//  1. Sending '' to a date or number column fails on older PocketBase (0.23.x,
//     which the Docker image runs). Sending `null` clears any column type. So
//     on UPDATE we map ''→null to let users actually clear a field, and on
//     CREATE we simply omit empty values.
//  2. New files are uploaded via multipart and APPEND to a file field; existing
//     files are deleted by sending `${field}-` with the filenames to remove.
//  3. A multipart body can't represent `null`, so when a request must be
//     multipart (new files and/or removals) we omit empty values rather than
//     risk the date/number error — clearing a field works through the
//     no-file JSON path.

const collectFiles = (data, fileFields) => {
  const out = []
  for (const field of fileFields) {
    const value = data[field]
    if (value && value.length > 0) {
      out.push([field, Array.from(value)])
    }
  }
  return out
}

// Build a create body. Empty values are omitted (nothing to clear on create).
export function buildCreateBody(data, { fileFields = [], extra = {} } = {}) {
  const files = collectFiles(data, fileFields)
  const scalars = { ...data, ...extra }

  if (files.length > 0) {
    const formData = new FormData()
    for (const [key, value] of Object.entries(scalars)) {
      if (fileFields.includes(key)) continue
      if (value === undefined || value === null || value === '') continue
      formData.append(key, value)
    }
    files.forEach(([field, list]) => list.forEach((file) => formData.append(field, file)))
    return formData
  }

  const json = {}
  for (const [key, value] of Object.entries(scalars)) {
    if (fileFields.includes(key)) continue
    if (value === undefined || value === null || value === '') continue
    json[key] = value
  }
  return json
}

// Build an update body. `removed` maps a file field to the filenames to delete,
// e.g. { photos: ['a.png'], documents: [] }. Blanked scalar fields are cleared
// (sent as null) when the request can be JSON.
export function buildUpdateBody(data, { fileFields = [], removed = {} } = {}) {
  const files = collectFiles(data, fileFields)
  const removals = Object.entries(removed).filter(([, names]) => names && names.length > 0)

  if (files.length > 0 || removals.length > 0) {
    const formData = new FormData()
    for (const [key, value] of Object.entries(data)) {
      if (fileFields.includes(key)) continue
      // Multipart can't carry null; omit empties (clearing uses the JSON path).
      if (value === undefined || value === null || value === '') continue
      formData.append(key, value)
    }
    files.forEach(([field, list]) => list.forEach((file) => formData.append(field, file)))
    removals.forEach(([field, names]) => names.forEach((name) => formData.append(`${field}-`, name)))
    return formData
  }

  const json = {}
  for (const [key, value] of Object.entries(data)) {
    if (fileFields.includes(key)) continue
    if (value === undefined) continue
    json[key] = value === '' ? null : value
  }
  return json
}
