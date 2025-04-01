import React from "react";

interface VehicleSpecItemProps {
  label: string;
  value: React.ReactNode;
}

export default function VehicleSpecItem({ label, value }: VehicleSpecItemProps) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
