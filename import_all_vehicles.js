import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import pg from 'pg';
const { Pool } = pg;

// Get database connection string from environment
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

async function runQuery(query, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result;
  } finally {
    client.release();
  }
}

async function getVehicleCount() {
  const result = await runQuery('SELECT COUNT(*) FROM vehicles');
  return parseInt(result.rows[0].count);
}

async function getModels() {
  const query = `
    SELECT m.name AS manufacturer_name, cm.model_name, cm.id AS model_id 
    FROM car_models cm
    JOIN manufacturers m ON cm.manufacturer_id = m.id
  `;
  const result = await runQuery(query);
  
  // Create a map for faster lookups
  const modelMap = {};
  for (const row of result.rows) {
    const key = `${row.manufacturer_name}-${row.model_name}`;
    modelMap[key] = row.model_id;
  }
  
  return modelMap;
}

async function getDriveTypes() {
  const result = await runQuery('SELECT id, name FROM drive_types');
  
  const driveTypeMap = {};
  for (const row of result.rows) {
    driveTypeMap[row.name] = row.id;
  }
  
  return driveTypeMap;
}

async function getBatteryTypes() {
  const result = await runQuery('SELECT id, name FROM battery_types');
  
  const batteryTypeMap = {};
  for (const row of result.rows) {
    batteryTypeMap[row.name] = row.id;
  }
  
  return batteryTypeMap;
}

async function getRangeRatingSystems() {
  const result = await runQuery('SELECT id, name FROM range_rating_systems');
  
  const ratingSystemMap = {};
  for (const row of result.rows) {
    ratingSystemMap[row.name] = row.id;
  }
  
  return ratingSystemMap;
}

async function getExistingVehicles() {
  const query = `
    SELECT cm.id AS model_id, v.variant_name 
    FROM vehicles v
    JOIN car_models cm ON v.model_id = cm.id
  `;
  const result = await runQuery(query);
  
  // Create a set of existing vehicles
  const existingVehicles = new Set();
  for (const row of result.rows) {
    const key = `${row.model_id}-${row.variant_name}`;
    existingVehicles.add(key);
  }
  
  return existingVehicles;
}

async function importVehicles() {
  try {
    // Get initial count
    const initialCount = await getVehicleCount();
    console.log(`Initial vehicle count: ${initialCount}`);
    
    // Load CSV file
    const filePath = path.resolve('./attached_assets/vehicles_final.csv');
    const fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });
    
    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    console.log(`Found ${records.length} vehicles in CSV file.`);
    
    // Get all necessary reference data
    const modelMap = await getModels();
    const driveTypeMap = await getDriveTypes();
    const batteryTypeMap = await getBatteryTypes();
    const ratingSystemMap = await getRangeRatingSystems();
    const existingVehicles = await getExistingVehicles();
    
    // Process records in batches for insert
    const batchSize = 10;
    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, Math.min(i + batchSize, records.length));
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(records.length/batchSize)}`);
      
      for (const record of batch) {
        try {
          const uniqueModelKey = `${record['Manufacturer Name']}-${record['Model Name']}`;
          const modelId = modelMap[uniqueModelKey];
          
          if (!modelId) {
            console.error(`Model not found: ${uniqueModelKey}`);
            errorCount++;
            continue;
          }
          
          // Check if this combination of model_id and variant_name already exists
          const vehicleKey = `${modelId}-${record['Variant Name']}`;
          if (existingVehicles.has(vehicleKey)) {
            skippedCount++;
            continue;
          }
          
          const driveTypeId = driveTypeMap[record['Drive Type']];
          if (!driveTypeId) {
            console.error(`Drive type not found: ${record['Drive Type']}`);
            errorCount++;
            continue;
          }
          
          const batteryTypeId = batteryTypeMap[record['Battery Type']];
          if (!batteryTypeId) {
            console.error(`Battery type not found: ${record['Battery Type']}`);
            errorCount++;
            continue;
          }
          
          const rangeRatingId = record['Range Rating System'] ? ratingSystemMap[record['Range Rating System']] : null;
          
          // For price, convert from lakhs to actual value (1 lakh = 100,000)
          const price = record['price (in lakhs)'] ? parseFloat(record['price (in lakhs)']) * 100000 : null;
          
          // Check if v2l is supported
          const v2lSupport = record['v2l output kw AC'] && parseFloat(record['v2l output kw AC']) > 0;
          const v2lOutputPower = v2lSupport ? parseFloat(record['v2l output kw AC']) * 1000 : null; // Convert kW to W
          
          // Prepare the insert query
          const insertQuery = `
            INSERT INTO vehicles (
              model_id, variant_name, drive_type_id, battery_type_id, 
              battery_capacity, usable_battery_capacity, 
              battery_warranty_years, battery_warranty_km,
              official_range, range_rating_id, real_world_range, 
              efficiency, horsepower, torque, 
              acceleration, top_speed, 
              fast_charging_capacity, fast_charging_time, 
              weight, v2l_support, v2l_output_power, price
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
          `;
          
          const params = [
            modelId,
            record['Variant Name'],
            driveTypeId,
            batteryTypeId,
            record['Battery Capacity'] ? parseFloat(record['Battery Capacity']) : null,
            record['Useable Capacity'] ? parseFloat(record['Useable Capacity']) : null,
            record['Warranty Years'] ? parseInt(record['Warranty Years']) : null,
            record['Warranty Kms'] ? parseInt(record['Warranty Kms']) : null,
            record['Official Range'] ? parseFloat(record['Official Range']) : null,
            rangeRatingId,
            record['Real Range'] ? parseFloat(record['Real Range']) : null,
            record['Efficiency'] ? parseFloat(record['Efficiency']) : null,
            record['Horsepower'] ? parseFloat(record['Horsepower']) : null,
            record['Torque'] ? parseFloat(record['Torque']) : null,
            record['0-100'] ? parseFloat(record['0-100']) : null,
            record['Top speed'] ? parseFloat(record['Top speed']) : null,
            record['Fast Charging DC KW'] ? parseFloat(record['Fast Charging DC KW']) : null,
            record['10-80 time'] ? parseFloat(record['10-80 time']) : null,
            record['Weight'] ? parseFloat(record['Weight']) : null,
            v2lSupport,
            v2lOutputPower,
            price
          ];
          
          await runQuery(insertQuery, params);
          importedCount++;
          
          // Add to existing vehicles set to avoid duplicates
          existingVehicles.add(vehicleKey);
        } catch (error) {
          console.error(`Error importing vehicle: ${error.message}`);
          errorCount++;
        }
      }
      
      console.log(`Progress: Imported ${importedCount}, Skipped ${skippedCount}, Errors ${errorCount}`);
    }
    
    // Get final count
    const finalCount = await getVehicleCount();
    console.log(`
Import completed:
- Initial count: ${initialCount}
- Imported: ${importedCount}
- Skipped: ${skippedCount}
- Errors: ${errorCount}
- Final count: ${finalCount}
    `);
  } catch (error) {
    console.error('Error during import process:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the import
importVehicles();