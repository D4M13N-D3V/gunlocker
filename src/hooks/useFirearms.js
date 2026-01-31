import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import pb from '../lib/pocketbase'
import logger from '../lib/logger'
import toast from 'react-hot-toast'

const COLLECTION = 'firearms'

export function useFirearms(options = {}) {
  return useQuery({
    queryKey: [COLLECTION, options],
    queryFn: async () => {
      const { filter = '', sort = '-created', expand = '' } = options
      logger.query(COLLECTION, { filter, sort, expand })
      const result = await pb.collection(COLLECTION).getFullList({
        filter,
        sort,
        expand,
      })
      logger.debug('Firearms', `Fetched ${result.length} firearms`)
      return result
    },
  })
}

export function useFirearm(id) {
  return useQuery({
    queryKey: [COLLECTION, id],
    queryFn: async () => {
      if (!id) return null
      logger.query(COLLECTION, { id })
      return pb.collection(COLLECTION).getOne(id, {
        expand: 'user',
      })
    },
    enabled: !!id,
  })
}

export function useCreateFirearm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      logger.mutation(COLLECTION, 'create', { name: data.name, data })

      const userId = pb.authStore.model?.id
      logger.debug('Firearms', 'Creating with user ID', { userId, isAuthenticated: pb.authStore.isValid })

      if (!userId) {
        throw new Error('User not authenticated')
      }

      const hasFiles = (data.photos?.length > 0) || (data.documents?.length > 0)

      if (hasFiles) {
        // Use FormData for file uploads
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
          if (key === 'photos' || key === 'documents') {
            if (value && value.length > 0) {
              Array.from(value).forEach((file) => {
                formData.append(key, file)
              })
            }
          } else if (value !== undefined && value !== null && value !== '') {
            formData.append(key, value)
          }
        })
        formData.append('user', userId)
        return pb.collection(COLLECTION).create(formData)
      } else {
        // Use JSON for non-file requests
        const jsonData = { user: userId }
        Object.entries(data).forEach(([key, value]) => {
          if (key !== 'photos' && key !== 'documents' && value !== undefined && value !== null && value !== '') {
            jsonData[key] = value
          }
        })
        logger.debug('Firearms', 'JSON being sent', jsonData)
        return pb.collection(COLLECTION).create(jsonData)
      }
    },
    onSuccess: (result) => {
      logger.info('Firearms', 'Created firearm', { id: result.id, name: result.name })
      queryClient.invalidateQueries({ queryKey: [COLLECTION] })
      toast.success('Firearm added successfully')
    },
    onError: (error) => {
      // Log full error details from PocketBase
      logger.error('Firearms', 'Failed to create firearm', {
        message: error.message,
        data: error.data,
        response: error.response,
        originalError: error
      })
      // Show field-level errors if available
      if (error.data) {
        const fieldErrors = Object.entries(error.data)
          .map(([field, err]) => `${field}: ${err.message || err}`)
          .join(', ')
        toast.error(fieldErrors || error.message || 'Failed to add firearm')
      } else {
        toast.error(error.message || 'Failed to add firearm')
      }
    },
  })
}

export function useUpdateFirearm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }) => {
      logger.mutation(COLLECTION, 'update', { id, fields: Object.keys(data) })

      const hasFiles = (data.photos?.length > 0) || (data.documents?.length > 0)

      if (hasFiles) {
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
          if (key === 'photos' || key === 'documents') {
            if (value && value.length > 0) {
              Array.from(value).forEach((file) => {
                formData.append(key, file)
              })
            }
          } else if (value !== undefined && value !== null && value !== '') {
            formData.append(key, value)
          }
        })
        return pb.collection(COLLECTION).update(id, formData)
      } else {
        const jsonData = {}
        Object.entries(data).forEach(([key, value]) => {
          if (key !== 'photos' && key !== 'documents' && value !== undefined && value !== null && value !== '') {
            jsonData[key] = value
          }
        })
        return pb.collection(COLLECTION).update(id, jsonData)
      }
    },
    onSuccess: (result, { id }) => {
      logger.info('Firearms', 'Updated firearm', { id })
      queryClient.invalidateQueries({ queryKey: [COLLECTION] })
      queryClient.invalidateQueries({ queryKey: [COLLECTION, id] })
      toast.success('Firearm updated successfully')
    },
    onError: (error) => {
      logger.error('Firearms', 'Failed to update firearm', { error: error.message })
      toast.error(error.message || 'Failed to update firearm')
    },
  })
}

export function useDeleteFirearm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      logger.mutation(COLLECTION, 'delete', { id })
      return pb.collection(COLLECTION).delete(id)
    },
    onSuccess: (_, id) => {
      logger.info('Firearms', 'Deleted firearm', { id })
      queryClient.invalidateQueries({ queryKey: [COLLECTION] })
      toast.success('Firearm deleted')
    },
    onError: (error) => {
      logger.error('Firearms', 'Failed to delete firearm', { error: error.message })
      toast.error(error.message || 'Failed to delete firearm')
    },
  })
}

export function useUpdateRoundCount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, roundsToAdd }) => {
      logger.mutation(COLLECTION, 'updateRoundCount', { id, roundsToAdd })
      const firearm = await pb.collection(COLLECTION).getOne(id)
      const newCount = (firearm.round_count || 0) + roundsToAdd
      return pb.collection(COLLECTION).update(id, { round_count: newCount })
    },
    onSuccess: (result, { id, roundsToAdd }) => {
      logger.info('Firearms', 'Updated round count', { id, newCount: result.round_count })
      queryClient.invalidateQueries({ queryKey: [COLLECTION] })
      queryClient.invalidateQueries({ queryKey: [COLLECTION, id] })
    },
  })
}
