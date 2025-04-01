import React, { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { VehicleWithDetails } from "@shared/types";

interface RangeEstimatorProps {
  vehicle: VehicleWithDetails;
  officialRange: number | null;
  realWorldRange: number | null;
}

// Constants for range estimation
const TEMPERATURE_IMPACT = {
  hot: 0.90, // 10% reduction in hot weather
  normal: 1.0, // No impact in normal weather
  cold: 0.80, // 20% reduction in cold weather
};

const DRIVING_STYLE_IMPACT = {
  eco: 1.10, // 10% increase with eco driving
  normal: 1.0, // No impact with normal driving
  sporty: 0.85, // 15% reduction with sporty driving
};

const AC_USAGE_IMPACT = {
  off: 1.0, // No impact with AC off
  low: 0.95, // 5% reduction with low AC
  high: 0.85, // 15% reduction with high AC
};

const ROAD_CONDITION_IMPACT = {
  city: 1.0, // Reference point for city driving
  highway: 0.90, // 10% reduction on highways (higher speed)
  hilly: 0.75, // 25% reduction in hilly terrain
};

export default function RangeEstimator({ vehicle, officialRange, realWorldRange }: RangeEstimatorProps) {
  // State for range estimator
  const [temperature, setTemperature] = useState<"cold" | "normal" | "hot">("normal");
  const [drivingStyle, setDrivingStyle] = useState<"eco" | "normal" | "sporty">("normal");
  const [acUsage, setAcUsage] = useState<"off" | "low" | "high">("low");
  const [roadCondition, setRoadCondition] = useState<"city" | "highway" | "hilly">("city");
  const [speed, setSpeed] = useState(60); // Default average speed in km/h
  const [estimatedRange, setEstimatedRange] = useState<number | null>(null);

  // Calculate estimated range whenever any of the factors change
  useEffect(() => {
    if (!realWorldRange) {
      // If no real world range available, use official range with a typical adjustment
      const baseRange = officialRange ? officialRange * 0.85 : null;
      
      if (!baseRange) {
        setEstimatedRange(null);
        return;
      }
      
      // Calculate estimated range based on all factors
      const calculatedRange = Math.round(
        baseRange *
        TEMPERATURE_IMPACT[temperature] *
        DRIVING_STYLE_IMPACT[drivingStyle] *
        AC_USAGE_IMPACT[acUsage] *
        ROAD_CONDITION_IMPACT[roadCondition] *
        (speed <= 60 ? 1 : (1 - ((speed - 60) * 0.005))) // Speed impact: -0.5% for each km/h above 60
      );
      
      setEstimatedRange(calculatedRange);
    } else {
      // Use real world range as the base if available
      // Calculate estimated range based on all factors
      const calculatedRange = Math.round(
        realWorldRange *
        TEMPERATURE_IMPACT[temperature] *
        DRIVING_STYLE_IMPACT[drivingStyle] *
        AC_USAGE_IMPACT[acUsage] *
        ROAD_CONDITION_IMPACT[roadCondition] *
        (speed <= 60 ? 1 : (1 - ((speed - 60) * 0.005))) // Speed impact: -0.5% for each km/h above 60
      );
      
      setEstimatedRange(calculatedRange);
    }
  }, [officialRange, realWorldRange, temperature, drivingStyle, acUsage, roadCondition, speed]);

  // Base range text to show which range is being used
  const baseRangeText = realWorldRange 
    ? `Based on real-world range of ${realWorldRange} km`
    : officialRange 
      ? `Based on adjusted official range (${officialRange} km × 0.85)`
      : "No range data available";

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      {(!officialRange && !realWorldRange) ? (
        <div className="text-center p-6 text-gray-500">
          Range data not available for this vehicle
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h4 className="text-lg font-medium text-gray-900">Estimated Range:</h4>
              <p className="text-sm text-gray-500">{baseRangeText}</p>
            </div>
            <div className="mt-2 md:mt-0">
              <span className="text-3xl font-bold text-primary-600">
                {estimatedRange ? `${estimatedRange} km` : "Calculating..."}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weather/Temperature */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Temperature</label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setTemperature("cold")}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${
                    temperature === "cold"
                      ? "bg-primary-100 text-primary-800 border-primary-300 border"
                      : "bg-white text-gray-700 border-gray-300 border hover:bg-gray-50"
                  }`}
                >
                  Cold
                </button>
                <button
                  type="button"
                  onClick={() => setTemperature("normal")}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${
                    temperature === "normal"
                      ? "bg-primary-100 text-primary-800 border-primary-300 border"
                      : "bg-white text-gray-700 border-gray-300 border hover:bg-gray-50"
                  }`}
                >
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => setTemperature("hot")}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${
                    temperature === "hot"
                      ? "bg-primary-100 text-primary-800 border-primary-300 border"
                      : "bg-white text-gray-700 border-gray-300 border hover:bg-gray-50"
                  }`}
                >
                  Hot
                </button>
              </div>
            </div>

            {/* Driving Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Driving Style</label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setDrivingStyle("eco")}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${
                    drivingStyle === "eco"
                      ? "bg-green-100 text-green-800 border-green-300 border"
                      : "bg-white text-gray-700 border-gray-300 border hover:bg-gray-50"
                  }`}
                >
                  Eco
                </button>
                <button
                  type="button"
                  onClick={() => setDrivingStyle("normal")}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${
                    drivingStyle === "normal"
                      ? "bg-primary-100 text-primary-800 border-primary-300 border"
                      : "bg-white text-gray-700 border-gray-300 border hover:bg-gray-50"
                  }`}
                >
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => setDrivingStyle("sporty")}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${
                    drivingStyle === "sporty"
                      ? "bg-amber-100 text-amber-800 border-amber-300 border"
                      : "bg-white text-gray-700 border-gray-300 border hover:bg-gray-50"
                  }`}
                >
                  Sporty
                </button>
              </div>
            </div>

            {/* AC Usage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Climate Control</label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setAcUsage("off")}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${
                    acUsage === "off"
                      ? "bg-primary-100 text-primary-800 border-primary-300 border"
                      : "bg-white text-gray-700 border-gray-300 border hover:bg-gray-50"
                  }`}
                >
                  Off
                </button>
                <button
                  type="button"
                  onClick={() => setAcUsage("low")}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${
                    acUsage === "low"
                      ? "bg-primary-100 text-primary-800 border-primary-300 border"
                      : "bg-white text-gray-700 border-gray-300 border hover:bg-gray-50"
                  }`}
                >
                  Low
                </button>
                <button
                  type="button"
                  onClick={() => setAcUsage("high")}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${
                    acUsage === "high"
                      ? "bg-primary-100 text-primary-800 border-primary-300 border"
                      : "bg-white text-gray-700 border-gray-300 border hover:bg-gray-50"
                  }`}
                >
                  High
                </button>
              </div>
            </div>

            {/* Road Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Road Type</label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setRoadCondition("city")}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${
                    roadCondition === "city"
                      ? "bg-primary-100 text-primary-800 border-primary-300 border"
                      : "bg-white text-gray-700 border-gray-300 border hover:bg-gray-50"
                  }`}
                >
                  City
                </button>
                <button
                  type="button"
                  onClick={() => setRoadCondition("highway")}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${
                    roadCondition === "highway"
                      ? "bg-primary-100 text-primary-800 border-primary-300 border"
                      : "bg-white text-gray-700 border-gray-300 border hover:bg-gray-50"
                  }`}
                >
                  Highway
                </button>
                <button
                  type="button"
                  onClick={() => setRoadCondition("hilly")}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${
                    roadCondition === "hilly"
                      ? "bg-primary-100 text-primary-800 border-primary-300 border"
                      : "bg-white text-gray-700 border-gray-300 border hover:bg-gray-50"
                  }`}
                >
                  Hilly
                </button>
              </div>
            </div>
          </div>

          {/* Average Speed Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Average Speed: {speed} km/h</label>
            </div>
            <Slider
              value={[speed]}
              min={20}
              max={120}
              step={5}
              onValueChange={(value) => setSpeed(value[0])}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>20 km/h</span>
              <span>120 km/h</span>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> This range estimator provides approximate values based on typical EV performance characteristics.
              Actual range may vary based on numerous factors including driving behavior, traffic conditions, 
              vehicle maintenance, battery health, and more.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
