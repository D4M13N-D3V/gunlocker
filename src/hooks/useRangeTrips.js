import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import pb, { getUserId } from '../lib/pocketbase'
import toast from 'react-hot-toast'

const TRIPS_COLLECTION = 'range_trips'
const AMMO_COLLECTION = 'range_trip_ammo'

// Drop empty/blank values so PocketBase typed columns (e.g. the `duration`
// number field) aren't sent an empty string, which fails to save.
function cleanData(data) {
  const clean = {}
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      clean[key] = value
    }
  })
  return clean
}

// Reverse the inventory side effects of a range_trip_ammo record: add the
// rounds back to ammunition stock and subtract them from the firearm's round
// count. Best-effort and non-atomic (PocketBase has no client-side
// transactions); a missing related record is ignored so the delete proceeds.
async function reverseAmmoUsage(record) {
  if (!record) return
  const rounds = record.rounds_fired || 0
  if (!rounds) return

  if (record.ammunition) {
    try {
      const ammo = await pb.collection('ammunition').getOne(record.ammunition)
      await pb.collection('ammunition').update(record.ammunition, {
        quantity: (ammo.quantity || 0) + rounds,
      })
    } catch {
      // ammunition record no longer exists; nothing to restore
    }
  }

  if (record.firearm) {
    try {
      const firearm = await pb.collection('firearms').getOne(record.firearm)
      await pb.collection('firearms').update(record.firearm, {
        round_count: Math.max(0, (firearm.round_count || 0) - rounds),
      })
    } catch {
      // firearm record no longer exists; nothing to restore
    }
  }
}

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
        ...cleanData(data),
        user: getUserId(),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRIPS_COLLECTION] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
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
      return pb.collection(TRIPS_COLLECTION).update(id, cleanData(data))
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [TRIPS_COLLECTION] })
      queryClient.invalidateQueries({ queryKey: [TRIPS_COLLECTION, id] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
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
        await reverseAmmoUsage(record)
        await pb.collection(AMMO_COLLECTION).delete(record.id)
      }
      return pb.collection(TRIPS_COLLECTION).delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRIPS_COLLECTION] })
      queryClient.invalidateQueries({ queryKey: [AMMO_COLLECTION] })
      queryClient.invalidateQueries({ queryKey: ['ammunition'] })
      queryClient.invalidateQueries({ queryKey: ['firearms'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
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
        user: getUserId(),
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
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
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
      // Restore the ammo/round-count this usage consumed before removing it.
      const record = await pb.collection(AMMO_COLLECTION).getOne(id)
      await reverseAmmoUsage(record)
      return pb.collection(AMMO_COLLECTION).delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AMMO_COLLECTION] })
      queryClient.invalidateQueries({ queryKey: ['ammunition'] })
      queryClient.invalidateQueries({ queryKey: ['firearms'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Ammo usage record deleted')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete ammo usage record')
    },
  })
}
