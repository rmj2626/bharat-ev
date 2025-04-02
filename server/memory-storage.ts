import { 
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
import { IStorage } from "./storage";
import { PaginatedResult, VehicleFilter, VehicleWithDetails } from "@shared/types";
import fs from 'fs';
import { parse } from 'csv-parse/sync';

// In-memory storage for development with sample data
export class MemoryStorage implements IStorage {
  private users: User[] = [];
  private manufacturers: Manufacturer[] = [];
  private bodyStyles: BodyStyle[] = [];
  private driveTypes: DriveType[] = [];
  private batteryTypes: BatteryType[] = [];
  private chargingPortLocations: ChargingPortLocation[] = [];
  private rangeRatingSystems: RangeRatingSystem[] = [];
  private carModels: CarModel[] = [];
  private vehicles: Vehicle[] = [];
  private nextIds = {
    user: 1,
    manufacturer: 1,
    bodyStyle: 1,
    driveType: 1,
    batteryType: 1,
    chargingPortLocation: 1,
    rangeRatingSystem: 1,
    carModel: 1,
    vehicle: 1
  };

  constructor() {
    // Initialize with sample data
    this.initializeFromCSV();
  }

  private async initializeFromCSV() {
    try {
      // Load manufacturers from CSV
      const manufacturersContent = fs.readFileSync('./attached_assets/manufacturers_final.csv', 'utf8');
      const manufacturersData = parse(manufacturersContent, { columns: true, skip_empty_lines: true });
      
      for (const item of manufacturersData) {
        await this.createManufacturer({
          name: item.Manufacturer,
          country: item.Country
        });
      }
      
      // Load body styles (distinct values from models CSV)
      const modelsContent = fs.readFileSync('./attached_assets/models_final.csv', 'utf8');
      const modelsData = parse(modelsContent, { columns: true, skip_empty_lines: true });
      
      const uniqueBodyStyles = new Set<string>();
      for (const model of modelsData) {
        if (model['Body Style']) {
          uniqueBodyStyles.add(model['Body Style']);
        }
      }
      
      for (const style of uniqueBodyStyles) {
        await this.createBodyStyle({ name: style });
      }
      
      // Load drive types (from vehicles CSV)
      const vehiclesContent = fs.readFileSync('./attached_assets/vehicles_final.csv', 'utf8');
      const vehiclesData = parse(vehiclesContent, { columns: true, skip_empty_lines: true });
      
      const uniqueDriveTypes = new Set<string>();
      for (const vehicle of vehiclesData) {
        if (vehicle['Drive Type']) {
          uniqueDriveTypes.add(vehicle['Drive Type']);
        }
      }
      
      for (const type of uniqueDriveTypes) {
        await this.createDriveType({ name: type });
      }
      
      // Load battery types (from vehicles CSV)
      const uniqueBatteryTypes = new Set<string>();
      for (const vehicle of vehiclesData) {
        if (vehicle['Battery Type']) {
          uniqueBatteryTypes.add(vehicle['Battery Type']);
        }
      }
      
      for (const type of uniqueBatteryTypes) {
        await this.createBatteryType({ name: type });
      }
      
      // Load range rating systems (from vehicles CSV)
      const uniqueRatingSystems = new Set<string>();
      for (const vehicle of vehiclesData) {
        if (vehicle['Range Rating System']) {
          uniqueRatingSystems.add(vehicle['Range Rating System']);
        }
      }
      
      for (const system of uniqueRatingSystems) {
        await this.createRangeRatingSystem({ name: system });
      }
      
      // Load all car models
      for (const model of modelsData) {
        const manufacturer = this.manufacturers.find(m => m.name === model.Manufacturer);
        const bodyStyle = this.bodyStyles.find(bs => bs.name === model['Body Style']);
        
        if (manufacturer && bodyStyle) {
          await this.createCarModel({
            modelName: model['Model Name'],
            manufacturerId: manufacturer.id,
            bodyStyleId: bodyStyle.id,
            image: model['Image Link'] || null,
            bootSpace: model['Boot Space Ltrs'] ? parseInt(model['Boot Space Ltrs']) : null,
            chargingPortLocationId: null,
            manufacturingStartYear: parseInt(model['Start Year']),
            manufacturingEndYear: model['End Year'] ? parseInt(model['End Year']) : null,
            viewCount: 0
          });
        }
      }
      
      // Load all vehicles
      for (const vehicle of vehiclesData) {
        const modelName = vehicle['Model Name'];
        const manufacturerName = vehicle['Manufacturer Name'];
        const carModel = this.carModels.find(cm => {
          const manufacturer = this.manufacturers.find(m => m.id === cm.manufacturerId);
          return cm.modelName === modelName && manufacturer && manufacturer.name === manufacturerName;
        });
        
        const driveType = this.driveTypes.find(dt => dt.name === vehicle['Drive Type']);
        const batteryType = this.batteryTypes.find(bt => bt.name === vehicle['Battery Type']);
        const rangeRatingSystem = vehicle['Range Rating System'] ? 
          this.rangeRatingSystems.find(rr => rr.name === vehicle['Range Rating System']) : null;
        
        if (carModel && driveType && batteryType) {
          // Check if output is 0, car doesn't support v2l
          const v2lSupport = vehicle['v2l output kw AC'] && parseFloat(vehicle['v2l output kw AC']) > 0;
          const v2lOutputPower = v2lSupport ? parseFloat(vehicle['v2l output kw AC']) * 1000 : null;
          
          // For price, convert from lakhs to actual value
          const price = vehicle['price (in lakhs)'] ? parseFloat(vehicle['price (in lakhs)']) * 100000 : null;
          
          await this.createVehicle({
            modelId: carModel.id,
            variantName: vehicle['Variant Name'],
            driveTypeId: driveType.id,
            batteryTypeId: batteryType.id,
            batteryCapacity: vehicle['Battery Capacity'] ? parseFloat(vehicle['Battery Capacity']) : null,
            usableBatteryCapacity: vehicle['Useable Capacity'] ? parseFloat(vehicle['Useable Capacity']) : null,
            batteryWarrantyYears: vehicle['Warranty Years'] ? parseInt(vehicle['Warranty Years']) : null,
            batteryWarrantyKm: vehicle['Warranty Kms'] ? parseInt(vehicle['Warranty Kms']) : null,
            officialRange: vehicle['Official Range'] ? parseFloat(vehicle['Official Range']) : null,
            rangeRatingId: rangeRatingSystem ? rangeRatingSystem.id : null,
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
        }
      }
      
      // Add default admin user
      await this.createUser({
        username: 'admin',
        passwordHash: '$2b$10$zJlA5aEjC3.cxGNDg7/1q.B0C3ZrOzjTjVuIKsI7e1pafVHT4n9Ji',
        isAdmin: true
      });
    } catch (error) {
      console.error('Failed to initialize memory storage:', error);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: this.nextIds.user++,
      username: user.username,
      passwordHash: user.passwordHash,
      isAdmin: user.isAdmin ?? false,
      createdAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  // Manufacturer operations
  async getManufacturers(): Promise<Manufacturer[]> {
    return [...this.manufacturers];
  }

  async getManufacturer(id: number): Promise<Manufacturer | undefined> {
    return this.manufacturers.find(m => m.id === id);
  }

  async createManufacturer(manufacturer: InsertManufacturer): Promise<Manufacturer> {
    const newManufacturer: Manufacturer = {
      id: this.nextIds.manufacturer++,
      ...manufacturer
    };
    this.manufacturers.push(newManufacturer);
    return newManufacturer;
  }

  async deleteManufacturer(id: number): Promise<void> {
    this.manufacturers = this.manufacturers.filter(m => m.id !== id);
  }

  // Body style operations
  async getBodyStyles(): Promise<BodyStyle[]> {
    return [...this.bodyStyles];
  }

  async getBodyStyle(id: number): Promise<BodyStyle | undefined> {
    return this.bodyStyles.find(bs => bs.id === id);
  }

  async createBodyStyle(bodyStyle: InsertBodyStyle): Promise<BodyStyle> {
    const newBodyStyle: BodyStyle = {
      id: this.nextIds.bodyStyle++,
      ...bodyStyle
    };
    this.bodyStyles.push(newBodyStyle);
    return newBodyStyle;
  }

  // Drive type operations
  async getDriveTypes(): Promise<DriveType[]> {
    return [...this.driveTypes];
  }

  async getDriveType(id: number): Promise<DriveType | undefined> {
    return this.driveTypes.find(dt => dt.id === id);
  }

  async createDriveType(driveType: InsertDriveType): Promise<DriveType> {
    const newDriveType: DriveType = {
      id: this.nextIds.driveType++,
      ...driveType
    };
    this.driveTypes.push(newDriveType);
    return newDriveType;
  }

  // Battery type operations
  async getBatteryTypes(): Promise<BatteryType[]> {
    return [...this.batteryTypes];
  }

  async getBatteryType(id: number): Promise<BatteryType | undefined> {
    return this.batteryTypes.find(bt => bt.id === id);
  }

  async createBatteryType(batteryType: InsertBatteryType): Promise<BatteryType> {
    const newBatteryType: BatteryType = {
      id: this.nextIds.batteryType++,
      ...batteryType
    };
    this.batteryTypes.push(newBatteryType);
    return newBatteryType;
  }

  // Charging port location operations
  async getChargingPortLocations(): Promise<ChargingPortLocation[]> {
    return [...this.chargingPortLocations];
  }

  async getChargingPortLocation(id: number): Promise<ChargingPortLocation | undefined> {
    return this.chargingPortLocations.find(cpl => cpl.id === id);
  }

  async createChargingPortLocation(location: InsertChargingPortLocation): Promise<ChargingPortLocation> {
    const newLocation: ChargingPortLocation = {
      id: this.nextIds.chargingPortLocation++,
      ...location
    };
    this.chargingPortLocations.push(newLocation);
    return newLocation;
  }

  // Range rating system operations
  async getRangeRatingSystems(): Promise<RangeRatingSystem[]> {
    return [...this.rangeRatingSystems];
  }

  async getRangeRatingSystem(id: number): Promise<RangeRatingSystem | undefined> {
    return this.rangeRatingSystems.find(rrs => rrs.id === id);
  }

  async createRangeRatingSystem(system: InsertRangeRatingSystem): Promise<RangeRatingSystem> {
    const newSystem: RangeRatingSystem = {
      id: this.nextIds.rangeRatingSystem++,
      ...system
    };
    this.rangeRatingSystems.push(newSystem);
    return newSystem;
  }

  // Car model operations
  async getCarModels(): Promise<CarModel[]> {
    return [...this.carModels];
  }

  async getCarModel(id: number): Promise<CarModel | undefined> {
    return this.carModels.find(cm => cm.id === id);
  }

  async createCarModel(carModel: InsertCarModel): Promise<CarModel> {
    const newCarModel: CarModel = {
      id: this.nextIds.carModel++,
      ...carModel
    };
    this.carModels.push(newCarModel);
    return newCarModel;
  }

  async incrementViewCount(id: number): Promise<void> {
    const model = this.carModels.find(cm => cm.id === id);
    if (model) {
      model.viewCount += 1;
    }
  }

  async deleteCarModel(id: number): Promise<void> {
    this.carModels = this.carModels.filter(cm => cm.id !== id);
  }

  // Vehicle operations
  async getVehicles(): Promise<Vehicle[]> {
    return [...this.vehicles];
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    return this.vehicles.find(v => v.id === id);
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const newVehicle: Vehicle = {
      id: this.nextIds.vehicle++,
      ...vehicle
    };
    this.vehicles.push(newVehicle);
    return newVehicle;
  }

  async deleteVehicle(id: number): Promise<void> {
    this.vehicles = this.vehicles.filter(v => v.id !== id);
  }

  // Complex queries
  async getVehicleWithDetails(id: number): Promise<VehicleWithDetails | undefined> {
    const vehicle = this.vehicles.find(v => v.id === id);
    if (!vehicle) return undefined;

    const carModel = this.carModels.find(cm => cm.id === vehicle.modelId);
    if (!carModel) return undefined;

    const manufacturer = this.manufacturers.find(m => m.id === carModel.manufacturerId);
    if (!manufacturer) return undefined;

    const bodyStyle = this.bodyStyles.find(bs => bs.id === carModel.bodyStyleId);
    if (!bodyStyle) return undefined;

    const driveType = vehicle.driveTypeId ? this.driveTypes.find(dt => dt.id === vehicle.driveTypeId) : null;
    const batteryType = vehicle.batteryTypeId ? this.batteryTypes.find(bt => bt.id === vehicle.batteryTypeId) : null;
    const rangeRatingSystem = vehicle.rangeRatingId ? this.rangeRatingSystems.find(rrs => rrs.id === vehicle.rangeRatingId) : null;
    const chargingPortLocation = carModel.chargingPortLocationId ? 
      this.chargingPortLocations.find(cpl => cpl.id === carModel.chargingPortLocationId) : null;

    // Increment view count
    await this.incrementViewCount(carModel.id);

    return {
      id: vehicle.id,
      modelId: vehicle.modelId,
      variantName: vehicle.variantName,
      batteryCapacity: vehicle.batteryCapacity,
      usableBatteryCapacity: vehicle.usableBatteryCapacity,
      officialRange: vehicle.officialRange,
      realWorldRange: vehicle.realWorldRange,
      efficiency: vehicle.efficiency,
      horsepower: vehicle.horsepower,
      torque: vehicle.torque,
      acceleration: vehicle.acceleration,
      topSpeed: vehicle.topSpeed,
      fastChargingCapacity: vehicle.fastChargingCapacity,
      fastChargingTime: vehicle.fastChargingTime,
      weight: vehicle.weight,
      v2lSupport: vehicle.v2lSupport,
      v2lOutputPower: vehicle.v2lOutputPower,
      price: vehicle.price,
      manufacturerId: manufacturer.id,
      manufacturerName: manufacturer.name,
      modelName: carModel.modelName,
      bodyStyleId: bodyStyle.id,
      bodyStyleName: bodyStyle.name,
      bootSpace: carModel.bootSpace,
      image: carModel.image,
      manufacturingStartYear: carModel.manufacturingStartYear,
      manufacturingEndYear: carModel.manufacturingEndYear,
      driveTypeName: driveType?.name || null,
      batteryTypeName: batteryType?.name || null,
      chargingPortLocation: chargingPortLocation?.location || null,
      rangeRatingSystem: rangeRatingSystem?.name || null,
      batteryWarrantyYears: vehicle.batteryWarrantyYears,
      batteryWarrantyKm: vehicle.batteryWarrantyKm
    };
  }

  async filterVehicles(filter: VehicleFilter): Promise<PaginatedResult<VehicleWithDetails>> {
    // First, get all vehicles with details for filtering
    const allVehiclesWithDetails: VehicleWithDetails[] = [];

    for (const vehicle of this.vehicles) {
      const details = await this.getVehicleWithDetails(vehicle.id);
      if (details) {
        allVehiclesWithDetails.push(details);
      }
    }

    // Apply filters
    let filteredVehicles = [...allVehiclesWithDetails];

    // Manufacturer filtering
    if (filter.manufacturerId !== undefined) {
      filteredVehicles = filteredVehicles.filter(v => v.manufacturerId === filter.manufacturerId);
    } else if (filter.manufacturerIds && filter.manufacturerIds.length > 0) {
      filteredVehicles = filteredVehicles.filter(v => filter.manufacturerIds!.includes(v.manufacturerId));
    }

    // Body style filtering
    if (filter.bodyStyleId !== undefined) {
      filteredVehicles = filteredVehicles.filter(v => v.bodyStyleId === filter.bodyStyleId);
    } else if (filter.bodyStyleIds && filter.bodyStyleIds.length > 0) {
      filteredVehicles = filteredVehicles.filter(v => filter.bodyStyleIds!.includes(v.bodyStyleId));
    }

    // Drive type filtering
    if (filter.driveTypeIds && filter.driveTypeIds.length > 0) {
      filteredVehicles = filteredVehicles.filter(v => {
        const driveType = this.driveTypes.find(dt => dt.name === v.driveTypeName);
        return driveType && filter.driveTypeIds!.includes(driveType.id);
      });
    }

    // Battery type filtering
    if (filter.batteryTypeIds && filter.batteryTypeIds.length > 0) {
      filteredVehicles = filteredVehicles.filter(v => {
        const batteryType = this.batteryTypes.find(bt => bt.name === v.batteryTypeName);
        return batteryType && filter.batteryTypeIds!.includes(batteryType.id);
      });
    }

    // Price filtering logic
    
    // Only apply price filtering if at least one price filter is set
    if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
      // The values from the API are already in rupees (converted in routes.ts)
      // Set minimum price threshold if provided, otherwise default to 0
      const minPriceRupees = filter.minPrice !== undefined ? Number(filter.minPrice) : 0;
      
      // If maxPrice is undefined, it means user wants NO UPPER LIMIT
      // Otherwise use the provided max price value from the filter
      const maxPriceRupees = filter.maxPrice !== undefined 
        ? Number(filter.maxPrice) 
        : Number.MAX_SAFE_INTEGER; // No upper limit
      
      // Apply the price filter - all vehicles with price in range pass
      filteredVehicles = filteredVehicles.filter(v => {
        return v.price !== null && 
              v.price >= minPriceRupees && 
              v.price <= maxPriceRupees;
      });
      

    }

    // Range filtering
    if (filter.minRange !== undefined) {
      filteredVehicles = filteredVehicles.filter(v => v.realWorldRange !== null && v.realWorldRange >= filter.minRange!);
    }
    if (filter.maxRange !== undefined) {
      filteredVehicles = filteredVehicles.filter(v => v.realWorldRange !== null && v.realWorldRange <= filter.maxRange!);
    }

    // Battery capacity filtering
    if (filter.minBatteryCapacity !== undefined) {
      filteredVehicles = filteredVehicles.filter(v => v.batteryCapacity !== null && v.batteryCapacity >= filter.minBatteryCapacity!);
    }
    if (filter.maxBatteryCapacity !== undefined) {
      filteredVehicles = filteredVehicles.filter(v => v.batteryCapacity !== null && v.batteryCapacity <= filter.maxBatteryCapacity!);
    }

    // Usable battery capacity filtering
    if (filter.minUsableBatteryCapacity !== undefined) {
      filteredVehicles = filteredVehicles.filter(v => v.usableBatteryCapacity !== null && v.usableBatteryCapacity >= filter.minUsableBatteryCapacity!);
    }
    if (filter.maxUsableBatteryCapacity !== undefined) {
      filteredVehicles = filteredVehicles.filter(v => v.usableBatteryCapacity !== null && v.usableBatteryCapacity <= filter.maxUsableBatteryCapacity!);
    }

    // Performance filtering
    if (filter.minAcceleration !== undefined) {
      filteredVehicles = filteredVehicles.filter(v => v.acceleration !== null && v.acceleration >= filter.minAcceleration!);
    }
    if (filter.maxAcceleration !== undefined) {
      filteredVehicles = filteredVehicles.filter(v => v.acceleration !== null && v.acceleration <= filter.maxAcceleration!);
    }

    if (filter.minHorsepower !== undefined) {
      filteredVehicles = filteredVehicles.filter(v => v.horsepower !== null && v.horsepower >= filter.minHorsepower!);
    }
    if (filter.maxHorsepower !== undefined) {
      filteredVehicles = filteredVehicles.filter(v => v.horsepower !== null && v.horsepower <= filter.maxHorsepower!);
    }

    if (filter.minTorque !== undefined) {
      filteredVehicles = filteredVehicles.filter(v => v.torque !== null && v.torque >= filter.minTorque!);
    }
    if (filter.maxTorque !== undefined) {
      filteredVehicles = filteredVehicles.filter(v => v.torque !== null && v.torque <= filter.maxTorque!);
    }

    // Fast charging filtering
    if (filter.minFastChargingCapacity !== undefined) {
      filteredVehicles = filteredVehicles.filter(v => 
        v.fastChargingCapacity !== null && v.fastChargingCapacity >= filter.minFastChargingCapacity!);
    }
    if (filter.maxFastChargingCapacity !== undefined) {
      filteredVehicles = filteredVehicles.filter(v => 
        v.fastChargingCapacity !== null && v.fastChargingCapacity <= filter.maxFastChargingCapacity!);
    }

    if (filter.minFastChargingTime !== undefined) {
      filteredVehicles = filteredVehicles.filter(v => 
        v.fastChargingTime !== null && v.fastChargingTime >= filter.minFastChargingTime!);
    }
    if (filter.maxFastChargingTime !== undefined) {
      filteredVehicles = filteredVehicles.filter(v => 
        v.fastChargingTime !== null && v.fastChargingTime <= filter.maxFastChargingTime!);
    }

    // Weight filtering
    if (filter.minWeight !== undefined) {
      filteredVehicles = filteredVehicles.filter(v => v.weight !== null && v.weight >= filter.minWeight!);
    }
    if (filter.maxWeight !== undefined) {
      filteredVehicles = filteredVehicles.filter(v => v.weight !== null && v.weight <= filter.maxWeight!);
    }

    // V2L support filtering
    if (filter.v2lSupport !== undefined) {
      filteredVehicles = filteredVehicles.filter(v => v.v2lSupport === filter.v2lSupport);
    }

    // Warranty filtering
    if (filter.minBatteryWarrantyYears !== undefined) {
      filteredVehicles = filteredVehicles.filter(v => 
        v.batteryWarrantyYears !== null && v.batteryWarrantyYears >= filter.minBatteryWarrantyYears!);
    }
    if (filter.maxBatteryWarrantyYears !== undefined) {
      filteredVehicles = filteredVehicles.filter(v => 
        v.batteryWarrantyYears !== null && v.batteryWarrantyYears <= filter.maxBatteryWarrantyYears!);
    }

    if (filter.minBatteryWarrantyKm !== undefined) {
      filteredVehicles = filteredVehicles.filter(v => 
        v.batteryWarrantyKm !== null && v.batteryWarrantyKm >= filter.minBatteryWarrantyKm!);
    }
    if (filter.maxBatteryWarrantyKm !== undefined) {
      filteredVehicles = filteredVehicles.filter(v => 
        v.batteryWarrantyKm !== null && v.batteryWarrantyKm <= filter.maxBatteryWarrantyKm!);
    }

    // Search term filtering
    if (filter.searchTerm) {
      const searchTermLower = filter.searchTerm.toLowerCase();
      filteredVehicles = filteredVehicles.filter(v => 
        v.modelName.toLowerCase().includes(searchTermLower) ||
        v.variantName.toLowerCase().includes(searchTermLower) ||
        v.manufacturerName.toLowerCase().includes(searchTermLower)
      );
    }

    // Apply sorting
    if (filter.sortBy) {
      switch (filter.sortBy) {
        case 'popular':
          // Not implemented in memory storage, default to price
          filteredVehicles.sort((a, b) => (a.price || 0) - (b.price || 0));
          break;
        case 'price_low':
          filteredVehicles.sort((a, b) => (a.price || 0) - (b.price || 0));
          break;
        case 'price_high':
          filteredVehicles.sort((a, b) => (b.price || 0) - (a.price || 0));
          break;
        case 'range_high':
          filteredVehicles.sort((a, b) => (b.realWorldRange || 0) - (a.realWorldRange || 0));
          break;
        case 'battery_high':
          filteredVehicles.sort((a, b) => (b.batteryCapacity || 0) - (a.batteryCapacity || 0));
          break;
        case 'efficiency':
          filteredVehicles.sort((a, b) => (a.efficiency || 999) - (b.efficiency || 999)); // Lower is better
          break;
        case 'acceleration':
          filteredVehicles.sort((a, b) => (a.acceleration || 999) - (b.acceleration || 999)); // Lower is better
          break;
        case 'weight_low':
          filteredVehicles.sort((a, b) => (a.weight || 0) - (b.weight || 0));
          break;
        case 'weight_high':
          filteredVehicles.sort((a, b) => (b.weight || 0) - (a.weight || 0));
          break;
        case 'charging_fast':
          filteredVehicles.sort((a, b) => (b.fastChargingCapacity || 0) - (a.fastChargingCapacity || 0));
          break;
        case 'horsepower':
          filteredVehicles.sort((a, b) => (b.horsepower || 0) - (a.horsepower || 0));
          break;
        case 'torque':
          filteredVehicles.sort((a, b) => (b.torque || 0) - (a.torque || 0));
          break;
        default:
          // No sorting
          break;
      }
    }

    // Apply pagination
    const page = filter.page || 1;
    const perPage = filter.perPage || 10;
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex);

    return {
      data: paginatedVehicles,
      pagination: {
        page,
        perPage,
        total: filteredVehicles.length,
        totalPages: Math.ceil(filteredVehicles.length / perPage)
      }
    };
  }
}