import React from "react";

interface VehicleSpecItemProps {
  label: string;
  value: React.ReactNode;
}

export default function VehicleSpecItem({ label, value }: VehicleSpecItemProps) {
  return (
    <div className="flex flex-col">
      <span className="text-xs font-medium text-foreground font-styreneA leading-tight">{label}</span>
      <span className="text-muted-foreground font-tiempos text-xs leading-tight mt-0.5">{value}</span>
    </div>
  );
}
