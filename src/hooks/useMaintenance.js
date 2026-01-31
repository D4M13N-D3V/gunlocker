import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import pb from '../lib/pocketbase'
import toast from 'react-hot-toast'

const COLLECTION = 'maintenance_logs'

export function useMaintenance(options = {}) {
  return useQuery({
    queryKey: [COLLECTION, options],
    queryFn: async () => {
      const { filter = '', sort = '-date', expand = 'firearm' } = options
      return pb.collection(COLLECTION).getFullList({
        filter,
        sort,
        expand,
      })
    },
  })
}

export function useMaintenanceForFirearm(firearmId) {
  return useQuery({
    queryKey: [COLLECTION, 'firearm', firearmId],
    queryFn: async () => {
      if (!firearmId) return []
      return pb.collection(COLLECTION).getFullList({
        filter: `firearm = "${firearmId}"`,
        sort: '-date',
      })
    },
    enabled: !!firearmId,
  })
}

export function useMaintenanceLog(id) {
  return useQuery({
    queryKey: [COLLECTION, id],
    queryFn: async () => {
      if (!id) return null
      return pb.collection(COLLECTION).getOne(id, {
        expand: 'firearm,user',
      })
    },
    enabled: !!id,
  })
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      const formData = new FormData()

      Object.entries(data).forEach(([key, value]) => {
        if (key === 'photos') {
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
      toast.success('Maintenance log added')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add maintenance log')
    },
  })
}

export function useUpdateMaintenance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const formData = new FormData()

      Object.entries(data).forEach(([key, value]) => {
        if (key === 'photos') {
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
      toast.success('Maintenance log updated')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update maintenance log')
    },
  })
}

export function useDeleteMaintenance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      return pb.collection(COLLECTION).delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COLLECTION] })
      toast.success('Maintenance log deleted')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete maintenance log')
    },
  })
}

export const MAINTENANCE_TYPES = [
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'lubrication', label: 'Lubrication' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'repair', label: 'Repair' },
  { value: 'parts_replacement', label: 'Parts Replacement' },
  { value: 'other', label: 'Other' },
]
