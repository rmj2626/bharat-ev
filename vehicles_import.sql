-- Create a temporary table to hold the CSV data
CREATE TEMPORARY TABLE temp_vehicles (
  manufacturer_name TEXT,
  model_name TEXT,
  variant_name TEXT,
  battery_type TEXT,
  drive_type TEXT,
  battery_capacity TEXT,
  usable_battery_capacity TEXT,
  battery_warranty_years TEXT,
  battery_warranty_km TEXT,
  official_range TEXT,
  range_rating_system TEXT,
  real_world_range TEXT,
  efficiency TEXT,
  horsepower TEXT,
  torque TEXT,
  acceleration TEXT,
  top_speed TEXT,
  weight TEXT,
  fast_charging_capacity TEXT,
  fast_charging_time TEXT,
  v2l_output_power TEXT,
  price TEXT
);

-- Copy data from CSV file (this will be done in the bash wrapper script)
-- COPY temp_vehicles FROM '/attached_assets/vehicles_final.csv' WITH CSV HEADER;

-- Insert data from temp_vehicles into vehicles table
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
  NULLIF(t.battery_capacity, '')::FLOAT,
  NULLIF(t.usable_battery_capacity, '')::FLOAT,
  NULLIF(t.battery_warranty_years, '')::INTEGER,
  NULLIF(t.battery_warranty_km, '')::INTEGER,
  NULLIF(t.official_range, '')::FLOAT,
  rrs.id AS range_rating_id,
  NULLIF(t.real_world_range, '')::FLOAT,
  NULLIF(t.efficiency, '')::FLOAT,
  NULLIF(t.horsepower, '')::FLOAT,
  NULLIF(t.torque, '')::FLOAT,
  NULLIF(t.acceleration, '')::FLOAT,
  NULLIF(t.top_speed, '')::FLOAT,
  NULLIF(t.fast_charging_capacity, '')::FLOAT,
  NULLIF(t.fast_charging_time, '')::FLOAT,
  NULLIF(t.weight, '')::FLOAT,
  CASE WHEN NULLIF(t.v2l_output_power, '')::FLOAT > 0 THEN true ELSE false END AS v2l_support,
  CASE WHEN NULLIF(t.v2l_output_power, '')::FLOAT > 0 THEN NULLIF(t.v2l_output_power, '')::FLOAT * 1000 ELSE NULL END AS v2l_output_power,
  CASE WHEN t.price IS NOT NULL AND t.price != '' THEN NULLIF(t.price, '')::FLOAT * 100000 ELSE NULL END AS price
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

-- Show count of vehicles
SELECT COUNT(*) AS total_vehicles FROM vehicles;