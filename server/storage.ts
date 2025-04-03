import { 
  users, 
  manufacturers, 
  bodyStyles, 
  driveTypes, 
  batteryTypes, 
  chargingPortLocations, 
  rangeRatingSystems,
  carModels,
  vehicles,
  type User, 
  type InsertUser,
  type Manufacturer,
  type InsertManufacturer,
  type BodyStyle,
  type InsertBodyStyle,
  type DriveType,
  type InsertDriveType,
  type BatteryType,
  type InsertBatteryType,
  type ChargingPortLocation,
  type InsertChargingPortLocation,
  type RangeRatingSystem,
  type InsertRangeRatingSystem,
  type CarModel,
  type InsertCarModel,
  type Vehicle,
  type InsertVehicle
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, between, like, gte, lte, inArray, sql, desc, asc } from "drizzle-orm";
import { PaginatedResult, VehicleFilter, VehicleWithDetails } from "@shared/types";

// Function to ensure db is not null when used
function ensureDb() {
  if (!db) {
    throw new Error("Database is not initialized");
  }
  return db;
}

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Manufacturer operations
  getManufacturers(): Promise<Manufacturer[]>;
  getManufacturer(id: number): Promise<Manufacturer | undefined>;
  createManufacturer(manufacturer: InsertManufacturer): Promise<Manufacturer>;
  deleteManufacturer(id: number): Promise<void>;

  // Body style operations
  getBodyStyles(): Promise<BodyStyle[]>;
  getBodyStyle(id: number): Promise<BodyStyle | undefined>;
  createBodyStyle(bodyStyle: InsertBodyStyle): Promise<BodyStyle>;

  // Drive type operations
  getDriveTypes(): Promise<DriveType[]>;
  getDriveType(id: number): Promise<DriveType | undefined>;
  createDriveType(driveType: InsertDriveType): Promise<DriveType>;

  // Battery type operations
  getBatteryTypes(): Promise<BatteryType[]>;
  getBatteryType(id: number): Promise<BatteryType | undefined>;
  createBatteryType(batteryType: InsertBatteryType): Promise<BatteryType>;

  // Charging port location operations
  getChargingPortLocations(): Promise<ChargingPortLocation[]>;
  getChargingPortLocation(id: number): Promise<ChargingPortLocation | undefined>;
  createChargingPortLocation(location: InsertChargingPortLocation): Promise<ChargingPortLocation>;

  // Range rating system operations
  getRangeRatingSystems(): Promise<RangeRatingSystem[]>;
  getRangeRatingSystem(id: number): Promise<RangeRatingSystem | undefined>;
  createRangeRatingSystem(system: InsertRangeRatingSystem): Promise<RangeRatingSystem>;

  // Car model operations
  getCarModels(): Promise<CarModel[]>;
  getCarModel(id: number): Promise<CarModel | undefined>;
  createCarModel(carModel: InsertCarModel): Promise<CarModel>;
  incrementViewCount(id: number): Promise<void>;
  deleteCarModel(id: number): Promise<void>;

  // Vehicle operations
  getVehicles(): Promise<Vehicle[]>;
  getVehicle(id: number): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  deleteVehicle(id: number): Promise<void>;
  
  // Complex queries
  getVehicleWithDetails(id: number): Promise<VehicleWithDetails | undefined>;
  filterVehicles(filter: VehicleFilter): Promise<PaginatedResult<VehicleWithDetails>>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const safeDb = ensureDb();
    const [user] = await safeDb.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const safeDb = ensureDb();
    const [user] = await safeDb.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const safeDb = ensureDb();
    const [user] = await safeDb
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Manufacturer operations
  async getManufacturers(): Promise<Manufacturer[]> {
    const safeDb = ensureDb();
    return safeDb.select().from(manufacturers);
  }

  async getManufacturer(id: number): Promise<Manufacturer | undefined> {
    const safeDb = ensureDb();
    const [manufacturer] = await safeDb.select().from(manufacturers).where(eq(manufacturers.id, id));
    return manufacturer;
  }

  async createManufacturer(insertManufacturer: InsertManufacturer): Promise<Manufacturer> {
    const safeDb = ensureDb();
    const [manufacturer] = await safeDb
      .insert(manufacturers)
      .values(insertManufacturer)
      .returning();
    return manufacturer;
  }

  async deleteManufacturer(id: number): Promise<void> {
    const safeDb = ensureDb();
    await safeDb.delete(manufacturers).where(eq(manufacturers.id, id));
  }

  // Body style operations
  async getBodyStyles(): Promise<BodyStyle[]> {
    const safeDb = ensureDb();
    return safeDb.select().from(bodyStyles);
  }

  async getBodyStyle(id: number): Promise<BodyStyle | undefined> {
    const safeDb = ensureDb();
    const [bodyStyle] = await safeDb.select().from(bodyStyles).where(eq(bodyStyles.id, id));
    return bodyStyle;
  }

  async createBodyStyle(insertBodyStyle: InsertBodyStyle): Promise<BodyStyle> {
    const safeDb = ensureDb();
    const [bodyStyle] = await safeDb
      .insert(bodyStyles)
      .values(insertBodyStyle)
      .returning();
    return bodyStyle;
  }

  // Drive type operations
  async getDriveTypes(): Promise<DriveType[]> {
    const safeDb = ensureDb();
    return safeDb.select().from(driveTypes);
  }

  async getDriveType(id: number): Promise<DriveType | undefined> {
    const safeDb = ensureDb();
    const [driveType] = await safeDb.select().from(driveTypes).where(eq(driveTypes.id, id));
    return driveType;
  }

  async createDriveType(insertDriveType: InsertDriveType): Promise<DriveType> {
    const safeDb = ensureDb();
    const [driveType] = await safeDb
      .insert(driveTypes)
      .values(insertDriveType)
      .returning();
    return driveType;
  }

  // Battery type operations
  async getBatteryTypes(): Promise<BatteryType[]> {
    const safeDb = ensureDb();
    return safeDb.select().from(batteryTypes);
  }

  async getBatteryType(id: number): Promise<BatteryType | undefined> {
    const safeDb = ensureDb();
    const [batteryType] = await safeDb.select().from(batteryTypes).where(eq(batteryTypes.id, id));
    return batteryType;
  }

  async createBatteryType(insertBatteryType: InsertBatteryType): Promise<BatteryType> {
    const safeDb = ensureDb();
    const [batteryType] = await safeDb
      .insert(batteryTypes)
      .values(insertBatteryType)
      .returning();
    return batteryType;
  }

  // Charging port location operations
  async getChargingPortLocations(): Promise<ChargingPortLocation[]> {
    const safeDb = ensureDb();
    return safeDb.select().from(chargingPortLocations);
  }

  async getChargingPortLocation(id: number): Promise<ChargingPortLocation | undefined> {
    const safeDb = ensureDb();
    const [location] = await safeDb.select().from(chargingPortLocations).where(eq(chargingPortLocations.id, id));
    return location;
  }

  async createChargingPortLocation(insertLocation: InsertChargingPortLocation): Promise<ChargingPortLocation> {
    const safeDb = ensureDb();
    const [location] = await safeDb
      .insert(chargingPortLocations)
      .values(insertLocation)
      .returning();
    return location;
  }

  // Range rating system operations
  async getRangeRatingSystems(): Promise<RangeRatingSystem[]> {
    const safeDb = ensureDb();
    return safeDb.select().from(rangeRatingSystems);
  }

  async getRangeRatingSystem(id: number): Promise<RangeRatingSystem | undefined> {
    const safeDb = ensureDb();
    const [system] = await safeDb.select().from(rangeRatingSystems).where(eq(rangeRatingSystems.id, id));
    return system;
  }

  async createRangeRatingSystem(insertSystem: InsertRangeRatingSystem): Promise<RangeRatingSystem> {
    const safeDb = ensureDb();
    const [system] = await safeDb
      .insert(rangeRatingSystems)
      .values(insertSystem)
      .returning();
    return system;
  }

  // Car model operations
  async getCarModels(): Promise<CarModel[]> {
    const safeDb = ensureDb();
    return safeDb.select().from(carModels);
  }

  async getCarModel(id: number): Promise<CarModel | undefined> {
    const safeDb = ensureDb();
    const [model] = await safeDb.select().from(carModels).where(eq(carModels.id, id));
    return model;
  }

  async createCarModel(insertCarModel: InsertCarModel): Promise<CarModel> {
    const safeDb = ensureDb();
    const [model] = await safeDb
      .insert(carModels)
      .values(insertCarModel)
      .returning();
    return model;
  }

  async incrementViewCount(id: number): Promise<void> {
    const safeDb = ensureDb();
    await safeDb
      .update(carModels)
      .set({ viewCount: sql`${carModels.viewCount} + 1` })
      .where(eq(carModels.id, id));
  }

  async deleteCarModel(id: number): Promise<void> {
    const safeDb = ensureDb();
    await safeDb.delete(carModels).where(eq(carModels.id, id));
  }

  // Vehicle operations
  async getVehicles(): Promise<Vehicle[]> {
    const safeDb = ensureDb();
    return safeDb.select().from(vehicles);
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const safeDb = ensureDb();
    const [vehicle] = await safeDb.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle;
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const safeDb = ensureDb();
    const [vehicle] = await safeDb
      .insert(vehicles)
      .values(insertVehicle)
      .returning();
    return vehicle;
  }

  async deleteVehicle(id: number): Promise<void> {
    const safeDb = ensureDb();
    await safeDb.delete(vehicles).where(eq(vehicles.id, id));
  }

  // Complex queries
  async getVehicleWithDetails(id: number): Promise<VehicleWithDetails | undefined> {
    const safeDb = ensureDb();
    const result = await safeDb.execute<Record<string, unknown>>(sql`
      SELECT 
        v.id,
        v.model_id as "modelId",
        v.variant_name as "variantName",
        v.drive_type_id as "driveTypeId",
        v.battery_type_id as "batteryTypeId",
        v.battery_capacity as "batteryCapacity",
        v.usable_battery_capacity as "usableBatteryCapacity",
        v.battery_warranty_years as "batteryWarrantyYears",
        v.battery_warranty_km as "batteryWarrantyKm",
        v.official_range as "officialRange",
        v.range_rating_id as "rangeRatingId",
        v.real_world_range as "realWorldRange",
        v.efficiency as "efficiency",
        v.horsepower as "horsepower",
        v.torque as "torque",
        v.acceleration as "acceleration",
        v.top_speed as "topSpeed",
        v.fast_charging_capacity as "fastChargingCapacity",
        v.fast_charging_time as "fastChargingTime",
        v.weight as "weight",
        v.v2l_support as "v2lSupport",
        v.v2l_output_power as "v2lOutputPower",
        v.price as "price",
        m.id as "manufacturerId",
        m.name as "manufacturerName",
        cm.model_name as "modelName",
        cm.body_style_id as "bodyStyleId",
        bs.name as "bodyStyleName",
        cm.boot_space as "bootSpace",
        cm.image,
        cm.manufacturing_start_year as "manufacturingStartYear",
        cm.manufacturing_end_year as "manufacturingEndYear",
        dt.name as "driveTypeName",
        bt.name as "batteryTypeName",
        cpl.location as "chargingPortLocation",
        rrs.name as "rangeRatingSystem"
      FROM 
        vehicles v
      JOIN 
        car_models cm ON v.model_id = cm.id
      JOIN 
        manufacturers m ON cm.manufacturer_id = m.id
      JOIN 
        body_styles bs ON cm.body_style_id = bs.id
      LEFT JOIN 
        drive_types dt ON v.drive_type_id = dt.id
      LEFT JOIN 
        battery_types bt ON v.battery_type_id = bt.id
      LEFT JOIN 
        charging_port_locations cpl ON cm.charging_port_location_id = cpl.id
      LEFT JOIN 
        range_rating_systems rrs ON v.range_rating_id = rrs.id
      WHERE 
        v.id = ${id}
    `);

    const rows = result.rows;
    
    if (!rows || rows.length === 0) {
      return undefined;
    }

    // Safely cast the row to VehicleWithDetails
    const vehicle = rows[0] as unknown as VehicleWithDetails;

    // Increment view count for the model
    await this.incrementViewCount(vehicle.modelId);

    return vehicle;
  }

  async filterVehicles(filter: VehicleFilter): Promise<PaginatedResult<VehicleWithDetails>> {
    const safeDb = ensureDb();
    
    // Start building the query
    let query = sql`
      SELECT 
        v.id,
        v.model_id as "modelId",
        v.variant_name as "variantName",
        v.drive_type_id as "driveTypeId",
        v.battery_type_id as "batteryTypeId",
        v.battery_capacity as "batteryCapacity",
        v.usable_battery_capacity as "usableBatteryCapacity",
        v.battery_warranty_years as "batteryWarrantyYears",
        v.battery_warranty_km as "batteryWarrantyKm",
        v.official_range as "officialRange",
        v.range_rating_id as "rangeRatingId",
        v.real_world_range as "realWorldRange",
        v.efficiency as "efficiency",
        v.horsepower as "horsepower",
        v.torque as "torque",
        v.acceleration as "acceleration",
        v.top_speed as "topSpeed",
        v.fast_charging_capacity as "fastChargingCapacity",
        v.fast_charging_time as "fastChargingTime",
        v.weight as "weight",
        v.v2l_support as "v2lSupport",
        v.v2l_output_power as "v2lOutputPower",
        v.price as "price",
        m.id as "manufacturerId",
        m.name as "manufacturerName",
        cm.model_name as "modelName",
        cm.body_style_id as "bodyStyleId",
        bs.name as "bodyStyleName",
        cm.boot_space as "bootSpace",
        cm.image,
        cm.manufacturing_start_year as "manufacturingStartYear",
        cm.manufacturing_end_year as "manufacturingEndYear",
        dt.name as "driveTypeName",
        bt.name as "batteryTypeName",
        cpl.location as "chargingPortLocation",
        rrs.name as "rangeRatingSystem"
      FROM 
        vehicles v
      JOIN 
        car_models cm ON v.model_id = cm.id
      JOIN 
        manufacturers m ON cm.manufacturer_id = m.id
      JOIN 
        body_styles bs ON cm.body_style_id = bs.id
      LEFT JOIN 
        drive_types dt ON v.drive_type_id = dt.id
      LEFT JOIN 
        battery_types bt ON v.battery_type_id = bt.id
      LEFT JOIN 
        charging_port_locations cpl ON cm.charging_port_location_id = cpl.id
      LEFT JOIN 
        range_rating_systems rrs ON v.range_rating_id = rrs.id
      WHERE 1=1
    `;

    // Add WHERE conditions based on filter parameters
    let conditions = sql``;
    
    // Manufacturer filtering
    if (filter.manufacturerId !== undefined) {
      conditions = sql`${conditions} AND m.id = ${filter.manufacturerId}`;
    } else if (filter.manufacturerIds && filter.manufacturerIds.length > 0) {
      // Use OR conditions for each ID instead of IN clause
      const manufacturerConditions = filter.manufacturerIds.map(id => 
        sql`m.id = ${Number(id)}`
      );
      conditions = sql`${conditions} AND (${sql.join(manufacturerConditions, sql` OR `)})`;
    }
    
    // Body style filtering
    if (filter.bodyStyleId !== undefined) {
      conditions = sql`${conditions} AND bs.id = ${filter.bodyStyleId}`;
    } else if (filter.bodyStyleIds && filter.bodyStyleIds.length > 0) {
      // Use OR conditions for each ID instead of IN clause
      const bodyStyleConditions = filter.bodyStyleIds.map(id => 
        sql`bs.id = ${Number(id)}`
      );
      conditions = sql`${conditions} AND (${sql.join(bodyStyleConditions, sql` OR `)})`;
    }
    
    // Drive type filtering
    if (filter.driveTypeIds && filter.driveTypeIds.length > 0) {
      // Use OR conditions for each ID instead of IN clause
      const driveTypeConditions = filter.driveTypeIds.map(id => 
        sql`dt.id = ${Number(id)}`
      );
      conditions = sql`${conditions} AND (${sql.join(driveTypeConditions, sql` OR `)})`;
    }
    
    // Battery type filtering
    if (filter.batteryTypeIds && filter.batteryTypeIds.length > 0) {
      // Use OR conditions for each ID instead of IN clause
      const batteryTypeConditions = filter.batteryTypeIds.map(id => 
        sql`bt.id = ${Number(id)}`
      );
      conditions = sql`${conditions} AND (${sql.join(batteryTypeConditions, sql` OR `)})`;
    }
    
    // Price range filtering - values from routes.ts are already in rupees
    if (filter.minPrice !== undefined) {
      // Filter value is already converted to rupees in routes.ts
      conditions = sql`${conditions} AND v.price >= ${filter.minPrice}`;
    }
    // If maxPrice is undefined, we don't apply upper limit
    if (filter.maxPrice !== undefined) {
      // Filter value is already converted to rupees in routes.ts
      conditions = sql`${conditions} AND v.price <= ${filter.maxPrice}`;
    }
    
    // Range filtering
    if (filter.minRange !== undefined) {
      conditions = sql`${conditions} AND v.real_world_range >= ${filter.minRange}`;
    }
    if (filter.maxRange !== undefined) {
      conditions = sql`${conditions} AND v.real_world_range <= ${filter.maxRange}`;
    }
    
    // Performance filtering
    if (filter.minAcceleration !== undefined) {
      conditions = sql`${conditions} AND v.acceleration >= ${filter.minAcceleration}`;
    }
    if (filter.maxAcceleration !== undefined) {
      conditions = sql`${conditions} AND v.acceleration <= ${filter.maxAcceleration}`;
    }
    if (filter.minHorsepower !== undefined) {
      conditions = sql`${conditions} AND v.horsepower >= ${filter.minHorsepower}`;
    }
    if (filter.maxHorsepower !== undefined) {
      conditions = sql`${conditions} AND v.horsepower <= ${filter.maxHorsepower}`;
    }
    if (filter.minTorque !== undefined) {
      conditions = sql`${conditions} AND v.torque >= ${filter.minTorque}`;
    }
    if (filter.maxTorque !== undefined) {
      conditions = sql`${conditions} AND v.torque <= ${filter.maxTorque}`;
    }
    
    // Charging filtering
    if (filter.minFastCharging !== undefined) {
      conditions = sql`${conditions} AND v.fast_charging_capacity >= ${filter.minFastCharging}`;
    }
    if (filter.maxFastCharging !== undefined) {
      conditions = sql`${conditions} AND v.fast_charging_capacity <= ${filter.maxFastCharging}`;
    }
    
    // Battery filtering
    if (filter.minBatteryCapacity !== undefined) {
      conditions = sql`${conditions} AND v.battery_capacity >= ${filter.minBatteryCapacity}`;
    }
    if (filter.maxBatteryCapacity !== undefined) {
      conditions = sql`${conditions} AND v.battery_capacity <= ${filter.maxBatteryCapacity}`;
    }
    
    // Weight filtering
    if (filter.minWeight !== undefined) {
      conditions = sql`${conditions} AND v.weight >= ${filter.minWeight}`;
    }
    if (filter.maxWeight !== undefined) {
      conditions = sql`${conditions} AND v.weight <= ${filter.maxWeight}`;
    }
    
    // Feature filtering
    if (filter.v2lSupport === true) {
      conditions = sql`${conditions} AND v.v2l_support = true`;
    }
    
    // Text search
    if (filter.searchTerm) {
      // Trim the search term and handle whitespace properly
      const trimmedSearchTerm = filter.searchTerm.trim().toLowerCase();
      
      if (trimmedSearchTerm) {
        // We'll modify our approach to use a custom scoring system
        // Instead of filtering with a WHERE clause, we'll add a scoring column
        // and then sort by that score
        
        // This adds a "search_score" column to our results
        const scoringQuery = sql`
          CASE
            -- Exact matches get the highest score (1000)
            WHEN LOWER(m.name) = ${trimmedSearchTerm} THEN 1000
            WHEN LOWER(cm.model_name) = ${trimmedSearchTerm} THEN 1000
            WHEN LOWER(v.variant_name) = ${trimmedSearchTerm} THEN 1000
            
            -- Exact matches of manufacturer + model name get very high score (900)
            WHEN LOWER(m.name || ' ' || cm.model_name) = ${trimmedSearchTerm} THEN 900
            
            -- Matches at the beginning of strings get high scores (800)
            WHEN LOWER(m.name) LIKE ${trimmedSearchTerm + '%'} THEN 800
            WHEN LOWER(cm.model_name) LIKE ${trimmedSearchTerm + '%'} THEN 800
            WHEN LOWER(v.variant_name) LIKE ${trimmedSearchTerm + '%'} THEN 800
            WHEN LOWER(m.name || ' ' || cm.model_name) LIKE ${trimmedSearchTerm + '%'} THEN 800
            
            -- Contains matches get medium scores (500)
            WHEN LOWER(m.name) LIKE ${'%' + trimmedSearchTerm + '%'} THEN 500
            WHEN LOWER(cm.model_name) LIKE ${'%' + trimmedSearchTerm + '%'} THEN 500
            WHEN LOWER(v.variant_name) LIKE ${'%' + trimmedSearchTerm + '%'} THEN 500
            WHEN LOWER(m.name || ' ' || cm.model_name) LIKE ${'%' + trimmedSearchTerm + '%'} THEN 500
            
            -- Default to 0 score for non-matches
            ELSE 0
          END AS search_score
        `;
        
        // Add the scoring column to our query
        query = sql`${query}, ${scoringQuery}`;
        
        // Now add a condition to only include results with a score > 0
        conditions = sql`${conditions} AND (
          LOWER(m.name) LIKE ${'%' + trimmedSearchTerm + '%'}
          OR LOWER(cm.model_name) LIKE ${'%' + trimmedSearchTerm + '%'}
          OR LOWER(v.variant_name) LIKE ${'%' + trimmedSearchTerm + '%'}
          OR LOWER(m.name || ' ' || cm.model_name) LIKE ${'%' + trimmedSearchTerm + '%'}
        )`;
        
        // For multi-word searches, we need additional handling
        const searchTerms = trimmedSearchTerm.split(/\s+/);
        if (searchTerms.length > 1) {
          // These are word-by-word matches
          // We'll add an additional scoring factor later in the ORDER BY clause
          
          // For multi-word cases, add specific handling for manufacturer + model
          // First word = manufacturer, Second+ words = model
          const potentialManufacturer = searchTerms[0];
          const potentialModel = searchTerms.slice(1).join(' ');
          
          // Add a powerful condition for exact matches of [manufacturer + model]
          const exactMatchCondition = sql`
            (LOWER(m.name) = ${potentialManufacturer} AND LOWER(cm.model_name) = ${potentialModel})
          `;
          
          // Add a condition for partial matches too
          const partialMatchCondition = sql`
            (LOWER(m.name) LIKE ${'%' + potentialManufacturer + '%'} 
             AND LOWER(cm.model_name) LIKE ${'%' + potentialModel + '%'})
          `;
          
          // Combine the conditions with an OR
          conditions = sql`${conditions} OR ${exactMatchCondition} OR ${partialMatchCondition}`;
        }
      }
    }
    
    // Add conditions to query
    query = sql`${query} ${conditions}`;
    
    // Add ORDER BY based on sort parameter
    let orderBy;
    
    // If we have a search term, prioritize ordering by search score first
    if (filter.searchTerm && filter.searchTerm.trim()) {
      // For search queries, we want to order by search_score first, then the selected sort
      switch (filter.sortBy) {
        case 'popular':
          orderBy = sql` ORDER BY search_score DESC, cm.view_count DESC`;
          break;
        case 'price_low':
          orderBy = sql` ORDER BY search_score DESC, v.price ASC`;
          break;
        case 'price_high':
          orderBy = sql` ORDER BY search_score DESC, v.price DESC`;
          break;
        case 'range_high':
          orderBy = sql` ORDER BY search_score DESC, v.real_world_range DESC`;
          break;
        case 'battery_high':
          orderBy = sql` ORDER BY search_score DESC, v.battery_capacity DESC`;
          break;
        case 'efficiency':
          orderBy = sql` ORDER BY search_score DESC, v.efficiency ASC`;
          break;
        case 'acceleration':
          orderBy = sql` ORDER BY search_score DESC, v.acceleration ASC`;
          break;
        case 'weight_low':
          orderBy = sql` ORDER BY search_score DESC, v.weight ASC`;
          break;
        case 'weight_high':
          orderBy = sql` ORDER BY search_score DESC, v.weight DESC`;
          break;
        case 'charging_fast':
          orderBy = sql` ORDER BY search_score DESC, v.fast_charging_capacity DESC`;
          break;
        case 'horsepower':
          orderBy = sql` ORDER BY search_score DESC, v.horsepower DESC`;
          break;
        case 'torque':
          orderBy = sql` ORDER BY search_score DESC, v.torque DESC`;
          break;
        default:
          orderBy = sql` ORDER BY search_score DESC, cm.view_count DESC`;
      }
    } else {
      // No search term, so use the regular sort order
      switch (filter.sortBy) {
        case 'popular':
          orderBy = sql` ORDER BY cm.view_count DESC`;
          break;
        case 'price_low':
          orderBy = sql` ORDER BY v.price ASC`;
          break;
        case 'price_high':
          orderBy = sql` ORDER BY v.price DESC`;
          break;
        case 'range_high':
          orderBy = sql` ORDER BY v.real_world_range DESC`;
          break;
        case 'battery_high':
          orderBy = sql` ORDER BY v.battery_capacity DESC`;
          break;
        case 'efficiency':
          orderBy = sql` ORDER BY v.efficiency ASC`;
          break;
        case 'acceleration':
          orderBy = sql` ORDER BY v.acceleration ASC`;
          break;
        case 'weight_low':
          orderBy = sql` ORDER BY v.weight ASC`;
          break;
        case 'weight_high':
          orderBy = sql` ORDER BY v.weight DESC`;
          break;
        case 'charging_fast':
          orderBy = sql` ORDER BY v.fast_charging_capacity DESC`;
          break;
        case 'horsepower':
          orderBy = sql` ORDER BY v.horsepower DESC`;
          break;
        case 'torque':
          orderBy = sql` ORDER BY v.torque DESC`;
          break;
        default:
          orderBy = sql` ORDER BY cm.view_count DESC`;
      }
    }
    
    query = sql`${query} ${orderBy}`;

    // Count total results first
    const countQuery = sql`SELECT COUNT(*) as total FROM (${query}) as sub`;
    const countResult = await safeDb.execute<Record<string, unknown>>(countQuery);
    const total = Number((countResult.rows[0] as any).total);
    
    // Add pagination
    const page = filter.page || 1;
    const perPage = filter.perPage || 10;
    const offset = (page - 1) * perPage;
    
    query = sql`${query} LIMIT ${perPage} OFFSET ${offset}`;
    
    // Execute the final query
    const result = await safeDb.execute<Record<string, unknown>>(query);
    const data = (result.rows as unknown[]).map(row => row as unknown as VehicleWithDetails);
    
    // Return paginated result
    return {
      data,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage)
      }
    };
  }
}

// Use PostgreSQL database storage as per requirements
export const storage = new DatabaseStorage();
