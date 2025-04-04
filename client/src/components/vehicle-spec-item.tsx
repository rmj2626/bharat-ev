import React from "react";

interface VehicleSpecItemProps {
  label: string;
  value: React.ReactNode;
}

export default function VehicleSpecItem({ label, value }: VehicleSpecItemProps) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground font-tiempos leading-tight">{label}</span>
      <span className="font-medium text-foreground font-styreneA text-xs leading-tight mt-0.5">{value}</span>
    </div>
  );
}
