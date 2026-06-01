import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import pb, { getUserId } from '../lib/pocketbase'
import { buildCreateBody, buildUpdateBody } from '../lib/records'
import logger from '../lib/logger'
import toast from 'react-hot-toast'

const COLLECTION = 'firearms'
const FILE_FIELDS = ['photos', 'documents']

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
      const body = buildCreateBody(data, {
        fileFields: FILE_FIELDS,
        extra: { user: getUserId() },
      })
      return pb.collection(COLLECTION).create(body)
    },
    onSuccess: (result) => {
      logger.info('Firearms', 'Created firearm', { id: result.id, name: result.name })
      queryClient.invalidateQueries({ queryKey: [COLLECTION] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
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
    mutationFn: async ({ id, data, removed }) => {
      logger.mutation(COLLECTION, 'update', { id, fields: Object.keys(data) })
      const body = buildUpdateBody(data, { fileFields: FILE_FIELDS, removed })
      return pb.collection(COLLECTION).update(id, body)
    },
    onSuccess: (result, { id }) => {
      logger.info('Firearms', 'Updated firearm', { id })
      queryClient.invalidateQueries({ queryKey: [COLLECTION] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
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
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
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
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: [COLLECTION, id] })
    },
  })
}
