import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import pb, { getUserId } from '../lib/pocketbase'
import { buildCreateBody, buildUpdateBody } from '../lib/records'
import toast from 'react-hot-toast'

const COLLECTION = 'accessories'
const FILE_FIELDS = ['photos', 'documents']

export function useAccessories(options = {}) {
  return useQuery({
    queryKey: [COLLECTION, options],
    queryFn: async () => {
      const { filter = '', sort = '-created', expand = 'mounted_on' } = options
      return pb.collection(COLLECTION).getFullList({
        filter,
        sort,
        expand,
      })
    },
  })
}

export function useAccessory(id) {
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

export function useCreateAccessory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      const body = buildCreateBody(data, { fileFields: FILE_FIELDS, extra: { user: getUserId() } })
      return pb.collection(COLLECTION).create(body)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COLLECTION] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Accessory added successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add accessory')
    },
  })
}

export function useUpdateAccessory() {
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
      toast.success('Accessory updated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update accessory')
    },
  })
}

export function useDeleteAccessory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      return pb.collection(COLLECTION).delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COLLECTION] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Accessory deleted')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete accessory')
    },
  })
}

export const ACCESSORY_CATEGORIES = [
  { value: 'light', label: 'Light' },
  { value: 'laser', label: 'Laser' },
  { value: 'grip', label: 'Grip' },
  { value: 'stock', label: 'Stock' },
  { value: 'handguard', label: 'Handguard' },
  { value: 'trigger', label: 'Trigger' },
  { value: 'suppressor', label: 'Suppressor' },
  { value: 'muzzle_device', label: 'Muzzle Device' },
  { value: 'sling', label: 'Sling' },
  { value: 'bipod', label: 'Bipod' },
  { value: 'other', label: 'Other' },
]
