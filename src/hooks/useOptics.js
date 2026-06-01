import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import pb, { getUserId } from '../lib/pocketbase'
import { buildCreateBody, buildUpdateBody } from '../lib/records'
import logger from '../lib/logger'
import toast from 'react-hot-toast'

const COLLECTION = 'optics'
const FILE_FIELDS = ['photos', 'documents']

export function useOptics(options = {}) {
  return useQuery({
    queryKey: [COLLECTION, options],
    queryFn: async () => {
      const { filter = '', sort = '-created', expand = 'mounted_on' } = options
      logger.query(COLLECTION, { filter, sort, expand })
      const result = await pb.collection(COLLECTION).getFullList({
        filter,
        sort,
        expand,
      })
      logger.debug('Optics', `Fetched ${result.length} optics`, { filter })
      return result
    },
  })
}

export function useOptic(id) {
  return useQuery({
    queryKey: [COLLECTION, id],
    queryFn: async () => {
      if (!id) return null
      return pb.collection(COLLECTION).getOne(id, {
        expand: 'mounted_on,user',
      })
    },
    enabled: !!id,
  })
}

export function useCreateOptic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      const body = buildCreateBody(data, { fileFields: FILE_FIELDS, extra: { user: getUserId() } })
      return pb.collection(COLLECTION).create(body)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COLLECTION] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Optic added successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add optic')
    },
  })
}

export function useUpdateOptic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data, removed }) => {
      const body = buildUpdateBody(data, { fileFields: FILE_FIELDS, removed })
      return pb.collection(COLLECTION).update(id, body)
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [COLLECTION] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: [COLLECTION, id] })
      toast.success('Optic updated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update optic')
    },
  })
}

export function useDeleteOptic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      return pb.collection(COLLECTION).delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COLLECTION] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Optic deleted')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete optic')
    },
  })
}

export const OPTIC_TYPES = [
  { value: 'red_dot', label: 'Red Dot' },
  { value: 'holographic', label: 'Holographic' },
  { value: 'scope', label: 'Scope' },
  { value: 'iron_sights', label: 'Iron Sights' },
  { value: 'magnifier', label: 'Magnifier' },
  { value: 'night_vision', label: 'Night Vision' },
  { value: 'thermal', label: 'Thermal' },
]
