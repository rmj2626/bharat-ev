import React from "react";
import { useComparison } from "../hooks/use-comparison";
import { ChevronLeft, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMediaQuery } from "../hooks/use-mobile";
import SearchVehicles from "@/components/search-vehicles";
import { formatPrice } from "@/lib/filterHelpers";

export default function ComparePage() {
  const { selectedVehicles, removeVehicle } = useComparison();
  const [, navigate] = useLocation();
  const isMobile = useMediaQuery("(max-width: 640px)");

  // Function to determine if a value is the same across all vehicles being compared
  const isCommonValue = (key: keyof typeof selectedVehicles[0], transform?: (val: any) => string) => {
    if (selectedVehicles.length < 2) return false;
    
    const value = selectedVehicles[0][key];
    return selectedVehicles.every(v => 
      transform ? transform(v[key]) === transform(value) : v[key] === value
    );
  };

  // Function to highlight differences in values
  const highlightCell = (key: keyof typeof selectedVehicles[0]) => {
    return !isCommonValue(key);
  };

  // Formatter functions for different types of data
  const formatters = {
    price: (value: number | null) => formatPrice(value),
    power: (value: number | null) => value ? `${value} bhp` : "N/A",
    torque: (value: number | null) => value ? `${value} Nm` : "N/A",
    acceleration: (value: number | null) => value ? `${value} sec` : "N/A",
    topSpeed: (value: number | null) => value ? `${value} km/h` : "N/A",
    battery: (value: number | null) => value ? `${value} kWh` : "N/A",
    range: (value: number | null) => value ? `${value} km` : "N/A",
    efficiency: (value: number | null) => value ? `${value} Wh/km` : "N/A",
    chargingCapacity: (value: number | null) => value ? `${value} kW` : "N/A",
    chargingTime: (value: number | null) => value ? `${value} min` : "N/A",
    weight: (value: number | null) => value ? `${value} kg` : "N/A",
    v2lPower: (value: number | null) => value ? `${value} kW` : "N/A",
    warranty: (years: number | null, km: number | null) => {
      if (years && km) {
        return `${years} years / ${km} km`;
      } else if (years) {
        return `${years} years`;
      } else if (km) {
        return `${km} km`;
      }
      return "N/A";
    },
    boolean: (value: boolean) => value ? "Yes" : "No",
  };

  // If no vehicles are selected, show a message to add vehicles
  if (selectedVehicles.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to all vehicles
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Compare Vehicles</h1>
        
        <div className="bg-white shadow rounded-lg p-8 mb-8 text-center">
          <p className="text-lg mb-4">Please add vehicles to compare</p>
          <p className="text-sm text-gray-500 mb-6">Search for vehicles below to add them to comparison</p>
          
          {/* Search component */}
          <SearchVehicles />
        </div>
      </div>
    );
  }
  
  // If only one vehicle is selected, still allow comparison but show a message
  if (selectedVehicles.length === 1) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to all vehicles
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Compare Vehicles</h1>
        
        <div className="mb-4 bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={selectedVehicles[0].image || "https://www.svgrepo.com/show/508699/landscape-placeholder.svg"}
                alt={`${selectedVehicles[0].manufacturerName} ${selectedVehicles[0].modelName}`}
                className="w-16 h-12 object-cover rounded mr-3"
              />
              <div>
                <p className="font-medium">{selectedVehicles[0].manufacturerName} {selectedVehicles[0].modelName}</p>
                <p className="text-sm text-gray-500">{selectedVehicles[0].variantName}</p>
              </div>
            </div>
            <button 
              onClick={() => removeVehicle(selectedVehicles[0].id)}
              className="p-1 rounded-full hover:bg-gray-200"
              title="Remove from comparison"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        <p className="text-center mb-8 text-gray-600">Add at least one more vehicle to compare</p>
        
        {/* Search component */}
        <SearchVehicles />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      {/* Back button */}
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to all vehicles
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Compare Vehicles</h1>
      
      {/* Search component */}
      <SearchVehicles />
      
      {/* Comparison table */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                  Specification
                </th>
                {selectedVehicles.map(vehicle => (
                  <th 
                    key={vehicle.id} 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ width: `${75 / selectedVehicles.length}%` }}
                  >
                    <div className="flex flex-col items-center sm:items-start relative">
                      <button 
                        onClick={() => removeVehicle(vehicle.id)} 
                        className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100"
                        title="Remove from comparison"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                      <div className="relative w-24 pb-[56.25%] bg-gray-100 rounded mb-2"> {/* 16:9 aspect ratio */}
                        <img
                          src={vehicle.image || "https://www.svgrepo.com/show/508699/landscape-placeholder.svg"}
                          alt={`${vehicle.manufacturerName} ${vehicle.modelName}`}
                          className="absolute top-0 left-0 w-full h-full object-contain rounded"
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {vehicle.manufacturerName} {vehicle.modelName}
                      </span>
                      <span className="text-xs text-gray-500">{vehicle.variantName}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Basic Info Section */}
              <tr className="bg-gray-50">
                <td colSpan={selectedVehicles.length + 1} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Basic Information
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Body Style
                </td>
                {selectedVehicles.map(vehicle => (
                  <td 
                    key={`${vehicle.id}-body`} 
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                      highlightCell('bodyStyleId') ? 'bg-yellow-50' : ''
                    }`}
                  >
                    {vehicle.bodyStyleName}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Manufacturing Year
                </td>
                {selectedVehicles.map(vehicle => (
                  <td 
                    key={`${vehicle.id}-year`} 
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                      highlightCell('manufacturingStartYear') ? 'bg-yellow-50' : ''
                    }`}
                  >
                    {vehicle.manufacturingStartYear}
                    {vehicle.manufacturingEndYear ? ` - ${vehicle.manufacturingEndYear}` : ""}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Drive Type
                </td>
                {selectedVehicles.map(vehicle => (
                  <td 
                    key={`${vehicle.id}-drive`} 
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                      highlightCell('driveTypeName') ? 'bg-yellow-50' : ''
                    }`}
                  >
                    {vehicle.driveTypeName || "N/A"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Price
                </td>
                {selectedVehicles.map(vehicle => (
                  <td 
                    key={`${vehicle.id}-price`} 
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                      highlightCell('price') ? 'bg-yellow-50' : ''
                    }`}
                  >
                    {formatters.price(vehicle.price)}
                  </td>
                ))}
              </tr>

              {/* Performance Section */}
              <tr className="bg-gray-50">
                <td colSpan={selectedVehicles.length + 1} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Horsepower
                </td>
                {selectedVehicles.map(vehicle => (
                  <td 
                    key={`${vehicle.id}-hp`} 
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                      highlightCell('horsepower') ? 'bg-yellow-50' : ''
                    }`}
                  >
                    {formatters.power(vehicle.horsepower)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Torque
                </td>
                {selectedVehicles.map(vehicle => (
                  <td 
                    key={`${vehicle.id}-torque`} 
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                      highlightCell('torque') ? 'bg-yellow-50' : ''
                    }`}
                  >
                    {formatters.torque(vehicle.torque)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  0-100 km/h
                </td>
                {selectedVehicles.map(vehicle => (
                  <td 
                    key={`${vehicle.id}-accel`} 
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                      highlightCell('acceleration') ? 'bg-yellow-50' : ''
                    }`}
                  >
                    {formatters.acceleration(vehicle.acceleration)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Top Speed
                </td>
                {selectedVehicles.map(vehicle => (
                  <td 
                    key={`${vehicle.id}-top-speed`} 
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                      highlightCell('topSpeed') ? 'bg-yellow-50' : ''
                    }`}
                  >
                    {formatters.topSpeed(vehicle.topSpeed)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Weight
                </td>
                {selectedVehicles.map(vehicle => (
                  <td 
                    key={`${vehicle.id}-weight`} 
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                      highlightCell('weight') ? 'bg-yellow-50' : ''
                    }`}
                  >
                    {formatters.weight(vehicle.weight)}
                  </td>
                ))}
              </tr>

              {/* Battery Section */}
              <tr className="bg-gray-50">
                <td colSpan={selectedVehicles.length + 1} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Battery
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Battery Type
                </td>
                {selectedVehicles.map(vehicle => (
                  <td 
                    key={`${vehicle.id}-battery-type`} 
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                      highlightCell('batteryTypeName') ? 'bg-yellow-50' : ''
                    }`}
                  >
                    {vehicle.batteryTypeName || "N/A"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Total Capacity
                </td>
                {selectedVehicles.map(vehicle => (
                  <td 
                    key={`${vehicle.id}-capacity`} 
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                      highlightCell('batteryCapacity') ? 'bg-yellow-50' : ''
                    }`}
                  >
                    {formatters.battery(vehicle.batteryCapacity)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Usable Capacity
                </td>
                {selectedVehicles.map(vehicle => (
                  <td 
                    key={`${vehicle.id}-usable`} 
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                      highlightCell('usableBatteryCapacity') ? 'bg-yellow-50' : ''
                    }`}
                  >
                    {formatters.battery(vehicle.usableBatteryCapacity)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Battery Warranty
                </td>
                {selectedVehicles.map(vehicle => (
                  <td 
                    key={`${vehicle.id}-warranty`} 
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                      (highlightCell('batteryWarrantyYears') || highlightCell('batteryWarrantyKm')) ? 'bg-yellow-50' : ''
                    }`}
                  >
                    {formatters.warranty(vehicle.batteryWarrantyYears, vehicle.batteryWarrantyKm)}
                  </td>
                ))}
              </tr>

              {/* Range & Efficiency Section */}
              <tr className="bg-gray-50">
                <td colSpan={selectedVehicles.length + 1} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Range & Efficiency
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Official Range
                </td>
                {selectedVehicles.map(vehicle => (
                  <td 
                    key={`${vehicle.id}-official-range`} 
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                      highlightCell('officialRange') ? 'bg-yellow-50' : ''
                    }`}
                  >
                    {vehicle.officialRange ? `${vehicle.officialRange} km` : "N/A"}
                    {vehicle.rangeRatingSystem ? ` (${vehicle.rangeRatingSystem})` : ""}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Real-world Range
                </td>
                {selectedVehicles.map(vehicle => (
                  <td 
                    key={`${vehicle.id}-real-range`} 
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                      highlightCell('realWorldRange') ? 'bg-yellow-50' : ''
                    }`}
                  >
                    {formatters.range(vehicle.realWorldRange)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Efficiency
                </td>
                {selectedVehicles.map(vehicle => (
                  <td 
                    key={`${vehicle.id}-efficiency`} 
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                      highlightCell('efficiency') ? 'bg-yellow-50' : ''
                    }`}
                  >
                    {formatters.efficiency(vehicle.efficiency)}
                  </td>
                ))}
              </tr>

              {/* Charging Section */}
              <tr className="bg-gray-50">
                <td colSpan={selectedVehicles.length + 1} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Charging
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Fast Charging Capacity
                </td>
                {selectedVehicles.map(vehicle => (
                  <td 
                    key={`${vehicle.id}-fast-charge-cap`} 
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                      highlightCell('fastChargingCapacity') ? 'bg-yellow-50' : ''
                    }`}
                  >
                    {formatters.chargingCapacity(vehicle.fastChargingCapacity)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Fast Charging Time (10-80%)
                </td>
                {selectedVehicles.map(vehicle => (
                  <td 
                    key={`${vehicle.id}-fast-charge-time`} 
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                      highlightCell('fastChargingTime') ? 'bg-yellow-50' : ''
                    }`}
                  >
                    {formatters.chargingTime(vehicle.fastChargingTime)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Port Location
                </td>
                {selectedVehicles.map(vehicle => (
                  <td 
                    key={`${vehicle.id}-port-loc`} 
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                      highlightCell('chargingPortLocation') ? 'bg-yellow-50' : ''
                    }`}
                  >
                    {vehicle.chargingPortLocation || "N/A"}
                  </td>
                ))}
              </tr>

              {/* Features Section */}
              <tr className="bg-gray-50">
                <td colSpan={selectedVehicles.length + 1} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Features
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  V2L Support
                </td>
                {selectedVehicles.map(vehicle => (
                  <td 
                    key={`${vehicle.id}-v2l`} 
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                      highlightCell('v2lSupport') ? 'bg-yellow-50' : ''
                    }`}
                  >
                    {formatters.boolean(vehicle.v2lSupport)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  V2L Output Power
                </td>
                {selectedVehicles.map(vehicle => (
                  <td 
                    key={`${vehicle.id}-v2l-power`} 
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                      highlightCell('v2lOutputPower') ? 'bg-yellow-50' : ''
                    }`}
                  >
                    {vehicle.v2lSupport ? formatters.v2lPower(vehicle.v2lOutputPower) : "N/A"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}