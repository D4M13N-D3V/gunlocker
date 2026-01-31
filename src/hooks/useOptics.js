import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import pb from '../lib/pocketbase'
import toast from 'react-hot-toast'

const COLLECTION = 'optics'

export function useOptics(options = {}) {
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
