import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import pb, { getUserId } from '../lib/pocketbase'
import { buildCreateBody, buildUpdateBody } from '../lib/records'
import toast from 'react-hot-toast'

const COLLECTION = 'ammunition'

export function useAmmunition(options = {}) {
  return useQuery({
    queryKey: [COLLECTION, options],
    queryFn: async () => {
      const { filter = '', sort = '-created' } = options
      return pb.collection(COLLECTION).getFullList({
        filter,
        sort,
      })
    },
  })
}

export function useAmmo(id) {
  return useQuery({
    queryKey: [COLLECTION, id],
    queryFn: async () => {
      if (!id) return null
      return pb.collection(COLLECTION).getOne(id)
    },
    enabled: !!id,
  })
}

export function useCreateAmmo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      const body = buildCreateBody(data, { extra: { user: getUserId() } })
      return pb.collection(COLLECTION).create(body)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COLLECTION] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Ammunition added successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add ammunition')
    },
  })
}

export function useUpdateAmmo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const body = buildUpdateBody(data)
      return pb.collection(COLLECTION).update(id, body)
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [COLLECTION] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: [COLLECTION, id] })
      toast.success('Ammunition updated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update ammunition')
    },
  })
}

export function useDeleteAmmo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      return pb.collection(COLLECTION).delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COLLECTION] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Ammunition deleted')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete ammunition')
    },
  })
}

export function useUpdateAmmoQuantity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, quantityChange }) => {
      const ammo = await pb.collection(COLLECTION).getOne(id)
      const newQuantity = Math.max(0, (ammo.quantity || 0) + quantityChange)
      return pb.collection(COLLECTION).update(id, { quantity: newQuantity })
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [COLLECTION] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: [COLLECTION, id] })
    },
  })
}

export function useAmmoByCaliber() {
  const { data: ammo, ...rest } = useAmmunition()

  const byCaliber = ammo?.reduce((acc, item) => {
    const caliber = item.caliber || 'Unknown'
    if (!acc[caliber]) {
      acc[caliber] = { caliber, totalQuantity: 0, items: [] }
    }
    acc[caliber].totalQuantity += item.quantity || 0
    acc[caliber].items.push(item)
    return acc
  }, {})

  return {
    data: byCaliber ? Object.values(byCaliber) : [],
    ...rest,
  }
}
