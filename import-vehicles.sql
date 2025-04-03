-- This SQL script will import all vehicles from the CSV file

-- Create a temporary table to hold the CSV data
DROP TABLE IF EXISTS temp_vehicles;
CREATE TEMPORARY TABLE temp_vehicles (
  manufacturer_name TEXT,
  model_name TEXT,
  variant_name TEXT,
  battery_type TEXT,
  drive_type TEXT,
  battery_capacity REAL,
  usable_battery_capacity REAL,
  battery_warranty_years INTEGER,
  battery_warranty_km INTEGER,
  official_range REAL,
  range_rating_system TEXT,
  real_world_range REAL,
  efficiency REAL,
  horsepower REAL,
  torque REAL,
  acceleration REAL, -- 0-100
  top_speed REAL,
  weight REAL,
  fast_charging_capacity REAL, -- Fast Charging DC KW
  fast_charging_time REAL, -- 10-80 time
  v2l_output_power REAL, -- v2l output kw AC
  price REAL -- price (in lakhs)
);

-- Copy data from CSV file (manually using dedicated import script)
-- We'll use a bash script to populate this table

-- Now insert the vehicles into the actual table
-- First, get all required IDs from the lookup tables
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
  );

-- Show the results
SELECT COUNT(*) AS imported_count FROM vehicles;