import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import pb from '../lib/pocketbase'
import toast from 'react-hot-toast'

const COLLECTION = 'gear'

export function useGear(options = {}) {
  return useQuery({
    queryKey: [COLLECTION, options],
    queryFn: async () => {
      const { filter = '', sort = '-created', expand = 'linked_firearm' } = options
      return pb.collection(COLLECTION).getFullList({
        filter,
        sort,
        expand,
      })
    },
  })
}

export function useGearItem(id) {
  return useQuery({
    queryKey: [COLLECTION, id],
    queryFn: async () => {
      if (!id) return null
      return pb.collection(COLLECTION).getOne(id, {
        expand: 'linked_firearm,user',
      })
    },
    enabled: !!id,
  })
}

export function useCreateGear() {
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
      toast.success('Gear added successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add gear')
    },
  })
}

export function useUpdateGear() {
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
        } else if (value !== undefined && value !== null) {
          formData.append(key, value)
        }
      })

      return pb.collection(COLLECTION).update(id, formData)
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [COLLECTION] })
      queryClient.invalidateQueries({ queryKey: [COLLECTION, id] })
      toast.success('Gear updated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update gear')
    },
  })
}

export function useDeleteGear() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      return pb.collection(COLLECTION).delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COLLECTION] })
      toast.success('Gear deleted')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete gear')
    },
  })
}

export const GEAR_CATEGORIES = [
  { value: 'hearing_protection', label: 'Hearing Protection' },
  { value: 'eye_protection', label: 'Eye Protection' },
  { value: 'magazine', label: 'Magazine' },
  { value: 'holster', label: 'Holster' },
  { value: 'case', label: 'Case' },
  { value: 'bag', label: 'Bag' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'targets', label: 'Targets' },
  { value: 'other', label: 'Other' },
]

export const CONDITION_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
]
