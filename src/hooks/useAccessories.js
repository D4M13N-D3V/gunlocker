import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import pb from '../lib/pocketbase'
import toast from 'react-hot-toast'

const COLLECTION = 'accessories'

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

      formData.append('user', pb.authStore.model.id)

      return pb.collection(COLLECTION).create(formData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COLLECTION] })
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
    mutationFn: async ({ id, data }) => {
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
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [COLLECTION] })
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
