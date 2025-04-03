#!/bin/bash

# Count current number of vehicles
echo "Current number of vehicles in the database:"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM vehicles;"

# Create temporary table and prepare SQL script
echo "Creating temporary table..."
psql $DATABASE_URL -f import-vehicles.sql

# Process CSV file
echo "Processing CSV file..."
FILENAME="attached_assets/vehicles_final.csv"

# Skip the header row
tail -n +2 "$FILENAME" | while IFS=, read -r manufacturer_name model_name variant_name battery_type drive_type battery_capacity usable_capacity warranty_years warranty_kms official_range range_rating_system real_range efficiency horsepower torque acceleration top_speed weight fast_charging_dc fast_charging_time v2l_output price; do
  # Remove quotes if they exist
  manufacturer_name=$(echo "$manufacturer_name" | tr -d '"')
  model_name=$(echo "$model_name" | tr -d '"')
  variant_name=$(echo "$variant_name" | tr -d '"')
  battery_type=$(echo "$battery_type" | tr -d '"')
  drive_type=$(echo "$drive_type" | tr -d '"')
  range_rating_system=$(echo "$range_rating_system" | tr -d '"')
  
  # Handle empty values
  if [ -z "$battery_capacity" ]; then battery_capacity="NULL"; fi
  if [ -z "$usable_capacity" ]; then usable_capacity="NULL"; fi
  if [ -z "$warranty_years" ]; then warranty_years="NULL"; fi
  if [ -z "$warranty_kms" ]; then warranty_kms="NULL"; fi
  if [ -z "$official_range" ]; then official_range="NULL"; fi
  if [ -z "$range_rating_system" ]; then range_rating_system="NULL"; else range_rating_system="'$range_rating_system'"; fi
  if [ -z "$real_range" ]; then real_range="NULL"; fi
  if [ -z "$efficiency" ]; then efficiency="NULL"; fi
  if [ -z "$horsepower" ]; then horsepower="NULL"; fi
  if [ -z "$torque" ]; then torque="NULL"; fi
  if [ -z "$acceleration" ]; then acceleration="NULL"; fi
  if [ -z "$top_speed" ]; then top_speed="NULL"; fi
  if [ -z "$weight" ]; then weight="NULL"; fi
  if [ -z "$fast_charging_dc" ]; then fast_charging_dc="NULL"; fi
  if [ -z "$fast_charging_time" ]; then fast_charging_time="NULL"; fi
  if [ -z "$v2l_output" ]; then v2l_output="NULL"; fi
  if [ -z "$price" ]; then price="NULL"; fi
  
  # Insert data into temporary table
  psql $DATABASE_URL -c "INSERT INTO temp_vehicles (
    manufacturer_name, model_name, variant_name, battery_type, drive_type,
    battery_capacity, usable_battery_capacity, battery_warranty_years, battery_warranty_km,
    official_range, range_rating_system, real_world_range, efficiency,
    horsepower, torque, acceleration, top_speed, weight,
    fast_charging_capacity, fast_charging_time, v2l_output_power, price
  ) VALUES (
    '$manufacturer_name', '$model_name', '$variant_name', '$battery_type', '$drive_type',
    $battery_capacity, $usable_capacity, $warranty_years, $warranty_kms,
    $official_range, $range_rating_system, $real_range, $efficiency,
    $horsepower, $torque, $acceleration, $top_speed, $weight,
    $fast_charging_dc, $fast_charging_time, $v2l_output, $price
  );"
done

# Now insert from temporary table to actual vehicles table
echo "Inserting vehicles from temporary table to vehicles table..."
psql $DATABASE_URL -c "
INSERT INTO vehicles (
  model_id,
  variant_name,
  drive_type_id,
  battery_type_id,
  battery_capacity,
  usable_battery_capacity,
  battery_warranty_years,
  battery_warranty_km,
  official_range,
  range_rating_id,
  real_world_range,
  efficiency,
  horsepower,
  torque,
  acceleration,
  top_speed,
  fast_charging_capacity,
  fast_charging_time,
  weight,
  v2l_support,
  v2l_output_power,
  price
)
SELECT 
  cm.id AS model_id,
  t.variant_name,
  dt.id AS drive_type_id,
  bt.id AS battery_type_id,
  t.battery_capacity,
  t.usable_battery_capacity,
  t.battery_warranty_years,
  t.battery_warranty_km,
  t.official_range,
  rrs.id AS range_rating_id,
  t.real_world_range,
  t.efficiency,
  t.horsepower,
  t.torque,
  t.acceleration,
  t.top_speed,
  t.fast_charging_capacity,
  t.fast_charging_time,
  t.weight,
  CASE WHEN t.v2l_output_power > 0 THEN true ELSE false END AS v2l_support,
  CASE WHEN t.v2l_output_power > 0 THEN t.v2l_output_power * 1000 ELSE NULL END AS v2l_output_power,
  t.price * 100000 AS price
FROM 
  temp_vehicles t
JOIN 
  manufacturers m ON t.manufacturer_name = m.name
JOIN 
  car_models cm ON t.model_name = cm.model_name AND cm.manufacturer_id = m.id
JOIN
  drive_types dt ON t.drive_type = dt.name
JOIN
  battery_types bt ON t.battery_type = bt.name
LEFT JOIN
  range_rating_systems rrs ON t.range_rating_system = rrs.name
WHERE
  NOT EXISTS (
    SELECT 1 FROM vehicles v 
    WHERE v.model_id = cm.id AND v.variant_name = t.variant_name
  );"

# Check how many vehicles we have now
echo "Final number of vehicles in the database:"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM vehicles;"