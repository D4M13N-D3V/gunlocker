#!/usr/bin/env node
// PocketBase Migration Script for Gun Locker
// Usage: node scripts/migrate.js <admin_email> <admin_password>

import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function migrate() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Usage: node scripts/migrate.js <admin_email> <admin_password>');
    process.exit(1);
  }

  console.log('Authenticating as superuser...');
  console.log('Email:', email);

  try {
    const auth = await pb.collection('_superusers').authWithPassword(email, password);
    console.log('Authenticated successfully as:', auth.record.email);
  } catch (err) {
    console.error('Auth error details:', err.response || err.data || err);
    console.error('Migration failed:', err.message);
    process.exit(1);
  }

  // Define collections
  const collections = [
    {
      name: 'firearms',
      type: 'base',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'make', type: 'text' },
        { name: 'model', type: 'text' },
        { name: 'serial_number', type: 'text' },
        { name: 'caliber', type: 'text' },
        { name: 'type', type: 'select', options: { maxSelect: 1, values: ['handgun', 'rifle', 'shotgun', 'other'] } },
        { name: 'purchase_date', type: 'date' },
        { name: 'purchase_price', type: 'number' },
        { name: 'purchase_location', type: 'text' },
        { name: 'warranty_expires', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'photos', type: 'file', options: { maxSelect: 10, maxSize: 10485760, mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], thumbs: ['100x100', '300x200'] } },
        { name: 'documents', type: 'file', options: { maxSelect: 10, maxSize: 20971520, mimeTypes: ['application/pdf', 'image/jpeg', 'image/png'] } },
        { name: 'round_count', type: 'number', options: { min: 0, noDecimal: true } },
        { name: 'status', type: 'select', options: { maxSelect: 1, values: ['active', 'sold', 'stored', 'repair'] } },
        { name: 'user', type: 'relation', required: true, options: { collectionId: '_pb_users_auth_', maxSelect: 1 } },
      ],
      listRule: '@request.auth.id != "" && user = @request.auth.id',
      viewRule: '@request.auth.id != "" && user = @request.auth.id',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != "" && user = @request.auth.id',
      deleteRule: '@request.auth.id != "" && user = @request.auth.id',
    },
    {
      name: 'ammunition',
      type: 'base',
      fields: [
        { name: 'brand', type: 'text', required: true },
        { name: 'caliber', type: 'text', required: true },
        { name: 'grain', type: 'number', options: { noDecimal: true } },
        { name: 'type', type: 'text' },
        { name: 'quantity', type: 'number', required: true, options: { min: 0, noDecimal: true } },
        { name: 'lot_number', type: 'text' },
        { name: 'purchase_date', type: 'date' },
        { name: 'purchase_price', type: 'number' },
        { name: 'notes', type: 'text' },
        { name: 'user', type: 'relation', required: true, options: { collectionId: '_pb_users_auth_', maxSelect: 1 } },
      ],
      listRule: '@request.auth.id != "" && user = @request.auth.id',
      viewRule: '@request.auth.id != "" && user = @request.auth.id',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != "" && user = @request.auth.id',
      deleteRule: '@request.auth.id != "" && user = @request.auth.id',
    },
    {
      name: 'gear',
      type: 'base',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'category', type: 'select', required: true, options: { maxSelect: 1, values: ['hearing_protection', 'eye_protection', 'magazine', 'holster', 'case', 'bag', 'cleaning', 'targets', 'other'] } },
        { name: 'brand', type: 'text' },
        { name: 'model', type: 'text' },
        { name: 'serial_number', type: 'text' },
        { name: 'quantity', type: 'number', options: { min: 1, noDecimal: true } },
        { name: 'purchase_date', type: 'date' },
        { name: 'purchase_price', type: 'number' },
        { name: 'warranty_expires', type: 'date' },
        { name: 'condition', type: 'select', options: { maxSelect: 1, values: ['new', 'excellent', 'good', 'fair', 'poor'] } },
        { name: 'notes', type: 'text' },
        { name: 'photos', type: 'file', options: { maxSelect: 10, maxSize: 10485760, mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], thumbs: ['100x100', '200x200'] } },
        { name: 'documents', type: 'file', options: { maxSelect: 10, maxSize: 20971520, mimeTypes: ['application/pdf', 'image/jpeg', 'image/png'] } },
        { name: 'user', type: 'relation', required: true, options: { collectionId: '_pb_users_auth_', maxSelect: 1 } },
      ],
      listRule: '@request.auth.id != "" && user = @request.auth.id',
      viewRule: '@request.auth.id != "" && user = @request.auth.id',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != "" && user = @request.auth.id',
      deleteRule: '@request.auth.id != "" && user = @request.auth.id',
    },
    {
      name: 'optics',
      type: 'base',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'brand', type: 'text' },
        { name: 'model', type: 'text' },
        { name: 'type', type: 'select', required: true, options: { maxSelect: 1, values: ['red_dot', 'holographic', 'scope', 'iron_sights', 'magnifier', 'night_vision', 'thermal'] } },
        { name: 'magnification', type: 'text' },
        { name: 'serial_number', type: 'text' },
        { name: 'purchase_date', type: 'date' },
        { name: 'purchase_price', type: 'number' },
        { name: 'warranty_expires', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'photos', type: 'file', options: { maxSelect: 10, maxSize: 10485760, mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], thumbs: ['100x100', '200x200'] } },
        { name: 'documents', type: 'file', options: { maxSelect: 10, maxSize: 20971520, mimeTypes: ['application/pdf', 'image/jpeg', 'image/png'] } },
        { name: 'user', type: 'relation', required: true, options: { collectionId: '_pb_users_auth_', maxSelect: 1 } },
      ],
      listRule: '@request.auth.id != "" && user = @request.auth.id',
      viewRule: '@request.auth.id != "" && user = @request.auth.id',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != "" && user = @request.auth.id',
      deleteRule: '@request.auth.id != "" && user = @request.auth.id',
    },
    {
      name: 'accessories',
      type: 'base',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'category', type: 'select', required: true, options: { maxSelect: 1, values: ['light', 'laser', 'grip', 'stock', 'handguard', 'trigger', 'suppressor', 'muzzle_device', 'sling', 'bipod', 'other'] } },
        { name: 'brand', type: 'text' },
        { name: 'model', type: 'text' },
        { name: 'serial_number', type: 'text' },
        { name: 'purchase_date', type: 'date' },
        { name: 'purchase_price', type: 'number' },
        { name: 'warranty_expires', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'photos', type: 'file', options: { maxSelect: 10, maxSize: 10485760, mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], thumbs: ['100x100', '200x200'] } },
        { name: 'documents', type: 'file', options: { maxSelect: 10, maxSize: 20971520, mimeTypes: ['application/pdf', 'image/jpeg', 'image/png'] } },
        { name: 'user', type: 'relation', required: true, options: { collectionId: '_pb_users_auth_', maxSelect: 1 } },
      ],
      listRule: '@request.auth.id != "" && user = @request.auth.id',
      viewRule: '@request.auth.id != "" && user = @request.auth.id',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != "" && user = @request.auth.id',
      deleteRule: '@request.auth.id != "" && user = @request.auth.id',
    },
    {
      name: 'maintenance_logs',
      type: 'base',
      fields: [
        { name: 'date', type: 'date', required: true },
        { name: 'type', type: 'select', required: true, options: { maxSelect: 1, values: ['cleaning', 'lubrication', 'inspection', 'repair', 'parts_replacement', 'other'] } },
        { name: 'rounds_since_last', type: 'number', options: { min: 0, noDecimal: true } },
        { name: 'description', type: 'text' },
        { name: 'parts_replaced', type: 'text' },
        { name: 'cost', type: 'number', options: { min: 0 } },
        { name: 'notes', type: 'text' },
        { name: 'photos', type: 'file', options: { maxSelect: 10, maxSize: 10485760, mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], thumbs: ['100x100'] } },
        { name: 'user', type: 'relation', required: true, options: { collectionId: '_pb_users_auth_', maxSelect: 1 } },
      ],
      listRule: '@request.auth.id != "" && user = @request.auth.id',
      viewRule: '@request.auth.id != "" && user = @request.auth.id',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != "" && user = @request.auth.id',
      deleteRule: '@request.auth.id != "" && user = @request.auth.id',
    },
    {
      name: 'range_trips',
      type: 'base',
      fields: [
        { name: 'date', type: 'date', required: true },
        { name: 'location', type: 'text', required: true },
        { name: 'notes', type: 'text' },
        { name: 'weather', type: 'text' },
        { name: 'duration', type: 'number', options: { min: 0 } },
        { name: 'user', type: 'relation', required: true, options: { collectionId: '_pb_users_auth_', maxSelect: 1 } },
      ],
      listRule: '@request.auth.id != "" && user = @request.auth.id',
      viewRule: '@request.auth.id != "" && user = @request.auth.id',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != "" && user = @request.auth.id',
      deleteRule: '@request.auth.id != "" && user = @request.auth.id',
    },
    {
      name: 'range_trip_ammo',
      type: 'base',
      fields: [
        { name: 'rounds_fired', type: 'number', required: true, options: { min: 1, noDecimal: true } },
        { name: 'notes', type: 'text' },
        { name: 'user', type: 'relation', required: true, options: { collectionId: '_pb_users_auth_', maxSelect: 1 } },
      ],
      listRule: '@request.auth.id != "" && user = @request.auth.id',
      viewRule: '@request.auth.id != "" && user = @request.auth.id',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != "" && user = @request.auth.id',
      deleteRule: '@request.auth.id != "" && user = @request.auth.id',
    },
  ];

  // Get existing collections
  console.log('\nFetching existing collections...');
  let existingCollections;
  try {
    existingCollections = await pb.collections.getFullList();
    console.log('Found', existingCollections.length, 'existing collections');
  } catch (err) {
    console.error('Failed to fetch collections:', err.message);
    process.exit(1);
  }

  const existingNames = existingCollections.map(c => c.name);
  const collectionIds = {};
  existingCollections.forEach(c => { collectionIds[c.name] = c.id; });

  // Create collections
  console.log('\nCreating collections...');
  for (const coll of collections) {
    if (existingNames.includes(coll.name)) {
      console.log(`  "${coll.name}" already exists, skipping`);
      continue;
    }

    try {
      const created = await pb.collections.create({
        name: coll.name,
        type: coll.type,
        fields: coll.fields,
        listRule: coll.listRule,
        viewRule: coll.viewRule,
        createRule: coll.createRule,
        updateRule: coll.updateRule,
        deleteRule: coll.deleteRule,
      });
      collectionIds[coll.name] = created.id;
      console.log(`  Created "${coll.name}"`);
    } catch (err) {
      console.error(`  Failed to create "${coll.name}":`, err.message);
      if (err.response?.data) {
        console.error('    Details:', JSON.stringify(err.response.data));
      }
    }
  }

  // Add relation fields that reference other collections
  console.log('\nAdding relation fields...');

  // Add firearm relation to gear, optics, accessories, maintenance_logs
  const relationsToAdd = [
    { collection: 'gear', field: 'linked_firearm', target: 'firearms' },
    { collection: 'optics', field: 'mounted_on', target: 'firearms' },
    { collection: 'accessories', field: 'mounted_on', target: 'firearms' },
    { collection: 'maintenance_logs', field: 'firearm', target: 'firearms', required: true },
    { collection: 'range_trips', field: 'firearms_used', target: 'firearms', maxSelect: 99 },
    { collection: 'range_trip_ammo', field: 'range_trip', target: 'range_trips', required: true },
    { collection: 'range_trip_ammo', field: 'firearm', target: 'firearms', required: true },
    { collection: 'range_trip_ammo', field: 'ammunition', target: 'ammunition' },
  ];

  for (const rel of relationsToAdd) {
    const collId = collectionIds[rel.collection];
    const targetId = collectionIds[rel.target];

    if (!collId || !targetId) {
      console.log(`  Skipping ${rel.collection}.${rel.field} - collection not found`);
      continue;
    }

    try {
      // Get current collection
      const coll = await pb.collections.getOne(collId);

      // Check if field already exists
      if (coll.fields?.some(f => f.name === rel.field)) {
        console.log(`  "${rel.collection}.${rel.field}" already exists, skipping`);
        continue;
      }

      // Add the relation field
      const newField = {
        name: rel.field,
        type: 'relation',
        required: rel.required || false,
        options: {
          collectionId: targetId,
          maxSelect: rel.maxSelect || 1,
        },
      };

      await pb.collections.update(collId, {
        fields: [...(coll.fields || []), newField],
      });
      console.log(`  Added "${rel.collection}.${rel.field}" -> "${rel.target}"`);
    } catch (err) {
      console.error(`  Failed to add "${rel.collection}.${rel.field}":`, err.message);
    }
  }

  console.log('\nMigration complete!');
  console.log('You can now register a user at http://localhost:5173');
}

migrate().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
