import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import pb from '../lib/pocketbase'
import toast from 'react-hot-toast'

const TRIPS_COLLECTION = 'range_trips'
const AMMO_COLLECTION = 'range_trip_ammo'

export function useRangeTrips(options = {}) {
  return useQuery({
    queryKey: [TRIPS_COLLECTION, options],
    queryFn: async () => {
      const { filter = '', sort = '-date', expand = 'firearms_used' } = options
      return pb.collection(TRIPS_COLLECTION).getFullList({
        filter,
        sort,
        expand,
      })
    },
  })
}

export function useRangeTrip(id) {
  return useQuery({
    queryKey: [TRIPS_COLLECTION, id],
    queryFn: async () => {
      if (!id) return null
      return pb.collection(TRIPS_COLLECTION).getOne(id, {
        expand: 'firearms_used,user',
      })
    },
    enabled: !!id,
  })
}

export function useRangeTripAmmo(tripId) {
  return useQuery({
    queryKey: [AMMO_COLLECTION, 'trip', tripId],
    queryFn: async () => {
      if (!tripId) return []
      return pb.collection(AMMO_COLLECTION).getFullList({
        filter: `range_trip = "${tripId}"`,
        expand: 'firearm,ammunition',
      })
    },
    enabled: !!tripId,
  })
}

export function useCreateRangeTrip() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      return pb.collection(TRIPS_COLLECTION).create({
        ...data,
        user: pb.authStore.model.id,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRIPS_COLLECTION] })
      toast.success('Range trip logged')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to log range trip')
    },
  })
}

export function useUpdateRangeTrip() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }) => {
      return pb.collection(TRIPS_COLLECTION).update(id, data)
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [TRIPS_COLLECTION] })
      queryClient.invalidateQueries({ queryKey: [TRIPS_COLLECTION, id] })
      toast.success('Range trip updated')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update range trip')
    },
  })
}

export function useDeleteRangeTrip() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      // Delete associated ammo records first
      const ammoRecords = await pb.collection(AMMO_COLLECTION).getFullList({
        filter: `range_trip = "${id}"`,
      })
      for (const record of ammoRecords) {
        await pb.collection(AMMO_COLLECTION).delete(record.id)
      }
      return pb.collection(TRIPS_COLLECTION).delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRIPS_COLLECTION] })
      queryClient.invalidateQueries({ queryKey: [AMMO_COLLECTION] })
      toast.success('Range trip deleted')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete range trip')
    },
  })
}

export function useCreateRangeTripAmmo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      // Create the ammo usage record
      const record = await pb.collection(AMMO_COLLECTION).create({
        ...data,
        user: pb.authStore.model.id,
      })

      // Update ammunition quantity (decrease)
      if (data.ammunition && data.rounds_fired) {
        const ammo = await pb.collection('ammunition').getOne(data.ammunition)
        const newQuantity = Math.max(0, (ammo.quantity || 0) - data.rounds_fired)
        await pb.collection('ammunition').update(data.ammunition, {
          quantity: newQuantity,
        })
      }

      // Update firearm round count (increase)
      if (data.firearm && data.rounds_fired) {
        const firearm = await pb.collection('firearms').getOne(data.firearm)
        const newCount = (firearm.round_count || 0) + data.rounds_fired
        await pb.collection('firearms').update(data.firearm, {
          round_count: newCount,
        })
      }

      return record
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AMMO_COLLECTION] })
      queryClient.invalidateQueries({ queryKey: ['ammunition'] })
      queryClient.invalidateQueries({ queryKey: ['firearms'] })
      toast.success('Ammo usage logged')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to log ammo usage')
    },
  })
}

export function useDeleteRangeTripAmmo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      return pb.collection(AMMO_COLLECTION).delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AMMO_COLLECTION] })
      toast.success('Ammo usage record deleted')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete ammo usage record')
    },
  })
}
