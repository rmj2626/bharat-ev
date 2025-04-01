import { VehicleWithDetails } from "@shared/types";
import RangeEstimator from "./range-estimator";

interface TabProps {
  vehicle: VehicleWithDetails;
}

export function RangeEstimatorTab({ vehicle }: TabProps) {
  return (
    <div className="mt-8">
      <h3 className="text-base font-medium text-gray-900 mb-4">Real-World Range Estimator</h3>
      <p className="text-sm text-gray-500 mb-4">Estimate how far you can drive in different conditions</p>
      
      <RangeEstimator 
        vehicle={vehicle} 
        officialRange={vehicle.officialRange} 
        realWorldRange={vehicle.realWorldRange} 
      />
    </div>
  );
}

export function BatteryTab({ vehicle }: TabProps) {
  const getBatteryWarranty = () => {
    if (vehicle.batteryWarrantyYears && vehicle.batteryWarrantyKm) {
      return `${vehicle.batteryWarrantyYears} years / ${vehicle.batteryWarrantyKm.toLocaleString()} km`;
    } else if (vehicle.batteryWarrantyYears) {
      return `${vehicle.batteryWarrantyYears} years`;
    } else if (vehicle.batteryWarrantyKm) {
      return `${vehicle.batteryWarrantyKm.toLocaleString()} km`;
    }
    return "N/A";
  };

  return (
    <div className="mt-8">
      <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">Battery Type</dt>
          <dd className="mt-1 text-sm text-gray-900">{vehicle.batteryTypeName || "N/A"}</dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">Total Capacity</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {vehicle.batteryCapacity ? `${vehicle.batteryCapacity} kWh` : "N/A"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">Usable Capacity</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {vehicle.usableBatteryCapacity ? `${vehicle.usableBatteryCapacity} kWh` : "N/A"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">Warranty</dt>
          <dd className="mt-1 text-sm text-gray-900">{getBatteryWarranty()}</dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">Official Range</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {vehicle.officialRange ? `${vehicle.officialRange} km (${vehicle.rangeRatingSystem})` : "N/A"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">Real-World Range</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {vehicle.realWorldRange ? `${vehicle.realWorldRange} km` : "N/A"}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function PerformanceTab({ vehicle }: TabProps) {
  return (
    <div className="mt-8">
      <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">Power</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {vehicle.horsepower ? `${vehicle.horsepower} BHP (${Math.round(vehicle.horsepower * 0.7457)} kW)` : "N/A"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">Torque</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {vehicle.torque ? `${vehicle.torque} Nm` : "N/A"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">0-100 km/h</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {vehicle.acceleration ? `${vehicle.acceleration} seconds` : "N/A"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">Top Speed</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {vehicle.topSpeed ? `${vehicle.topSpeed} km/h` : "N/A"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">Drive Type</dt>
          <dd className="mt-1 text-sm text-gray-900">{vehicle.driveTypeName || "N/A"}</dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">Weight</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {vehicle.weight ? `${vehicle.weight.toLocaleString()} kg` : "N/A"}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function ChargingTab({ vehicle }: TabProps) {
  return (
    <div className="mt-8">
      <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">Fast Charging Capacity</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {vehicle.fastChargingCapacity ? `${vehicle.fastChargingCapacity} kW` : "N/A"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">Fast Charging Time (10-80%)</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {vehicle.fastChargingTime ? `${vehicle.fastChargingTime} minutes` : "N/A"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">Charging Port Location</dt>
          <dd className="mt-1 text-sm text-gray-900">{vehicle.chargingPortLocation || "N/A"}</dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">Fast Charging Rate</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {vehicle.fastChargingCapacity && vehicle.batteryCapacity
              ? `${Math.round((vehicle.fastChargingCapacity / vehicle.batteryCapacity) * 100)}% of battery / hour`
              : "N/A"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">Estimated Charging Time (0-100%, AC 7.4kW)</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {vehicle.batteryCapacity
              ? `${Math.round(vehicle.batteryCapacity / 7.4 * 60)} minutes`
              : "N/A"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">Range Added Per Hour (Fast Charging)</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {vehicle.fastChargingCapacity && vehicle.realWorldRange && vehicle.batteryCapacity
              ? `${Math.round((vehicle.fastChargingCapacity / vehicle.batteryCapacity) * vehicle.realWorldRange)} km/hour`
              : "N/A"}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function FeaturesTab({ vehicle }: TabProps) {
  return (
    <div className="mt-8">
      <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">Vehicle-to-Load (V2L) Support</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {vehicle.v2lSupport ? "Yes" : "No"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">V2L Output Power</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {vehicle.v2lSupport && vehicle.v2lOutputPower
              ? `${vehicle.v2lOutputPower} Watts`
              : "N/A"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">Boot Space</dt>
          <dd className="mt-1 text-sm text-gray-900">N/A</dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">Battery Type</dt>
          <dd className="mt-1 text-sm text-gray-900">{vehicle.batteryTypeName || "N/A"}</dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">Battery Warranty</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {vehicle.batteryWarrantyYears && vehicle.batteryWarrantyKm
              ? `${vehicle.batteryWarrantyYears} years / ${vehicle.batteryWarrantyKm.toLocaleString()} km`
              : vehicle.batteryWarrantyYears
              ? `${vehicle.batteryWarrantyYears} years`
              : vehicle.batteryWarrantyKm
              ? `${vehicle.batteryWarrantyKm.toLocaleString()} km`
              : "N/A"}
          </dd>
        </div>
      </dl>
    </div>
  );
}