import React from "react";
import { Link } from "wouter";
import VehicleSpecItem from "./vehicle-spec-item";
import { VehicleWithDetails } from "@shared/types";
import { useComparison } from "../hooks/use-comparison";
import { formatPrice } from "../lib/filterHelpers";
import { CheckIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

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
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300 h-full">
      <div className="flex flex-col md:flex-row h-full">
        {/* Vehicle Image - Fill entire height in desktop view without margins */}
        <div className="relative cursor-pointer md:w-1/3 overflow-hidden h-auto" style={{ padding: 0 }}>
          <Link href={`/vehicles/${vehicle.id}`} className="block h-full">
            <div className="h-full w-full bg-muted/30" style={{ 
              aspectRatio: '16/9', 
              padding: 0, 
              margin: 0, 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <img
                src={vehicle.image || "https://www.svgrepo.com/show/508699/landscape-placeholder.svg"}
                alt={`${vehicle.manufacturerName} ${vehicle.modelName} ${vehicle.variantName}`}
                style={{ 
                  position: 'absolute',
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
              />
            </div>
          </Link>
          <div className="absolute top-2 right-2">
            <div
              className={`h-6 w-6 rounded-sm border ${
                selected 
                  ? 'bg-accent border-accent/80' 
                  : 'bg-background border-border hover:border-accent/60'
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
        <div className="flex-1 p-3 md:p-4">
          <div className="flex flex-col md:flex-row md:justify-between">
            <div>
              <Link href={`/vehicles/${vehicle.id}`}>
                <h2 className="text-lg font-medium text-primary hover:text-accent cursor-pointer font-styreneB">
                  {vehicle.manufacturerName} {vehicle.modelName} {vehicle.variantName}
                </h2>
              </Link>
              <p className="text-xs text-muted-foreground mb-2 font-tiempos">
                {vehicle.bodyStyleName} • {vehicle.manufacturingStartYear}
                {vehicle.manufacturingEndYear ? `-${vehicle.manufacturingEndYear}` : ""}
              </p>
            </div>
            <div className="mt-1 md:mt-0 inline-flex md:flex-col items-center md:items-end">
              <span className="text-lg font-medium text-primary font-styreneB">
                {formatPrice(vehicle.price)}
              </span>
              <span className="ml-2 md:ml-0 text-xs text-muted-foreground font-tiempos">Ex-showroom</span>
            </div>
          </div>

          {/* First row: Real Range, Battery, Charging Time, Efficiency, Battery Type */}
          <div className="mt-2 grid grid-cols-5 gap-1 text-xs">
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
          <div className="mt-2 grid grid-cols-5 gap-1 text-xs">
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

          <div className="mt-3 flex w-full gap-2">
            <Link href={`/vehicles/${vehicle.id}`} className="w-full md:w-auto">
              <Button variant="default" className="w-full md:w-auto bg-black hover:bg-black/90 text-white">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
