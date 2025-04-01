import fs from 'fs';
import { parse } from 'csv-parse/sync';
import path from 'path';
import { db } from './server/db';
import { 
  manufacturers, 
  bodyStyles,
  driveTypes,
  batteryTypes,
  chargingPortLocations,
  rangeRatingSystems,
  carModels,
  vehicles
} from './shared/schema';
import { eq } from 'drizzle-orm';

// Clear existing data from all tables
async function clearAllTables() {
  console.log('Clearing all tables...');
  await db.delete(vehicles);
  await db.delete(carModels);
  await db.delete(manufacturers);
  await db.delete(bodyStyles);
  await db.delete(driveTypes);
  await db.delete(batteryTypes);
  await db.delete(chargingPortLocations);
  await db.delete(rangeRatingSystems);
  console.log('All tables cleared.');
}

// Import manufacturers from CSV
async function importManufacturers() {
  console.log('Importing manufacturers...');
  const filePath = path.resolve('./attached_assets/manufacturers_final.csv');
  const fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  });
  
  const manufacturerMap = new Map<string, number>();
  
  for (const record of records) {
    const result = await db.insert(manufacturers).values({
      name: record.Manufacturer,
      country: record.Country
    }).returning();
    
    const manufacturerId = result[0].id;
    manufacturerMap.set(record.Manufacturer, manufacturerId);
  }
  
  console.log(`Imported ${manufacturerMap.size} manufacturers.`);
  return manufacturerMap;
}

// Import body styles from models CSV
async function importBodyStyles() {
  console.log('Importing body styles...');
  const filePath = path.resolve('./attached_assets/models_final.csv');
  const fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  });
  
  const bodyStyleSet = new Set<string>();
  records.forEach(record => bodyStyleSet.add(record['Body Style']));
  
  const bodyStyleMap = new Map<string, number>();
  
  for (const style of bodyStyleSet) {
    const result = await db.insert(bodyStyles).values({
      name: style
    }).returning();
    
    const bodyStyleId = result[0].id;
    bodyStyleMap.set(style, bodyStyleId);
  }
  
  console.log(`Imported ${bodyStyleMap.size} body styles.`);
  return bodyStyleMap;
}

// Import drive types from vehicles CSV
async function importDriveTypes() {
  console.log('Importing drive types...');
  const filePath = path.resolve('./attached_assets/vehicles_final.csv');
  const fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  });
  
  const driveTypeSet = new Set<string>();
  records.forEach(record => driveTypeSet.add(record['Drive Type']));
  
  const driveTypeMap = new Map<string, number>();
  
  for (const type of driveTypeSet) {
    const result = await db.insert(driveTypes).values({
      name: type
    }).returning();
    
    const driveTypeId = result[0].id;
    driveTypeMap.set(type, driveTypeId);
  }
  
  console.log(`Imported ${driveTypeMap.size} drive types.`);
  return driveTypeMap;
}

// Import battery types from vehicles CSV
async function importBatteryTypes() {
  console.log('Importing battery types...');
  const filePath = path.resolve('./attached_assets/vehicles_final.csv');
  const fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  });
  
  const batteryTypeSet = new Set<string>();
  records.forEach(record => batteryTypeSet.add(record['Battery Type']));
  
  const batteryTypeMap = new Map<string, number>();
  
  for (const type of batteryTypeSet) {
    const result = await db.insert(batteryTypes).values({
      name: type
    }).returning();
    
    const batteryTypeId = result[0].id;
    batteryTypeMap.set(type, batteryTypeId);
  }
  
  console.log(`Imported ${batteryTypeMap.size} battery types.`);
  return batteryTypeMap;
}

// Import range rating systems from vehicles CSV
async function importRangeRatingSystems() {
  console.log('Importing range rating systems...');
  const filePath = path.resolve('./attached_assets/vehicles_final.csv');
  const fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  });
  
  const ratingSystemSet = new Set<string>();
  records.forEach(record => {
    if (record['Range Rating System']) {
      ratingSystemSet.add(record['Range Rating System']);
    }
  });
  
  const ratingSystemMap = new Map<string, number>();
  
  for (const system of ratingSystemSet) {
    const result = await db.insert(rangeRatingSystems).values({
      name: system
    }).returning();
    
    const ratingSystemId = result[0].id;
    ratingSystemMap.set(system, ratingSystemId);
  }
  
  console.log(`Imported ${ratingSystemMap.size} range rating systems.`);
  return ratingSystemMap;
}

// Import car models
async function importCarModels(
  manufacturerMap: Map<string, number>,
  bodyStyleMap: Map<string, number>
) {
  console.log('Importing car models...');
  const filePath = path.resolve('./attached_assets/models_final.csv');
  const fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  });
  
  const modelMap = new Map<string, number>();
  
  for (const record of records) {
    const manufacturerId = manufacturerMap.get(record.Manufacturer);
    const bodyStyleId = bodyStyleMap.get(record['Body Style']);
    
    if (!manufacturerId || !bodyStyleId) {
      console.error(`Skipping model ${record['Model Name']} due to missing manufacturer or body style`);
      continue;
    }
    
    // Handle optional charging port location
    // Since you mentioned it's absent in the CSV, we'll set it to null
    
    const startYear = parseInt(record['Start Year']);
    const endYear = record['End Year'] ? parseInt(record['End Year']) : null;
    
    const uniqueModelKey = `${record.Manufacturer}-${record['Model Name']}`;
    
    const result = await db.insert(carModels).values({
      modelName: record['Model Name'],
      manufacturerId,
      bodyStyleId,
      bootSpace: record['Boot Space Ltrs'] ? parseInt(record['Boot Space Ltrs']) : null,
      chargingPortLocationId: null, // As per your instructions, this is optional and absent
      image: record['Image Link'] || null,
      manufacturingStartYear: startYear,
      manufacturingEndYear: endYear,
      viewCount: 0 // Initialize view count to 0
    }).returning();
    
    const modelId = result[0].id;
    modelMap.set(uniqueModelKey, modelId);
  }
  
  console.log(`Imported ${modelMap.size} car models.`);
  return modelMap;
}

// Import vehicles
async function importVehicles(
  modelMap: Map<string, number>,
  driveTypeMap: Map<string, number>,
  batteryTypeMap: Map<string, number>,
  ratingSystemMap: Map<string, number>
) {
  console.log('Importing vehicles...');
  const filePath = path.resolve('./attached_assets/vehicles_final.csv');
  const fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  });
  
  let importedCount = 0;
  
  for (const record of records) {
    const uniqueModelKey = `${record['Manufacturer Name']}-${record['Model Name']}`;
    const modelId = modelMap.get(uniqueModelKey);
    const driveTypeId = driveTypeMap.get(record['Drive Type']);
    const batteryTypeId = batteryTypeMap.get(record['Battery Type']);
    
    if (!modelId || !driveTypeId || !batteryTypeId) {
      console.error(`Skipping vehicle ${record['Model Name']} - ${record['Variant Name']} due to missing references`);
      continue;
    }
    
    const rangeRatingId = record['Range Rating System'] 
      ? ratingSystemMap.get(record['Range Rating System']) 
      : null;
    
    // For price, convert from lakhs to actual value
    const price = record['price (in lakhs)'] 
      ? parseFloat(record['price (in lakhs)']) * 100000 
      : null;
    
    // As per your instructions, if v2l output kw is 0, the car does not support v2l
    const v2lSupport = record['v2l output kw AC'] && parseFloat(record['v2l output kw AC']) > 0;
    const v2lOutputPower = v2lSupport ? parseFloat(record['v2l output kw AC']) * 1000 : null; // Convert kW to W
    
    await db.insert(vehicles).values({
      modelId,
      variantName: record['Variant Name'],
      driveTypeId,
      batteryTypeId,
      batteryCapacity: record['Battery Capacity'] ? parseFloat(record['Battery Capacity']) : null,
      usableBatteryCapacity: record['Useable Capacity'] ? parseFloat(record['Useable Capacity']) : null,
      batteryWarrantyYears: record['Warranty Years'] ? parseInt(record['Warranty Years']) : null,
      batteryWarrantyKm: record['Warranty Kms'] ? parseInt(record['Warranty Kms']) : null,
      officialRange: record['Official Range'] ? parseFloat(record['Official Range']) : null,
      rangeRatingId,
      realWorldRange: record['Real Range'] ? parseFloat(record['Real Range']) : null,
      efficiency: record['Efficiency'] ? parseFloat(record['Efficiency']) : null,
      horsepower: record['Horsepower'] ? parseFloat(record['Horsepower']) : null,
      torque: record['Torque'] ? parseFloat(record['Torque']) : null,
      acceleration: record['0-100'] ? parseFloat(record['0-100']) : null,
      topSpeed: record['Top speed'] ? parseFloat(record['Top speed']) : null,
      fastChargingCapacity: record['Fast Charging DC KW'] ? parseFloat(record['Fast Charging DC KW']) : null,
      fastChargingTime: record['10-80 time'] ? parseFloat(record['10-80 time']) : null,
      weight: record['Weight'] ? parseFloat(record['Weight']) : null,
      v2lSupport,
      v2lOutputPower,
      price
    });
    
    importedCount++;
  }
  
  console.log(`Imported ${importedCount} vehicles.`);
}

async function main() {
  try {
    console.log('Starting database import process...');
    
    // First clear all existing data
    await clearAllTables();
    
    // Import reference data
    const manufacturerMap = await importManufacturers();
    const bodyStyleMap = await importBodyStyles();
    const driveTypeMap = await importDriveTypes();
    const batteryTypeMap = await importBatteryTypes();
    const ratingSystemMap = await importRangeRatingSystems();
    
    // Import car models (depends on manufacturers and body styles)
    const modelMap = await importCarModels(manufacturerMap, bodyStyleMap);
    
    // Import vehicles (depends on everything else)
    await importVehicles(modelMap, driveTypeMap, batteryTypeMap, ratingSystemMap);
    
    console.log('Database import completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during import:', error);
    process.exit(1);
  }
}

main();