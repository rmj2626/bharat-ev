import React from "react";
import { Link } from "wouter";
import VehicleSpecItem from "./vehicle-spec-item";
import { VehicleWithDetails } from "@shared/types";
import { useComparison } from "../hooks/use-comparison";
import { formatPrice } from "../lib/filterHelpers";
import { CheckIcon, Battery, Gauge, Clock, Zap } from "lucide-react";

interface VehicleCardProps {
  vehicle: VehicleWithDetails;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const { toggleVehicle, isSelected } = useComparison();
  const selected = isSelected(vehicle.id);

  // Completely redesigned card with full-width image at the top
  return (
    <div className="bg-white shadow overflow-hidden rounded-lg hover:shadow-md transition-shadow duration-300">
      {/* Full width image at the top */}
      <div className="relative">
        <Link href={`/vehicles/${vehicle.id}`} className="block">
          <div className="w-full relative bg-gradient-to-r from-gray-50 to-gray-100" style={{ height: '240px' }}>
            <img
              src={vehicle.image || "https://www.svgrepo.com/show/508699/landscape-placeholder.svg"}
              alt={`${vehicle.manufacturerName} ${vehicle.modelName} ${vehicle.variantName}`}
              className="w-full h-full object-contain"
            />
            {/* Add comparison checkbox */}
            <div className="absolute top-3 right-3 z-10">
              <div
                className={`h-7 w-7 rounded-sm border-2 ${
                  selected 
                    ? 'bg-blue-500 border-blue-600' 
                    : 'bg-white/80 border-gray-300 hover:border-blue-400'
                } flex items-center justify-center cursor-pointer transition-colors duration-200 shadow-md`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVehicle(vehicle);
                }}
                aria-label={`${selected ? 'Remove from' : 'Add to'} comparison`}
              >
                {selected && (
                  <CheckIcon className="h-5 w-5 text-white" />
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Vehicle header info */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start">
          <div>
            <Link href={`/vehicles/${vehicle.id}`}>
              <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                {vehicle.manufacturerName} {vehicle.modelName} {vehicle.variantName}
              </h2>
            </Link>
            <p className="text-sm text-gray-500 mt-1">
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
      </div>

      {/* Key specs with icons - simplified for better readability */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Gauge size={18} className="text-blue-600" />
            <VehicleSpecItem 
              label="Real Range" 
              value={vehicle.realWorldRange ? `${vehicle.realWorldRange} km` : "N/A"} 
            />
          </div>
          <div className="flex items-center gap-2">
            <Battery size={18} className="text-blue-600" />
            <VehicleSpecItem 
              label="Battery" 
              value={vehicle.batteryCapacity ? `${vehicle.batteryCapacity} kWh` : "N/A"} 
            />
          </div>
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-blue-600" />
            <VehicleSpecItem 
              label="Fast Charging" 
              value={vehicle.fastChargingTime ? `${vehicle.fastChargingTime} min` : "N/A"} 
            />
          </div>
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-blue-600" />
            <VehicleSpecItem 
              label="Power" 
              value={vehicle.horsepower ? `${vehicle.horsepower} BHP` : "N/A"} 
            />
          </div>
        </div>
      </div>

      {/* Secondary specs row */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex gap-3 text-sm">
            <span className="text-gray-600">
              {vehicle.efficiency ? `${vehicle.efficiency} Wh/km` : ""}
            </span>
            <span className="text-gray-600">
              {vehicle.acceleration ? `0-100: ${vehicle.acceleration}s` : ""}
            </span>
          </div>
          
          <Link 
            href={`/vehicles/${vehicle.id}`}
            className="mt-2 md:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
