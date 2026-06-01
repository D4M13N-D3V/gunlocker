import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import pb, { getUserId } from '../lib/pocketbase'
import { buildCreateBody, buildUpdateBody } from '../lib/records'
import toast from 'react-hot-toast'

const COLLECTION = 'gear'
const FILE_FIELDS = ['photos', 'documents']

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
      const body = buildCreateBody(data, { fileFields: FILE_FIELDS, extra: { user: getUserId() } })
      return pb.collection(COLLECTION).create(body)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COLLECTION] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
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
    mutationFn: async ({ id, data, removed }) => {
      const body = buildUpdateBody(data, { fileFields: FILE_FIELDS, removed })
      return pb.collection(COLLECTION).update(id, body)
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [COLLECTION] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
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
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
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
