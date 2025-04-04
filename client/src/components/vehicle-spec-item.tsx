import React from "react";

interface VehicleSpecItemProps {
  label: string;
  value: React.ReactNode;
}

export default function VehicleSpecItem({ label, value }: VehicleSpecItemProps) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-muted-foreground font-tiempos">{label}</span>
      <span className="font-medium text-foreground font-styreneA">{value}</span>
    </div>
  );
}
