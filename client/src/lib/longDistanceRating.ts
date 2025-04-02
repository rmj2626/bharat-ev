/**
 * Utility functions for calculating long distance travel metrics
 */

interface LongDistanceMetrics {
  leg1DistanceKm: number;
  leg2DistanceKm: number;
  oneStopRangeKm: number;
  starRating: number;
  leg1DurationStr: string;
  leg2DurationStr: string;
  totalDurationStr: string;
  canFastCharge: boolean;
}

/**
 * Calculates the long distance travel metrics for a vehicle
 * @param realRangeKm The real world range in km
 * @param time10To80Min The time for fast charging from 10% to 80% SoC in minutes
 * @param useableCapacityKwh The usable battery capacity in kWh
 * @returns The long distance metrics object
 */
export function calculateLongDistanceMetrics(
  realRangeKm: number | null,
  time10To80Min: number | null,
  useableCapacityKwh: number | null
): LongDistanceMetrics | null {
  // Return null if required data is missing
  if (!realRangeKm) {
    return null;
  }

  // Check if fast charging is available - both values must be positive
  const canFastCharge = Boolean(time10To80Min && time10To80Min > 0 && useableCapacityKwh && useableCapacityKwh > 0);
  
  // Calculate Leg 1 Distance
  const leg1DistanceKm = parseFloat((realRangeKm * 0.9).toFixed(1));
  
  // Calculate Leg 2 Distance
  let leg2DistanceKm = 0;
  if (canFastCharge && time10To80Min) {
    leg2DistanceKm = parseFloat(((10.5 * realRangeKm) / time10To80Min).toFixed(1));
  }
  
  // Calculate One-Stop Range
  const oneStopRangeKm = parseFloat((leg1DistanceKm + leg2DistanceKm).toFixed(1));
  
  // Calculate Star Rating
  let rating = 0;
  if (oneStopRangeKm < 200) {
    rating = 0;
  } else if (oneStopRangeKm < 325) {
    rating = 1.0 + (oneStopRangeKm - 200) / 125.0;
  } else if (oneStopRangeKm < 450) {
    rating = 2.0 + (oneStopRangeKm - 325) / 125.0;
  } else if (oneStopRangeKm < 575) {
    rating = 3.0 + (oneStopRangeKm - 450) / 125.0;
  } else if (oneStopRangeKm < 700) {
    rating = 4.0 + (oneStopRangeKm - 575) / 125.0;
  } else {
    rating = 5.0;
  }
  
  // Round to nearest 0.5
  const starRating = Math.round(rating * 2) / 2.0;
  
  // Calculate durations
  const avgSpeedKmh = 70; // Average speed for highway travel
  
  // Calculate efficiency if available, but not used in this version
  const efficiencyKwhPerKm = useableCapacityKwh && realRangeKm 
    ? useableCapacityKwh / realRangeKm 
    : null;
  
  const leg1DurationHours = leg1DistanceKm / avgSpeedKmh;
  const leg2DurationHours = leg2DistanceKm > 0 ? leg2DistanceKm / avgSpeedKmh : 0;
  const chargingStopDurationHours = canFastCharge ? 0.25 : 0; // 15 minutes
  
  const totalDurationHours = leg1DurationHours + chargingStopDurationHours + leg2DurationHours;
  
  // Format durations
  const leg1DurationStr = formatDuration(leg1DurationHours);
  const leg2DurationStr = leg2DistanceKm > 0 ? formatDuration(leg2DurationHours) : "N/A";
  const totalDurationStr = formatDuration(totalDurationHours);
  
  return {
    leg1DistanceKm,
    leg2DistanceKm,
    oneStopRangeKm,
    starRating,
    leg1DurationStr,
    leg2DurationStr,
    totalDurationStr,
    canFastCharge
  };
}

/**
 * Formats a duration in hours to a string in the format "Xh Ymin"
 * @param hours The duration in hours
 * @returns The formatted duration string
 */
export function formatDuration(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const min = totalMinutes % 60;
  
  if (h === 0) {
    return `${min}min`;
  } else if (min === 0) {
    return `${h}h`;
  } else {
    return `${h}h ${min}min`;
  }
}

/**
 * Generates star rating display based on the rating value
 * @param rating The rating value (0-5)
 * @returns JSX element with stars
 */
export function generateStarRating(rating: number) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  const stars = [];
  
  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push("★");
  }
  
  // Add half star if needed
  if (hasHalfStar) {
    stars.push("⯨");
  }
  
  // Add empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars.push("☆");
  }
  
  return stars.join("");
}