-- Drop existing tables if they exist
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS car_models;
DROP TABLE IF EXISTS manufacturers;
DROP TABLE IF EXISTS body_styles;
DROP TABLE IF EXISTS drive_types;
DROP TABLE IF EXISTS battery_types;
DROP TABLE IF EXISTS charging_port_locations;
DROP TABLE IF EXISTS range_rating_systems;
DROP TABLE IF EXISTS users;

-- Create reference tables
CREATE TABLE manufacturers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL
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

-- Create car models table
CREATE TABLE car_models (
  id SERIAL PRIMARY KEY,
  manufacturer_id INTEGER NOT NULL REFERENCES manufacturers(id),
  model_name TEXT NOT NULL,
  body_style_id INTEGER NOT NULL REFERENCES body_styles(id),
  image TEXT,
  charging_port_location_id INTEGER REFERENCES charging_port_locations(id),
  boot_space INTEGER,
  manufacturing_start_year INTEGER NOT NULL,
  manufacturing_end_year INTEGER,
  view_count INTEGER DEFAULT 0
);

-- Create vehicles table
CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  model_id INTEGER NOT NULL REFERENCES car_models(id),
  variant_name TEXT NOT NULL,
  drive_type_id INTEGER REFERENCES drive_types(id),
  battery_type_id INTEGER REFERENCES battery_types(id),
  battery_capacity DOUBLE PRECISION,
  usable_battery_capacity DOUBLE PRECISION,
  battery_warranty_years INTEGER,
  battery_warranty_km INTEGER,
  official_range INTEGER,
  range_rating_id INTEGER REFERENCES range_rating_systems(id),
  real_world_range INTEGER,
  efficiency DOUBLE PRECISION,
  horsepower INTEGER,
  torque INTEGER,
  acceleration DOUBLE PRECISION,
  top_speed INTEGER,
  fast_charging_capacity INTEGER,
  fast_charging_time INTEGER,
  weight INTEGER,
  v2l_support BOOLEAN DEFAULT FALSE,
  v2l_output_power INTEGER,
  price DOUBLE PRECISION
);

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- Insert a default admin user
INSERT INTO users (username, password) VALUES ('admin', '$2b$10$zJlA5aEjC3.cxGNDg7/1q.B0C3ZrOzjTjVuIKsI7e1pafVHT4n9Ji');

-- Import manufacturers data
INSERT INTO manufacturers (name, country) VALUES
('Audi', 'Germany'),
('BMW', 'Germany'),
('BYD', 'China'),
('Citroen', 'France'),
('Hyundai', 'South Korea'),
('Kia', 'South Korea'),
('Lotus', 'UK'),
('Mahindra', 'India'),
('Mercedes - Benz', 'Germany'),
('MG', 'China'),
('MINI', 'UK'),
('Porsche', 'Germany'),
('Rolls-Royce', 'UK'),
('Tata', 'India'),
('Volvo', 'Sweden');

-- Import body styles data
INSERT INTO body_styles (name) VALUES
('Coupe'),
('Sedan'),
('SUV'),
('MPV'),
('Hatchback');

-- Import drive types data
INSERT INTO drive_types (name) VALUES
('FWD'),
('RWD'),
('AWD');

-- Import battery types data
INSERT INTO battery_types (name) VALUES
('LFP'),
('NCA'),
('NCM');

-- Import range rating systems data
INSERT INTO range_rating_systems (name) VALUES
('ARAI'),
('WLTP'),
('MIDC'),
('NEDC');

-- Import car models with simplified data for initial setup
INSERT INTO car_models (model_name, manufacturer_id, body_style_id, image, boot_space, manufacturing_start_year, manufacturing_end_year) VALUES
-- Audi
('e-tron GT', 1, 1, 'https://res.cloudinary.com/dhsuta4gh/image/upload/v1743436832/e-tron-gt_udcslr.jpg', 490, 2021, NULL),
('Q8 e-tron', 1, 3, 'https://res.cloudinary.com/dhsuta4gh/image/upload/v1743436829/Audi_Q8-etron-2023-01_2x_nsavdq.jpg', 631, 2023, NULL),
('Q8 Sportback e-tron', 1, 3, 'https://res.cloudinary.com/dhsuta4gh/image/upload/v1743436830/Audi_Q8-etron-sportback-2023-20_2x_x66sa2.jpg', 590, 2023, NULL),
-- BMW
('iX1 LWB', 2, 3, 'https://res.cloudinary.com/dhsuta4gh/image/upload/v1743436832/ix1_vrwvbg.jpg', 490, 2025, NULL),
('i4', 2, 2, 'https://res.cloudinary.com/dhsuta4gh/image/upload/v1743436830/BMW_i4_eDrive40-08_2x_aunbpm.jpg', 470, 2022, NULL),
('i5', 2, 2, 'https://res.cloudinary.com/dhsuta4gh/image/upload/v1743436831/BMW_i5_M60_xDrive_Sedan-22_2x_aoe7wr.jpg', 490, 2024, NULL),
('iX', 2, 3, 'https://res.cloudinary.com/dhsuta4gh/image/upload/v1743436828/BMW_iX_2022-14_2x_yrrzku.jpg', 500, 2021, NULL),
('i7', 2, 2, 'https://res.cloudinary.com/dhsuta4gh/image/upload/v1743436830/BMW_i7_2022-05_2x_d7ndgt.jpg', 500, 2023, NULL),
-- BYD
('Atto 3', 3, 3, 'https://res.cloudinary.com/dhsuta4gh/image/upload/v1743436829/byd-atto3_dyxfdl.jpg', 440, 2024, NULL),
('eMax 7', 3, 4, 'https://res.cloudinary.com/dhsuta4gh/image/upload/v1743436829/byd_emax7_bfaref.jpg', 180, 2024, NULL),
('Seal', 3, 2, 'https://res.cloudinary.com/dhsuta4gh/image/upload/v1743436832/byd-seal_eiisuj.jpg', 453, 2024, NULL),
('Sealion 7', 3, 3, 'https://res.cloudinary.com/dhsuta4gh/image/upload/v1743436834/byd-sealion-7-charging-01-xl_bhtyfb.jpg', 578, 2024, NULL);

-- Sample vehicle variants
INSERT INTO vehicles (model_id, variant_name, drive_type_id, battery_type_id, battery_capacity, usable_battery_capacity, battery_warranty_years, battery_warranty_km, official_range, range_rating_id, real_world_range, efficiency, horsepower, torque, acceleration, top_speed, fast_charging_capacity, fast_charging_time, weight, v2l_support, v2l_output_power, price) VALUES
-- Audi e-tron GT
(1, 'RS', 3, 3, 93.4, 85, 8, 160000, 481, 2, 415, 225.06, 590, 830, 3.3, 250, 268, 21, 2420, FALSE, NULL, 19529000),
-- Audi Q8 e-tron
(2, '50', 3, 2, 95, 89, 8, 160000, 491, 2, 435, 218.39, 335.2, 664, 6, 200, 155, 28, 2585, FALSE, NULL, 11500000),
(2, '55', 3, 2, 114, 106, 8, 160000, 582, 2, 515, 221.36, 402, 664, 5.6, 200, 168, 31, 2585, FALSE, NULL, 12700000),
-- Audi Q8 Sportback e-tron
(3, '50', 3, 2, 95, 89, 8, 160000, 505, 2, 455, 208.79, 335.2, 664, 6, 200, 155, 28, 2585, FALSE, NULL, 11900000),
(3, '55', 3, 2, 114, 106, 8, 160000, 600, 2, 535, 213.08, 402, 664, 5.6, 200, 168, 31, 2585, FALSE, NULL, 13200000),
-- BMW iX1 LWB
(4, 'eDrive20L M Sport', 1, 3, 66.5, 64.7, 8, 160000, 531, 3, 400, 166.25, 201.2, 247, 8.6, 170, 130, 30, 2010, FALSE, NULL, 4900000),
-- BMW i4
(5, 'eDrive35', 2, 3, 70.2, 67, 8, 160000, 590, 2, 430, 163.26, 282, 430, 5.7, 190, 180, 31, 2065, FALSE, NULL, 7250000),
(5, 'eDrive40', 2, 3, 70.2, 67, 8, 160000, 590, 2, 430, 163.26, 340, 430, 5.7, 190, 180, 31, 2065, FALSE, NULL, 7750000);

-- Note: This is a simplified set for initial testing. We'll add the rest of the data after confirming this works.