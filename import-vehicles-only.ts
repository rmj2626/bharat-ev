import fs from 'fs';
import { parse } from 'csv-parse/sync';
import path from 'path';
import { getStorage } from './server/db';
import { sql } from 'drizzle-orm';

// Simpler approach to count vehicles
async function countVehicles() {
  const db = await getStorage();
  const result = await db.execute(sql`SELECT COUNT(*) FROM vehicles`);
  return parseInt(result.rows[0].count);
}

// Import vehicles directly with SQL to avoid complex Drizzle queries
async function importVehicles() {
  const db = await getStorage();
  console.log('Importing vehicles...');
  const filePath = path.resolve('./attached_assets/vehicles_final.csv');
  const fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  });
  
  console.log(`Found ${records.length} vehicles in CSV file.`);
  
  // First get existing vehicle IDs to avoid duplicates
  const existingVehicles = await db.execute(sql`
    SELECT v.id, cm.id as model_id, m.name as manufacturer_name, cm.model_name, v.variant_name
    FROM vehicles v
    JOIN car_models cm ON v.model_id = cm.id
    JOIN manufacturers m ON cm.manufacturer_id = m.id
  `);
  
  // Create a set of existing vehicle keys (manufacturer-model-variant)
  const existingVehicleKeys = new Set();
  for (const vehicle of existingVehicles.rows) {
    const key = `${vehicle.manufacturer_name}-${vehicle.model_name}-${vehicle.variant_name}`;
    existingVehicleKeys.add(key);
  }
  
  // Get model mappings
  const modelResults = await db.execute(sql`
    SELECT cm.id, m.name as manufacturer_name, cm.model_name
    FROM car_models cm
    JOIN manufacturers m ON cm.manufacturer_id = m.id
  `);
  
  const modelMap: Record<string, number> = {};
  for (const model of modelResults.rows) {
    const key = `${model.manufacturer_name}-${model.model_name}`;
    modelMap[key] = model.id;
  }
  
  // Get drive type, battery type and range rating system mappings
  const driveTypeResults = await db.execute(sql`SELECT id, name FROM drive_types`);
  const driveTypeMap: Record<string, number> = {};
  for (const type of driveTypeResults.rows) {
    driveTypeMap[type.name] = type.id;
  }
  
  const batteryTypeResults = await db.execute(sql`SELECT id, name FROM battery_types`);
  const batteryTypeMap: Record<string, number> = {};
  for (const type of batteryTypeResults.rows) {
    batteryTypeMap[type.name] = type.id;
  }
  
  const ratingSystemResults = await db.execute(sql`SELECT id, name FROM range_rating_systems`);
  const ratingSystemMap: Record<string, number> = {};
  for (const system of ratingSystemResults.rows) {
    ratingSystemMap[system.name] = system.id;
  }
  
  // Process in batches of 10 to avoid memory issues
  const batchSize = 10;
  let importedCount = 0;
  let skippedCount = 0;
  
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    console.log(`Processing batch ${i/batchSize + 1} of ${Math.ceil(records.length/batchSize)}`);
    
    for (const record of batch) {
      const uniqueModelKey = `${record['Manufacturer Name']}-${record['Model Name']}`;
      const uniqueVehicleKey = `${record['Manufacturer Name']}-${record['Model Name']}-${record['Variant Name']}`;
      
      // Skip if this vehicle is already in the database
      if (existingVehicleKeys.has(uniqueVehicleKey)) {
        skippedCount++;
        continue;
      }
      
      const modelId = modelMap[uniqueModelKey];
      const driveTypeId = driveTypeMap[record['Drive Type']];
      const batteryTypeId = batteryTypeMap[record['Battery Type']];
      
      if (!modelId) {
        console.error(`Skipping vehicle ${uniqueVehicleKey} - Model not found`);
        continue;
      }
      
      if (!driveTypeId) {
        console.error(`Skipping vehicle ${uniqueVehicleKey} - Drive type not found: ${record['Drive Type']}`);
        continue;
      }
      
      if (!batteryTypeId) {
        console.error(`Skipping vehicle ${uniqueVehicleKey} - Battery type not found: ${record['Battery Type']}`);
        continue;
      }
      
      const rangeRatingId = record['Range Rating System'] 
        ? ratingSystemMap[record['Range Rating System']] 
        : null;
      
      // For price, convert from lakhs to actual value
      const price = record['price (in lakhs)'] 
        ? parseFloat(record['price (in lakhs)']) * 100000 
        : null;
      
      // Check if v2l is supported
      const v2lSupport = record['v2l output kw AC'] && parseFloat(record['v2l output kw AC']) > 0;
      const v2lOutputPower = v2lSupport ? parseFloat(record['v2l output kw AC']) * 1000 : null; // Convert kW to W
      
      try {
        await db.execute(sql`
          INSERT INTO vehicles (
            model_id, variant_name, drive_type_id, battery_type_id, 
            battery_capacity, usable_battery_capacity, 
            battery_warranty_years, battery_warranty_km,
            official_range, range_rating_id, real_world_range, 
            efficiency, horsepower, torque, 
            acceleration, top_speed, 
            fast_charging_capacity, fast_charging_time, 
            weight, v2l_support, v2l_output_power, price
          ) VALUES (
            ${modelId}, ${record['Variant Name']}, ${driveTypeId}, ${batteryTypeId},
            ${record['Battery Capacity'] ? parseFloat(record['Battery Capacity']) : null},
            ${record['Useable Capacity'] ? parseFloat(record['Useable Capacity']) : null},
            ${record['Warranty Years'] ? parseInt(record['Warranty Years']) : null},
            ${record['Warranty Kms'] ? parseInt(record['Warranty Kms']) : null},
            ${record['Official Range'] ? parseFloat(record['Official Range']) : null},
            ${rangeRatingId},
            ${record['Real Range'] ? parseFloat(record['Real Range']) : null},
            ${record['Efficiency'] ? parseFloat(record['Efficiency']) : null},
            ${record['Horsepower'] ? parseFloat(record['Horsepower']) : null},
            ${record['Torque'] ? parseFloat(record['Torque']) : null},
            ${record['0-100'] ? parseFloat(record['0-100']) : null},
            ${record['Top speed'] ? parseFloat(record['Top speed']) : null},
            ${record['Fast Charging DC KW'] ? parseFloat(record['Fast Charging DC KW']) : null},
            ${record['10-80 time'] ? parseFloat(record['10-80 time']) : null},
            ${record['Weight'] ? parseFloat(record['Weight']) : null},
            ${v2lSupport},
            ${v2lOutputPower},
            ${price}
          )
        `);
        
        importedCount++;
      } catch (error) {
        console.error(`Error importing vehicle ${uniqueVehicleKey}:`, error);
      }
    }
    
    console.log(`Imported ${importedCount} vehicles so far, skipped ${skippedCount} already existing...`);
  }
  
  console.log(`Import complete. Total imported: ${importedCount}, skipped: ${skippedCount}`);
}

async function main() {
  try {
    console.log('Starting database import process...');
    
    // Check how many vehicles we already have
    const existingCount = await countVehicles();
    console.log(`Found ${existingCount} existing vehicles in the database.`);
    
    // Import vehicles
    await importVehicles();
    
    // Verify final count
    const finalCount = await countVehicles();
    console.log(`Final count: ${finalCount} vehicles in the database.`);
    
    console.log('Database import completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during import:', error);
    process.exit(1);
  }
}

main();