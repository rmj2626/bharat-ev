import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from './shared/schema';
import { parse } from 'csv-parse/sync';
import fs from 'fs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const db = drizzle(pool, { schema });

async function runMigration() {
  console.log('Starting database migration and data import...');
  try {
    console.log('Creating schema...');
    await db.execute(fs.readFileSync('./create-db-schema.sql', 'utf8'));
    console.log('Schema created successfully.');

    console.log('Importing data from CSV files...');
    await importManufacturers();
    await importBodyStyles();
    await importDriveTypes();
    await importBatteryTypes();
    await importRangeRatingSystems();
    await importCarModels();
    await importVehicles();
    console.log('Data import completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

async function importManufacturers() {
  console.log('Importing manufacturers...');
  const manufacturersContent = fs.readFileSync('./attached_assets/manufacturers_final.csv', 'utf8');
  const manufacturers = parse(manufacturersContent, { columns: true, skip_empty_lines: true });
  
  for (const manufacturer of manufacturers) {
    try {
      const result = await db.insert(schema.manufacturers)
        .values({ 
          name: manufacturer.Manufacturer, 
          country: manufacturer.Country 
        })
        .returning();
      console.log(`Imported manufacturer: ${manufacturer.Manufacturer}`);
    } catch (error) {
      console.error(`Failed to import manufacturer ${manufacturer.Manufacturer}:`, error);
    }
  }
  console.log(`Manufacturers import completed.`);
}

async function importBodyStyles() {
  console.log('Importing body styles...');
  const modelsContent = fs.readFileSync('./attached_assets/models_final.csv', 'utf8');
  const models = parse(modelsContent, { columns: true, skip_empty_lines: true });
  
  const bodyStyleSet = new Set();
  models.forEach(model => bodyStyleSet.add(model['Body Style']));
  
  for (const style of bodyStyleSet) {
    try {
      const result = await db.insert(schema.bodyStyles)
        .values({ name: style })
        .returning();
      console.log(`Imported body style: ${style}`);
    } catch (error) {
      console.error(`Failed to import body style ${style}:`, error);
    }
  }
  console.log(`Body styles import completed.`);
}

async function importDriveTypes() {
  console.log('Importing drive types...');
  const vehiclesContent = fs.readFileSync('./attached_assets/vehicles_final.csv', 'utf8');
  const vehicles = parse(vehiclesContent, { columns: true, skip_empty_lines: true });
  
  const driveTypeSet = new Set();
  vehicles.forEach(vehicle => driveTypeSet.add(vehicle['Drive Type']));
  
  for (const type of driveTypeSet) {
    try {
      const result = await db.insert(schema.driveTypes)
        .values({ name: type })
        .returning();
      console.log(`Imported drive type: ${type}`);
    } catch (error) {
      console.error(`Failed to import drive type ${type}:`, error);
    }
  }
  console.log(`Drive types import completed.`);
}

async function importBatteryTypes() {
  console.log('Importing battery types...');
  const vehiclesContent = fs.readFileSync('./attached_assets/vehicles_final.csv', 'utf8');
  const vehicles = parse(vehiclesContent, { columns: true, skip_empty_lines: true });
  
  const batteryTypeSet = new Set();
  vehicles.forEach(vehicle => batteryTypeSet.add(vehicle['Battery Type']));
  
  for (const type of batteryTypeSet) {
    try {
      const result = await db.insert(schema.batteryTypes)
        .values({ name: type })
        .returning();
      console.log(`Imported battery type: ${type}`);
    } catch (error) {
      console.error(`Failed to import battery type ${type}:`, error);
    }
  }
  console.log(`Battery types import completed.`);
}

async function importRangeRatingSystems() {
  console.log('Importing range rating systems...');
  const vehiclesContent = fs.readFileSync('./attached_assets/vehicles_final.csv', 'utf8');
  const vehicles = parse(vehiclesContent, { columns: true, skip_empty_lines: true });
  
  const ratingSystemSet = new Set();
  vehicles.forEach(vehicle => {
    if (vehicle['Range Rating System']) {
      ratingSystemSet.add(vehicle['Range Rating System']);
    }
  });
  
  for (const system of ratingSystemSet) {
    try {
      const result = await db.insert(schema.rangeRatingSystems)
        .values({ name: system })
        .returning();
      console.log(`Imported range rating system: ${system}`);
    } catch (error) {
      console.error(`Failed to import range rating system ${system}:`, error);
    }
  }
  console.log(`Range rating systems import completed.`);
}

async function importCarModels() {
  console.log('Importing car models...');
  const modelsContent = fs.readFileSync('./attached_assets/models_final.csv', 'utf8');
  const models = parse(modelsContent, { columns: true, skip_empty_lines: true });

  // Get all manufacturers
  const manufacturersResult = await db.select().from(schema.manufacturers);
  const manufacturerMap = {};
  manufacturersResult.forEach(m => manufacturerMap[m.name] = m.id);

  // Get all body styles
  const bodyStylesResult = await db.select().from(schema.bodyStyles);
  const bodyStyleMap = {};
  bodyStylesResult.forEach(b => bodyStyleMap[b.name] = b.id);

  for (const model of models) {
    try {
      const manufacturerId = manufacturerMap[model.Manufacturer];
      const bodyStyleId = bodyStyleMap[model['Body Style']];
      
      if (!manufacturerId || !bodyStyleId) {
        console.error(`Skipping model ${model['Model Name']} due to missing manufacturer or body style`);
        continue;
      }
      
      // Handle optional values
      const bootSpace = model['Boot Space Ltrs'] ? parseInt(model['Boot Space Ltrs']) : null;
      const startYear = parseInt(model['Start Year']);
      const endYear = model['End Year'] ? parseInt(model['End Year']) : null;
      
      const result = await db.insert(schema.carModels)
        .values({
          modelName: model['Model Name'],
          manufacturerId: manufacturerId,
          bodyStyleId: bodyStyleId,
          image: model['Image Link'],
          bootSpace: bootSpace,
          chargingPortLocationId: null, // As per your instructions
          manufacturingStartYear: startYear,
          manufacturingEndYear: endYear,
          viewCount: 0
        })
        .returning();
      console.log(`Imported car model: ${model['Model Name']}`);
    } catch (error) {
      console.error(`Failed to import car model ${model['Model Name']}:`, error);
    }
  }
  console.log(`Car models import completed.`);
}

async function importVehicles() {
  console.log('Importing vehicles...');
  const vehiclesContent = fs.readFileSync('./attached_assets/vehicles_final.csv', 'utf8');
  const vehicles = parse(vehiclesContent, { columns: true, skip_empty_lines: true });

  // Get all car models
  const carModelsResult = await db.select().from(schema.carModels);
  const carModelMap = {};
  const manufacturersResult = await db.select().from(schema.manufacturers);
  const manufacturerMap = {};
  manufacturersResult.forEach(m => manufacturerMap[m.id] = m.name);
  
  carModelsResult.forEach(model => {
    const manufacturerName = manufacturerMap[model.manufacturerId];
    const key = `${manufacturerName}-${model.modelName}`;
    carModelMap[key] = model.id;
  });

  // Get all drive types
  const driveTypesResult = await db.select().from(schema.driveTypes);
  const driveTypeMap = {};
  driveTypesResult.forEach(dt => driveTypeMap[dt.name] = dt.id);

  // Get all battery types
  const batteryTypesResult = await db.select().from(schema.batteryTypes);
  const batteryTypeMap = {};
  batteryTypesResult.forEach(bt => batteryTypeMap[bt.name] = bt.id);

  // Get all range rating systems
  const rangeRatingSystemsResult = await db.select().from(schema.rangeRatingSystems);
  const rangeRatingSystemMap = {};
  rangeRatingSystemsResult.forEach(rrs => rangeRatingSystemMap[rrs.name] = rrs.id);

  let importedCount = 0;
  for (const vehicle of vehicles) {
    try {
      const uniqueModelKey = `${vehicle['Manufacturer Name']}-${vehicle['Model Name']}`;
      const modelId = carModelMap[uniqueModelKey];
      const driveTypeId = driveTypeMap[vehicle['Drive Type']];
      const batteryTypeId = batteryTypeMap[vehicle['Battery Type']];
      
      if (!modelId || !driveTypeId || !batteryTypeId) {
        console.error(`Skipping vehicle ${vehicle['Model Name']} - ${vehicle['Variant Name']} due to missing references`);
        continue;
      }
      
      const rangeRatingId = vehicle['Range Rating System'] 
        ? rangeRatingSystemMap[vehicle['Range Rating System']] 
        : null;
      
      // For price, convert from lakhs to actual value
      const price = vehicle['price (in lakhs)'] 
        ? parseFloat(vehicle['price (in lakhs)']) * 100000 
        : null;
      
      // As per your instructions, if v2l output kw is 0, the car does not support v2l
      const v2lSupport = vehicle['v2l output kw AC'] && parseFloat(vehicle['v2l output kw AC']) > 0;
      const v2lOutputPower = v2lSupport ? parseFloat(vehicle['v2l output kw AC']) * 1000 : null; // Convert kW to W

      await db.insert(schema.vehicles)
        .values({
          modelId: modelId,
          variantName: vehicle['Variant Name'],
          driveTypeId: driveTypeId,
          batteryTypeId: batteryTypeId,
          batteryCapacity: vehicle['Battery Capacity'] ? parseFloat(vehicle['Battery Capacity']) : null,
          usableBatteryCapacity: vehicle['Useable Capacity'] ? parseFloat(vehicle['Useable Capacity']) : null,
          batteryWarrantyYears: vehicle['Warranty Years'] ? parseInt(vehicle['Warranty Years']) : null,
          batteryWarrantyKm: vehicle['Warranty Kms'] ? parseInt(vehicle['Warranty Kms']) : null,
          officialRange: vehicle['Official Range'] ? parseFloat(vehicle['Official Range']) : null,
          rangeRatingId: rangeRatingId,
          realWorldRange: vehicle['Real Range'] ? parseFloat(vehicle['Real Range']) : null,
          efficiency: vehicle['Efficiency'] ? parseFloat(vehicle['Efficiency']) : null,
          horsepower: vehicle['Horsepower'] ? parseFloat(vehicle['Horsepower']) : null,
          torque: vehicle['Torque'] ? parseFloat(vehicle['Torque']) : null,
          acceleration: vehicle['0-100'] ? parseFloat(vehicle['0-100']) : null,
          topSpeed: vehicle['Top speed'] ? parseFloat(vehicle['Top speed']) : null,
          fastChargingCapacity: vehicle['Fast Charging DC KW'] ? parseFloat(vehicle['Fast Charging DC KW']) : null,
          fastChargingTime: vehicle['10-80 time'] ? parseFloat(vehicle['10-80 time']) : null,
          weight: vehicle['Weight'] ? parseFloat(vehicle['Weight']) : null,
          v2lSupport: v2lSupport,
          v2lOutputPower: v2lOutputPower,
          price: price
        });
      console.log(`Imported vehicle: ${vehicle['Model Name']} - ${vehicle['Variant Name']}`);
      importedCount++;
    } catch (error) {
      console.error(`Failed to import vehicle ${vehicle['Model Name']} - ${vehicle['Variant Name']}:`, error);
    }
  }
  console.log(`Vehicles import completed. Imported ${importedCount} vehicles.`);
}

// Add a default user for admin access
async function addDefaultUser() {
  console.log('Adding default admin user...');
  try {
    const result = await db.insert(schema.users)
      .values({
        username: 'admin',
        password: '$2b$10$zJlA5aEjC3.cxGNDg7/1q.B0C3ZrOzjTjVuIKsI7e1pafVHT4n9Ji'
      })
      .returning();
    console.log('Default admin user added successfully.');
  } catch (error) {
    console.error('Failed to add default admin user:', error);
  }
}

runMigration();