import { useQuery } from '@tanstack/react-query'
import pb from '../lib/pocketbase'
import { differenceInDays, parseISO } from 'date-fns'

export function useInventory() {
  return useQuery({
    queryKey: ['inventory', 'all'],
    queryFn: async () => {
      const [firearms, ammunition, gear, optics, accessories] = await Promise.all([
        pb.collection('firearms').getFullList({ sort: '-created' }),
        pb.collection('ammunition').getFullList({ sort: '-created' }),
        pb.collection('gear').getFullList({ sort: '-created', expand: 'linked_firearm' }),
        pb.collection('optics').getFullList({ sort: '-created', expand: 'mounted_on' }),
        pb.collection('accessories').getFullList({ sort: '-created', expand: 'mounted_on' }),
      ])

      return {
        firearms,
        ammunition,
        gear,
        optics,
        accessories,
        all: [
          ...firearms.map((f) => ({ ...f, _category: 'firearm' })),
          ...ammunition.map((a) => ({ ...a, _category: 'ammunition' })),
          ...gear.map((g) => ({ ...g, _category: 'gear' })),
          ...optics.map((o) => ({ ...o, _category: 'optic' })),
          ...accessories.map((a) => ({ ...a, _category: 'accessory' })),
        ],
      }
    },
  })
}

export function useInventoryStats() {
  const { data: inventory, ...rest } = useInventory()

  if (!inventory) {
    return { data: null, ...rest }
  }

  const stats = {
    totalFirearms: inventory.firearms.length,
    totalAmmunition: inventory.ammunition.reduce((sum, a) => sum + (a.quantity || 0), 0),
    totalGear: inventory.gear.length,
    totalOptics: inventory.optics.length,
    totalAccessories: inventory.accessories.length,
    totalItems:
      inventory.firearms.length +
      inventory.gear.length +
      inventory.optics.length +
      inventory.accessories.length,
    totalValue: calculateTotalValue(inventory),
    valueByCategory: calculateValueByCategory(inventory),
    ammunitionByCaliber: groupAmmunitionByCaliber(inventory.ammunition),
    firearmsByType: groupFirearmsByType(inventory.firearms),
    activeFirearms: inventory.firearms.filter((f) => f.status === 'active').length,
  }

  return { data: stats, ...rest }
}

export function useWarrantyAlerts() {
  const { data: inventory, ...rest } = useInventory()

  if (!inventory) {
    return { data: [], ...rest }
  }

  const today = new Date()
  const alerts = []

  const checkWarranty = (items, category) => {
    items.forEach((item) => {
      if (item.warranty_expires) {
        const expiryDate = parseISO(item.warranty_expires)
        const daysRemaining = differenceInDays(expiryDate, today)

        if (daysRemaining <= 90) {
          alerts.push({
            id: item.id,
            name: item.name || `${item.brand} ${item.model}`,
            category,
            expiryDate: item.warranty_expires,
            daysRemaining,
            status:
              daysRemaining < 0
                ? 'expired'
                : daysRemaining <= 30
                  ? 'critical'
                  : daysRemaining <= 60
                    ? 'warning'
                    : 'upcoming',
          })
        }
      }
    })
  }

  checkWarranty(inventory.firearms, 'firearm')
  checkWarranty(inventory.gear, 'gear')
  checkWarranty(inventory.optics, 'optic')
  checkWarranty(inventory.accessories, 'accessory')

  alerts.sort((a, b) => a.daysRemaining - b.daysRemaining)

  return { data: alerts, ...rest }
}

export function useLowAmmoAlerts(threshold = 100) {
  const { data: inventory, ...rest } = useInventory()

  if (!inventory) {
    return { data: [], ...rest }
  }

  const byCaliber = groupAmmunitionByCaliber(inventory.ammunition)
  const alerts = Object.entries(byCaliber)
    .filter(([, data]) => data.totalQuantity <= threshold)
    .map(([caliber, data]) => ({
      caliber,
      quantity: data.totalQuantity,
      items: data.items,
    }))
    .sort((a, b) => a.quantity - b.quantity)

  return { data: alerts, ...rest }
}

function calculateTotalValue(inventory) {
  let total = 0

  inventory.firearms.forEach((f) => {
    total += f.purchase_price || 0
  })
  inventory.ammunition.forEach((a) => {
    total += a.purchase_price || 0
  })
  inventory.gear.forEach((g) => {
    total += g.purchase_price || 0
  })
  inventory.optics.forEach((o) => {
    total += o.purchase_price || 0
  })
  inventory.accessories.forEach((a) => {
    total += a.purchase_price || 0
  })

  return total
}

function calculateValueByCategory(inventory) {
  return {
    firearms: inventory.firearms.reduce((sum, f) => sum + (f.purchase_price || 0), 0),
    ammunition: inventory.ammunition.reduce((sum, a) => sum + (a.purchase_price || 0), 0),
    gear: inventory.gear.reduce((sum, g) => sum + (g.purchase_price || 0), 0),
    optics: inventory.optics.reduce((sum, o) => sum + (o.purchase_price || 0), 0),
    accessories: inventory.accessories.reduce((sum, a) => sum + (a.purchase_price || 0), 0),
  }
}

function groupAmmunitionByCaliber(ammunition) {
  return ammunition.reduce((acc, ammo) => {
    const caliber = ammo.caliber || 'Unknown'
    if (!acc[caliber]) {
      acc[caliber] = { totalQuantity: 0, items: [] }
    }
    acc[caliber].totalQuantity += ammo.quantity || 0
    acc[caliber].items.push(ammo)
    return acc
  }, {})
}

function groupFirearmsByType(firearms) {
  return firearms.reduce((acc, firearm) => {
    const type = firearm.type || 'other'
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(firearm)
    return acc
  }, {})
}
