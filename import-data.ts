// Simple EV Database Import Script
// This script imports all manufacturers, models, and vehicles from CSV files

import fs from 'fs';
import { parse } from 'csv-parse';
import { db } from './server/db';
import * as schema from './shared/schema';
import { eq } from 'drizzle-orm';

// Helper: Read and parse CSV file
async function parseCSV(filePath: string): Promise<any[]> {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return new Promise((resolve, reject) => {
    parse(fileContent, { columns: true, skip_empty_lines: true }, (err, records) => {
      if (err) reject(err);
      else resolve(records);
    });
  });
}

// Log with timestamp
function log(message: string): void {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Clear tables before import
async function clearTables(): Promise<void> {
  try {
    log('Clearing existing data...');
    
    // Delete in correct order (foreign key constraints)
    await db.delete(schema.vehicles);
    await db.delete(schema.carModels);
    await db.delete(schema.manufacturers);
    await db.delete(schema.bodyStyles);
    await db.delete(schema.driveTypes);
    await db.delete(schema.batteryTypes);
    await db.delete(schema.chargingPortLocations);
    await db.delete(schema.rangeRatingSystems);
    
    log('All tables cleared successfully');
  } catch (error: any) {
    log(`Error clearing tables: ${error.message}`);
    throw error;
  }
}

// 1. Import basic reference data
async function importReferenceData(): Promise<void> {
  try {
    log('Importing reference data...');
    
    // Import body styles
    await db.insert(schema.bodyStyles).values([
      { id: 1, name: 'Coupe' },
      { id: 2, name: 'SUV' },
      { id: 3, name: 'Sedan' },
      { id: 4, name: 'Hatchback' },
      { id: 5, name: 'Wagon' }
    ]);
    
    // Import drive types
    await db.insert(schema.driveTypes).values([
      { id: 1, name: 'AWD' },
      { id: 2, name: 'FWD' },
      { id: 3, name: 'RWD' }
    ]);
    
    // Import battery types
    await db.insert(schema.batteryTypes).values([
      { id: 1, name: 'NCM' },
      { id: 2, name: 'NCA' },
      { id: 3, name: 'LFP' }
    ]);
    
    // Import charging port locations
    await db.insert(schema.chargingPortLocations).values([
      { id: 1, location: 'Front' },
      { id: 2, location: 'Rear' },
      { id: 3, location: 'Side' }
    ]);
    
    // Import range rating systems
    await db.insert(schema.rangeRatingSystems).values([
      { id: 1, name: 'WLTP' },
      { id: 2, name: 'EPA' },
      { id: 3, name: 'NEDC' },
      { id: 4, name: 'CLTC' }
    ]);
    
    log('Reference data imported successfully');
  } catch (error: any) {
    log(`Error importing reference data: ${error.message}`);
    throw error;
  }
}

// 2. Import manufacturers
async function importManufacturers(): Promise<void> {
  try {
    log('Importing manufacturers...');
    const records = await parseCSV('./attached_assets/manufacturers_final.csv');
    
    for (const record of records) {
      await db.insert(schema.manufacturers).values({
        id: parseInt(record.id),
        name: record.name,
        country: record.country,
        description: record.description,
        website: record.website,
        logo: record.logo
      });
    }
    
    log(`Imported ${records.length} manufacturers`);
  } catch (error: any) {
    log(`Error importing manufacturers: ${error.message}`);
    throw error;
  }
}

// 3. Import car models
async function importCarModels(): Promise<void> {
  try {
    log('Importing car models...');
    const records = await parseCSV('./attached_assets/models_final.csv');
    
    for (const record of records) {
      await db.insert(schema.carModels).values({
        id: parseInt(record.id),
        manufacturerId: parseInt(record.manufacturer_id),
        name: record.name,
        bodyStyleId: parseInt(record.body_style_id),
        image: record.image,
        description: record.description,
        viewCount: 0
      });
    }
    
    log(`Imported ${records.length} car models`);
  } catch (error: any) {
    log(`Error importing car models: ${error.message}`);
    throw error;
  }
}

// 4. Import vehicles (in batches to avoid memory issues)
async function importVehicles(): Promise<void> {
  try {
    log('Importing vehicles...');
    const records = await parseCSV('./attached_assets/vehicles_final.csv');
    const BATCH_SIZE = 50;
    
    // Process in batches
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      log(`Processing batch ${i / BATCH_SIZE + 1} (${batch.length} vehicles)`);
      
      for (const record of batch) {
        await db.insert(schema.vehicles).values({
          id: parseInt(record.id),
          modelId: parseInt(record.model_id),
          variantName: record.variant_name,
          batteryCapacity: record.battery_capacity ? parseFloat(record.battery_capacity) : null,
          usableBatteryCapacity: record.usable_battery_capacity ? parseFloat(record.usable_battery_capacity) : null,
          officialRange: record.official_range ? parseFloat(record.official_range) : null,
          realWorldRange: record.real_world_range ? parseFloat(record.real_world_range) : null,
          efficiency: record.efficiency ? parseFloat(record.efficiency) : null,
          driveTypeId: record.drive_type_id ? parseInt(record.drive_type_id) : null,
          batteryTypeId: record.battery_type_id ? parseInt(record.battery_type_id) : null,
          chargingPortLocationId: record.charging_port_location_id ? parseInt(record.charging_port_location_id) : null,
          rangeRatingSystemId: record.range_rating_system_id ? parseInt(record.range_rating_system_id) : null,
          batteryWarrantyYears: record.battery_warranty_years ? parseInt(record.battery_warranty_years) : null,
          batteryWarrantyKm: record.battery_warranty_km ? parseInt(record.battery_warranty_km) : null,
          manufacturingStartYear: parseInt(record.manufacturing_start_year),
          manufacturingEndYear: record.manufacturing_end_year ? parseInt(record.manufacturing_end_year) : null,
          horsepower: record.horsepower ? parseFloat(record.horsepower) : null,
          torque: record.torque ? parseFloat(record.torque) : null,
          acceleration: record.acceleration ? parseFloat(record.acceleration) : null,
          topSpeed: record.top_speed ? parseFloat(record.top_speed) : null,
          fastChargingCapacity: record.fast_charging_capacity ? parseFloat(record.fast_charging_capacity) : null,
          fastChargingTime: record.fast_charging_time ? parseFloat(record.fast_charging_time) : null,
          weight: record.weight ? parseFloat(record.weight) : null,
          v2lSupport: record.v2l_support === 'true',
          v2lOutputPower: record.v2l_output_power ? parseFloat(record.v2l_output_power) : null,
          bootSpace: record.boot_space ? parseFloat(record.boot_space) : null,
          price: record.price ? parseFloat(record.price) : null
        });
      }
    }
    
    log(`Imported ${records.length} vehicles successfully`);
  } catch (error: any) {
    log(`Error importing vehicles: ${error.message}`);
    throw error;
  }
}

// 5. Add default admin user
async function addDefaultUser(): Promise<void> {
  try {
    log('Adding default admin user...');
    
    // Check if user already exists
    const existingUser = await db.select().from(schema.users).where(eq(schema.users.username, 'admin')).limit(1);
    
    if (existingUser.length === 0) {
      await db.insert(schema.users).values({
        username: 'admin',
        password: 'admin', // Note: in a real app, this should be hashed
        isAdmin: true
      });
      log('Admin user created');
    } else {
      log('Admin user already exists');
    }
  } catch (error: any) {
    log(`Error adding default user: ${error.message}`);
    throw error;
  }
}

// Main function to run the import process
async function runImport(): Promise<void> {
  try {
    log('Starting EV database import process...');
    
    await clearTables();
    await importReferenceData();
    await importManufacturers();
    await importCarModels();
    await importVehicles();
    await addDefaultUser();
    
    log('Import completed successfully');
    
    // Show count of imported records
    const manufacturerCount = await db.select({ count: schema.manufacturers.id }).from(schema.manufacturers);
    const modelCount = await db.select({ count: schema.carModels.id }).from(schema.carModels);
    const vehicleCount = await db.select({ count: schema.vehicles.id }).from(schema.vehicles);
    
    log(`Database now contains:
    - ${manufacturerCount[0].count} manufacturers
    - ${modelCount[0].count} car models
    - ${vehicleCount[0].count} vehicles`);
    
  } catch (error: any) {
    log(`Import failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the import process
runImport();