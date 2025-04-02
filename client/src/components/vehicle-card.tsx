import React from "react";
import { Link } from "wouter";
import VehicleSpecItem from "./vehicle-spec-item";
import { VehicleWithDetails } from "@shared/types";
import { useComparison } from "../hooks/use-comparison";
import { formatPrice } from "../lib/filterHelpers";
import { CheckIcon } from "lucide-react";

interface VehicleCardProps {
  vehicle: VehicleWithDetails;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const { toggleVehicle, isSelected } = useComparison();
  const selected = isSelected(vehicle.id);

  const getChargeTime = () => {
    if (vehicle.fastChargingTime) {
      return `${vehicle.fastChargingTime} min (10-80%)`;
    }
    return "N/A";
  };

  const getEfficiency = () => {
    if (vehicle.efficiency) {
      return `${vehicle.efficiency} Wh/km`;
    }
    return "N/A";
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg hover:shadow-md transition-shadow duration-300">
      <div className="flex flex-col md:flex-row md:h-full">
        {/* Vehicle Image - Make sure the image fills the entire left side of the card */}
        <div className="relative cursor-pointer md:w-1/4">
          <Link href={`/vehicles/${vehicle.id}`} className="block h-full">
            <div className="h-full">
              <img
                src={vehicle.image || "https://www.svgrepo.com/show/508699/landscape-placeholder.svg"}
                alt={`${vehicle.manufacturerName} ${vehicle.modelName} ${vehicle.variantName}`}
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
          <div className="absolute top-2 right-2">
            <div
              className={`h-6 w-6 rounded-sm border ${
                selected 
                  ? 'bg-blue-500 border-blue-600' 
                  : 'bg-white border-gray-300 hover:border-blue-400'
              } flex items-center justify-center cursor-pointer transition-colors duration-200`}
              onClick={(e) => {
                e.stopPropagation();
                toggleVehicle(vehicle);
              }}
              aria-label={`${selected ? 'Remove from' : 'Add to'} comparison`}
            >
              {selected && (
                <CheckIcon className="h-4 w-4 text-white" />
              )}
            </div>
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="flex-1 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:justify-between">
            <div>
              <Link href={`/vehicles/${vehicle.id}`}>
                <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                  {vehicle.manufacturerName} {vehicle.modelName} {vehicle.variantName}
                </h2>
              </Link>
              <p className="text-sm text-gray-500 mb-4">
                {vehicle.bodyStyleName} • {vehicle.manufacturingStartYear}
                {vehicle.manufacturingEndYear ? `-${vehicle.manufacturingEndYear}` : ""}
              </p>
            </div>
            <div className="mt-2 md:mt-0 inline-flex md:flex-col items-center md:items-end">
              <span className="text-xl font-semibold text-gray-900">
                {formatPrice(vehicle.price)}
              </span>
              <span className="ml-2 md:ml-0 text-sm text-gray-500">Ex-showroom</span>
            </div>
          </div>

          {/* First row: Real Range, Battery, Charging Time, Efficiency, Battery Type */}
          <div className="mt-4 grid grid-cols-5 gap-2 text-xs sm:text-sm">
            <VehicleSpecItem 
              label="Real Range" 
              value={vehicle.realWorldRange ? `${vehicle.realWorldRange} km` : "N/A"} 
            />
            <VehicleSpecItem 
              label="Battery" 
              value={vehicle.batteryCapacity ? `${vehicle.batteryCapacity} kWh` : "N/A"} 
            />
            <VehicleSpecItem 
              label="Charging Time" 
              value={getChargeTime()} 
            />
            <VehicleSpecItem 
              label="Efficiency" 
              value={getEfficiency()} 
            />
            <VehicleSpecItem 
              label="Battery Type" 
              value={vehicle.batteryTypeName || "N/A"} 
            />
          </div>

          {/* Second row: Power, Torque, 0-100 km/h, Top Speed, Weight */}
          <div className="mt-3 grid grid-cols-5 gap-2 text-xs sm:text-sm">
            <VehicleSpecItem 
              label="Power" 
              value={vehicle.horsepower ? `${vehicle.horsepower} BHP` : "N/A"} 
            />
            <VehicleSpecItem 
              label="Torque" 
              value={vehicle.torque ? `${vehicle.torque} Nm` : "N/A"} 
            />
            <VehicleSpecItem 
              label="0-100 km/h" 
              value={vehicle.acceleration ? `${vehicle.acceleration} sec` : "N/A"} 
            />
            <VehicleSpecItem 
              label="Top Speed" 
              value={vehicle.topSpeed ? `${vehicle.topSpeed} km/h` : "N/A"} 
            />
            <VehicleSpecItem 
              label="Weight" 
              value={vehicle.weight ? `${vehicle.weight} kg` : "N/A"} 
            />
          </div>

          <div className="mt-4 flex w-full">
            <Link 
              href={`/vehicles/${vehicle.id}`}
              className="w-full md:w-auto inline-flex justify-center md:justify-start items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
