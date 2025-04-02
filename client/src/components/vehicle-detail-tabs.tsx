import { VehicleWithDetails } from "@shared/types";
import RangeEstimator from "./range-estimator";
import { calculateLongDistanceMetrics, generateStarRating } from "@/lib/longDistanceRating";

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

export function LongDistanceRatingTab({ vehicle }: TabProps) {
  const metrics = calculateLongDistanceMetrics(
    vehicle.realWorldRange,
    vehicle.fastChargingTime,
    vehicle.usableBatteryCapacity
  );

  if (!metrics) {
    return (
      <div className="mt-8">
        <div className="bg-amber-50 border border-amber-100 rounded-md p-4">
          <h3 className="text-base font-medium text-amber-800 mb-2">Insufficient Data</h3>
          <p className="text-sm text-amber-700">
            We don't have enough data to calculate the long distance rating for this vehicle.
            At minimum, we need the real-world range data.
          </p>
        </div>
      </div>
    );
  }

  const { 
    leg1DistanceKm, 
    leg2DistanceKm, 
    oneStopRangeKm, 
    starRating, 
    leg1DurationStr, 
    leg2DurationStr, 
    totalDurationStr,
    canFastCharge
  } = metrics;
  
  return (
    <div className="mt-8">
      <h3 className="text-base font-medium text-gray-900 mb-4">Long Distance Suitability</h3>
      <p className="text-sm text-gray-500 mb-4">
        This rating assesses how suited this EV is for long-distance travel using a standardized benchmark.
        It calculates the total distance achievable in a single trip with one charging stop.
      </p>
      
      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">How the "1-Stop Range" works:</h4>
        <p className="text-sm text-gray-500 mb-3">
          We measure how far you can travel in a single journey when starting with a full battery, 
          driving until 10% charge remains, stopping once for a fast-charge up to 80%, 
          and then continuing until the battery reaches 10% again.
        </p>
      </div>

      <h4 className="text-sm font-medium text-gray-700 mb-3">Benchmark Test Results</h4>
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Leg 1 (100% → 10%)</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><strong>{leg1DistanceKm}</strong> km</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><strong>{leg1DurationStr}</strong></td>
            </tr>
            <tr className={!canFastCharge ? "bg-gray-100 text-gray-400" : ""}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Charging Stop (10% → 80%)</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">0 km</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{canFastCharge ? "15min" : "N/A"}</td>
            </tr>
            <tr className={!canFastCharge ? "bg-gray-100 text-gray-400" : ""}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Leg 2 (80% → 10%)</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <strong>{canFastCharge ? leg2DistanceKm : 0}</strong> km
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <strong>{canFastCharge ? leg2DurationStr : "N/A"}</strong>
              </td>
            </tr>
            <tr className="bg-gray-50 font-medium">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Total 1-Stop Journey</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><strong>{oneStopRangeKm}</strong> km</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><strong>{totalDurationStr}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">5-Star Rating</h4>
        <div className="mb-4">
          <div className="flex items-center mb-1">
            <div className="text-lg font-medium text-gray-900">Rating: {starRating.toFixed(1)} / 5.0</div>
            <div className="ml-3 text-2xl text-yellow-500" aria-hidden="true">
              {generateStarRating(starRating)}
            </div>
          </div>
          <p className="text-sm text-gray-500">Based on the 2025 EV Long Distance Rating Scale</p>
        </div>

        <div className="text-sm text-gray-500 space-y-1">
          <p>⭐ 0 stars: &lt; 200 km</p>
          <p>⭐ 1 star: 200 - 324 km</p>
          <p>⭐⭐ 2 stars: 325 - 449 km</p>
          <p>⭐⭐⭐ 3 stars: 450 - 574 km</p>
          <p>⭐⭐⭐⭐ 4 stars: 575 - 699 km</p>
          <p>⭐⭐⭐⭐⭐ 5 stars: 700+ km</p>
        </div>
      </div>
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