-- Drop tables if they exist
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS car_models;
DROP TABLE IF EXISTS manufacturers;
DROP TABLE IF EXISTS body_styles;
DROP TABLE IF EXISTS drive_types;
DROP TABLE IF EXISTS battery_types;
DROP TABLE IF EXISTS charging_port_locations;
DROP TABLE IF EXISTS range_rating_systems;
DROP TABLE IF EXISTS users;

-- Create tables
CREATE TABLE manufacturers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT
);

CREATE TABLE body_styles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE drive_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE battery_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE charging_port_locations (
  id SERIAL PRIMARY KEY,
  location TEXT NOT NULL
);

CREATE TABLE range_rating_systems (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE car_models (
  id SERIAL PRIMARY KEY,
  manufacturer_id INTEGER NOT NULL REFERENCES manufacturers(id) ON DELETE CASCADE,
  model_name TEXT NOT NULL,
  body_style_id INTEGER NOT NULL REFERENCES body_styles(id),
  image TEXT,
  charging_port_location_id INTEGER REFERENCES charging_port_locations(id),
  boot_space INTEGER,
  manufacturing_start_year INTEGER NOT NULL,
  manufacturing_end_year INTEGER,
  view_count INTEGER DEFAULT 0
);

CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  model_id INTEGER NOT NULL REFERENCES car_models(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL,
  drive_type_id INTEGER REFERENCES drive_types(id),
  battery_type_id INTEGER REFERENCES battery_types(id),
  battery_capacity NUMERIC,
  usable_battery_capacity NUMERIC,
  battery_warranty_years INTEGER,
  battery_warranty_km INTEGER,
  official_range NUMERIC,
  range_rating_id INTEGER REFERENCES range_rating_systems(id),
  real_world_range NUMERIC,
  efficiency NUMERIC,
  horsepower NUMERIC,
  torque NUMERIC,
  acceleration NUMERIC,
  top_speed NUMERIC,
  fast_charging_capacity NUMERIC,
  fast_charging_time NUMERIC,
  weight NUMERIC,
  v2l_support BOOLEAN DEFAULT FALSE,
  v2l_output_power NUMERIC,
  price NUMERIC
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_vehicles_model_id ON vehicles(model_id);
CREATE INDEX idx_car_models_manufacturer_id ON car_models(manufacturer_id);
CREATE INDEX idx_car_models_body_style_id ON car_models(body_style_id);