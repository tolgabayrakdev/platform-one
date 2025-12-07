-- =============================================
-- ARAÇ MARKA VE MODEL VERİLERİ
-- =============================================
-- Bu dosyayı database.sql'den sonra çalıştırın
-- Türkiye'de yaygın olan araç markaları ve modelleri

-- =============================================
-- ARAÇ MARKALARI
-- =============================================

INSERT INTO brands (name) VALUES 
    ('Fiat'),
    ('Renault'),
    ('Volkswagen'),
    ('Ford'),
    ('Opel'),
    ('Peugeot'),
    ('Toyota'),
    ('Hyundai'),
    ('Mercedes-Benz'),
    ('BMW'),
    ('Audi'),
    ('Seat'),
    ('Skoda'),
    ('Dacia'),
    ('Citroën'),
    ('Nissan'),
    ('Honda'),
    ('Mazda'),
    ('Kia'),
    ('Chevrolet'),
    ('Volvo'),
    ('Mini'),
    ('Jeep'),
    ('Land Rover'),
    ('Range Rover'),
    ('Porsche'),
    ('Jaguar'),
    ('Lexus'),
    ('Infiniti'),
    ('Alfa Romeo'),
    ('DS'),
    ('Cupra'),
    ('MG'),
    ('BYD'),
    ('Tesla'),
    ('Togg');

-- =============================================
-- ARAÇ MODELLERİ
-- =============================================

-- Fiat Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'Fiat'), 'Punto'),
    ((SELECT id FROM brands WHERE name = 'Fiat'), 'Egea'),
    ((SELECT id FROM brands WHERE name = 'Fiat'), 'Doblo'),
    ((SELECT id FROM brands WHERE name = 'Fiat'), 'Fiorino'),
    ((SELECT id FROM brands WHERE name = 'Fiat'), 'Tipo'),
    ((SELECT id FROM brands WHERE name = 'Fiat'), '500'),
    ((SELECT id FROM brands WHERE name = 'Fiat'), '500L'),
    ((SELECT id FROM brands WHERE name = 'Fiat'), '500X'),
    ((SELECT id FROM brands WHERE name = 'Fiat'), 'Panda'),
    ((SELECT id FROM brands WHERE name = 'Fiat'), 'Linea');

-- Renault Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'Renault'), 'Clio'),
    ((SELECT id FROM brands WHERE name = 'Renault'), 'Megane'),
    ((SELECT id FROM brands WHERE name = 'Renault'), 'Fluence'),
    ((SELECT id FROM brands WHERE name = 'Renault'), 'Symbol'),
    ((SELECT id FROM brands WHERE name = 'Renault'), 'Kangoo'),
    ((SELECT id FROM brands WHERE name = 'Renault'), 'Scenic'),
    ((SELECT id FROM brands WHERE name = 'Renault'), 'Kadjar'),
    ((SELECT id FROM brands WHERE name = 'Renault'), 'Captur'),
    ((SELECT id FROM brands WHERE name = 'Renault'), 'Talisman'),
    ((SELECT id FROM brands WHERE name = 'Renault'), 'Espace'),
    ((SELECT id FROM brands WHERE name = 'Renault'), 'Koleos'),
    ((SELECT id FROM brands WHERE name = 'Renault'), 'Twingo'),
    ((SELECT id FROM brands WHERE name = 'Renault'), 'Talisman');

-- Volkswagen Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'Volkswagen'), 'Golf'),
    ((SELECT id FROM brands WHERE name = 'Volkswagen'), 'Polo'),
    ((SELECT id FROM brands WHERE name = 'Volkswagen'), 'Passat'),
    ((SELECT id FROM brands WHERE name = 'Volkswagen'), 'Jetta'),
    ((SELECT id FROM brands WHERE name = 'Volkswagen'), 'Tiguan'),
    ((SELECT id FROM brands WHERE name = 'Volkswagen'), 'Touareg'),
    ((SELECT id FROM brands WHERE name = 'Volkswagen'), 'Arteon'),
    ((SELECT id FROM brands WHERE name = 'Volkswagen'), 'T-Cross'),
    ((SELECT id FROM brands WHERE name = 'Volkswagen'), 'T-Roc'),
    ((SELECT id FROM brands WHERE name = 'Volkswagen'), 'Touran'),
    ((SELECT id FROM brands WHERE name = 'Volkswagen'), 'Sharan'),
    ((SELECT id FROM brands WHERE name = 'Volkswagen'), 'Amarok'),
    ((SELECT id FROM brands WHERE name = 'Volkswagen'), 'Caddy'),
    ((SELECT id FROM brands WHERE name = 'Volkswagen'), 'Transporter'),
    ((SELECT id FROM brands WHERE name = 'Volkswagen'), 'Caravelle');

-- Ford Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'Ford'), 'Focus'),
    ((SELECT id FROM brands WHERE name = 'Ford'), 'Fiesta'),
    ((SELECT id FROM brands WHERE name = 'Ford'), 'Mondeo'),
    ((SELECT id FROM brands WHERE name = 'Ford'), 'Kuga'),
    ((SELECT id FROM brands WHERE name = 'Ford'), 'Transit'),
    ((SELECT id FROM brands WHERE name = 'Ford'), 'Ecosport'),
    ((SELECT id FROM brands WHERE name = 'Ford'), 'Edge'),
    ((SELECT id FROM brands WHERE name = 'Ford'), 'Explorer'),
    ((SELECT id FROM brands WHERE name = 'Ford'), 'Mustang'),
    ((SELECT id FROM brands WHERE name = 'Ford'), 'Ranger'),
    ((SELECT id FROM brands WHERE name = 'Ford'), 'Tourneo'),
    ((SELECT id FROM brands WHERE name = 'Ford'), 'S-Max'),
    ((SELECT id FROM brands WHERE name = 'Ford'), 'Galaxy');

-- Opel Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'Opel'), 'Corsa'),
    ((SELECT id FROM brands WHERE name = 'Opel'), 'Astra'),
    ((SELECT id FROM brands WHERE name = 'Opel'), 'Insignia'),
    ((SELECT id FROM brands WHERE name = 'Opel'), 'Crossland'),
    ((SELECT id FROM brands WHERE name = 'Opel'), 'Combo'),
    ((SELECT id FROM brands WHERE name = 'Opel'), 'Grandland'),
    ((SELECT id FROM brands WHERE name = 'Opel'), 'Mokka'),
    ((SELECT id FROM brands WHERE name = 'Opel'), 'Zafira'),
    ((SELECT id FROM brands WHERE name = 'Opel'), 'Vivaro'),
    ((SELECT id FROM brands WHERE name = 'Opel'), 'Movano');

-- Peugeot Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'Peugeot'), '208'),
    ((SELECT id FROM brands WHERE name = 'Peugeot'), '301'),
    ((SELECT id FROM brands WHERE name = 'Peugeot'), '308'),
    ((SELECT id FROM brands WHERE name = 'Peugeot'), '408'),
    ((SELECT id FROM brands WHERE name = 'Peugeot'), '508'),
    ((SELECT id FROM brands WHERE name = 'Peugeot'), '2008'),
    ((SELECT id FROM brands WHERE name = 'Peugeot'), '3008'),
    ((SELECT id FROM brands WHERE name = 'Peugeot'), '5008'),
    ((SELECT id FROM brands WHERE name = 'Peugeot'), 'Partner'),
    ((SELECT id FROM brands WHERE name = 'Peugeot'), 'Expert'),
    ((SELECT id FROM brands WHERE name = 'Peugeot'), 'Boxer'),
    ((SELECT id FROM brands WHERE name = 'Peugeot'), 'Rifter');

-- Toyota Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'Corolla'),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'Yaris'),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'Auris'),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'Camry'),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'RAV4'),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'C-HR'),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'Highlander'),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'Land Cruiser'),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'Hilux'),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'Proace'),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'Prius'),
    ((SELECT id FROM brands WHERE name = 'Toyota'), 'Avensis');

-- Hyundai Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'Hyundai'), 'i20'),
    ((SELECT id FROM brands WHERE name = 'Hyundai'), 'i30'),
    ((SELECT id FROM brands WHERE name = 'Hyundai'), 'Elantra'),
    ((SELECT id FROM brands WHERE name = 'Hyundai'), 'Sonata'),
    ((SELECT id FROM brands WHERE name = 'Hyundai'), 'Tucson'),
    ((SELECT id FROM brands WHERE name = 'Hyundai'), 'Santa Fe'),
    ((SELECT id FROM brands WHERE name = 'Hyundai'), 'Kona'),
    ((SELECT id FROM brands WHERE name = 'Hyundai'), 'Bayon'),
    ((SELECT id FROM brands WHERE name = 'Hyundai'), 'Ioniq'),
    ((SELECT id FROM brands WHERE name = 'Hyundai'), 'H-1'),
    ((SELECT id FROM brands WHERE name = 'Hyundai'), 'Accent'),
    ((SELECT id FROM brands WHERE name = 'Hyundai'), 'i10');

-- Mercedes-Benz Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'Mercedes-Benz'), 'A-Class'),
    ((SELECT id FROM brands WHERE name = 'Mercedes-Benz'), 'B-Class'),
    ((SELECT id FROM brands WHERE name = 'Mercedes-Benz'), 'C-Class'),
    ((SELECT id FROM brands WHERE name = 'Mercedes-Benz'), 'E-Class'),
    ((SELECT id FROM brands WHERE name = 'Mercedes-Benz'), 'S-Class'),
    ((SELECT id FROM brands WHERE name = 'Mercedes-Benz'), 'GLA'),
    ((SELECT id FROM brands WHERE name = 'Mercedes-Benz'), 'GLB'),
    ((SELECT id FROM brands WHERE name = 'Mercedes-Benz'), 'GLC'),
    ((SELECT id FROM brands WHERE name = 'Mercedes-Benz'), 'GLE'),
    ((SELECT id FROM brands WHERE name = 'Mercedes-Benz'), 'GLS'),
    ((SELECT id FROM brands WHERE name = 'Mercedes-Benz'), 'G-Class'),
    ((SELECT id FROM brands WHERE name = 'Mercedes-Benz'), 'Vito'),
    ((SELECT id FROM brands WHERE name = 'Mercedes-Benz'), 'Sprinter'),
    ((SELECT id FROM brands WHERE name = 'Mercedes-Benz'), 'V-Class'),
    ((SELECT id FROM brands WHERE name = 'Mercedes-Benz'), 'CLA'),
    ((SELECT id FROM brands WHERE name = 'Mercedes-Benz'), 'CLS'),
    ((SELECT id FROM brands WHERE name = 'Mercedes-Benz'), 'AMG GT');

-- BMW Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'BMW'), '1 Series'),
    ((SELECT id FROM brands WHERE name = 'BMW'), '2 Series'),
    ((SELECT id FROM brands WHERE name = 'BMW'), '3 Series'),
    ((SELECT id FROM brands WHERE name = 'BMW'), '4 Series'),
    ((SELECT id FROM brands WHERE name = 'BMW'), '5 Series'),
    ((SELECT id FROM brands WHERE name = 'BMW'), '6 Series'),
    ((SELECT id FROM brands WHERE name = 'BMW'), '7 Series'),
    ((SELECT id FROM brands WHERE name = 'BMW'), 'X1'),
    ((SELECT id FROM brands WHERE name = 'BMW'), 'X2'),
    ((SELECT id FROM brands WHERE name = 'BMW'), 'X3'),
    ((SELECT id FROM brands WHERE name = 'BMW'), 'X4'),
    ((SELECT id FROM brands WHERE name = 'BMW'), 'X5'),
    ((SELECT id FROM brands WHERE name = 'BMW'), 'X6'),
    ((SELECT id FROM brands WHERE name = 'BMW'), 'X7'),
    ((SELECT id FROM brands WHERE name = 'BMW'), 'Z4'),
    ((SELECT id FROM brands WHERE name = 'BMW'), 'iX'),
    ((SELECT id FROM brands WHERE name = 'BMW'), 'i4'),
    ((SELECT id FROM brands WHERE name = 'BMW'), 'iX3');

-- Audi Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'Audi'), 'A1'),
    ((SELECT id FROM brands WHERE name = 'Audi'), 'A3'),
    ((SELECT id FROM brands WHERE name = 'Audi'), 'A4'),
    ((SELECT id FROM brands WHERE name = 'Audi'), 'A5'),
    ((SELECT id FROM brands WHERE name = 'Audi'), 'A6'),
    ((SELECT id FROM brands WHERE name = 'Audi'), 'A7'),
    ((SELECT id FROM brands WHERE name = 'Audi'), 'A8'),
    ((SELECT id FROM brands WHERE name = 'Audi'), 'Q2'),
    ((SELECT id FROM brands WHERE name = 'Audi'), 'Q3'),
    ((SELECT id FROM brands WHERE name = 'Audi'), 'Q5'),
    ((SELECT id FROM brands WHERE name = 'Audi'), 'Q7'),
    ((SELECT id FROM brands WHERE name = 'Audi'), 'Q8'),
    ((SELECT id FROM brands WHERE name = 'Audi'), 'e-tron'),
    ((SELECT id FROM brands WHERE name = 'Audi'), 'TT'),
    ((SELECT id FROM brands WHERE name = 'Audi'), 'R8');

-- Seat Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'Seat'), 'Ibiza'),
    ((SELECT id FROM brands WHERE name = 'Seat'), 'Leon'),
    ((SELECT id FROM brands WHERE name = 'Seat'), 'Ateca'),
    ((SELECT id FROM brands WHERE name = 'Seat'), 'Arona'),
    ((SELECT id FROM brands WHERE name = 'Seat'), 'Tarraco'),
    ((SELECT id FROM brands WHERE name = 'Seat'), 'Formentor'),
    ((SELECT id FROM brands WHERE name = 'Seat'), 'Alhambra');

-- Skoda Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'Skoda'), 'Fabia'),
    ((SELECT id FROM brands WHERE name = 'Skoda'), 'Octavia'),
    ((SELECT id FROM brands WHERE name = 'Skoda'), 'Superb'),
    ((SELECT id FROM brands WHERE name = 'Skoda'), 'Kamiq'),
    ((SELECT id FROM brands WHERE name = 'Skoda'), 'Karoq'),
    ((SELECT id FROM brands WHERE name = 'Skoda'), 'Kodiaq'),
    ((SELECT id FROM brands WHERE name = 'Skoda'), 'Scala'),
    ((SELECT id FROM brands WHERE name = 'Skoda'), 'Enyaq');

-- Dacia Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'Dacia'), 'Sandero'),
    ((SELECT id FROM brands WHERE name = 'Dacia'), 'Logan'),
    ((SELECT id FROM brands WHERE name = 'Dacia'), 'Duster'),
    ((SELECT id FROM brands WHERE name = 'Dacia'), 'Lodgy'),
    ((SELECT id FROM brands WHERE name = 'Dacia'), 'Dokker'),
    ((SELECT id FROM brands WHERE name = 'Dacia'), 'Spring');

-- Citroën Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'Citroën'), 'C3'),
    ((SELECT id FROM brands WHERE name = 'Citroën'), 'C4'),
    ((SELECT id FROM brands WHERE name = 'Citroën'), 'C5'),
    ((SELECT id FROM brands WHERE name = 'Citroën'), 'C3 Aircross'),
    ((SELECT id FROM brands WHERE name = 'Citroën'), 'C5 Aircross'),
    ((SELECT id FROM brands WHERE name = 'Citroën'), 'Berlingo'),
    ((SELECT id FROM brands WHERE name = 'Citroën'), 'Jumper'),
    ((SELECT id FROM brands WHERE name = 'Citroën'), 'C-Elysee');

-- Nissan Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'Nissan'), 'Micra'),
    ((SELECT id FROM brands WHERE name = 'Nissan'), 'Sentra'),
    ((SELECT id FROM brands WHERE name = 'Nissan'), 'Altima'),
    ((SELECT id FROM brands WHERE name = 'Nissan'), 'Juke'),
    ((SELECT id FROM brands WHERE name = 'Nissan'), 'Qashqai'),
    ((SELECT id FROM brands WHERE name = 'Nissan'), 'X-Trail'),
    ((SELECT id FROM brands WHERE name = 'Nissan'), 'Pathfinder'),
    ((SELECT id FROM brands WHERE name = 'Nissan'), 'Navara'),
    ((SELECT id FROM brands WHERE name = 'Nissan'), 'Leaf');

-- Honda Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'Honda'), 'Civic'),
    ((SELECT id FROM brands WHERE name = 'Honda'), 'Accord'),
    ((SELECT id FROM brands WHERE name = 'Honda'), 'HR-V'),
    ((SELECT id FROM brands WHERE name = 'Honda'), 'CR-V'),
    ((SELECT id FROM brands WHERE name = 'Honda'), 'Pilot'),
    ((SELECT id FROM brands WHERE name = 'Honda'), 'Jazz'),
    ((SELECT id FROM brands WHERE name = 'Honda'), 'City');

-- Mazda Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'Mazda'), 'Mazda2'),
    ((SELECT id FROM brands WHERE name = 'Mazda'), 'Mazda3'),
    ((SELECT id FROM brands WHERE name = 'Mazda'), 'Mazda6'),
    ((SELECT id FROM brands WHERE name = 'Mazda'), 'CX-3'),
    ((SELECT id FROM brands WHERE name = 'Mazda'), 'CX-5'),
    ((SELECT id FROM brands WHERE name = 'Mazda'), 'CX-9'),
    ((SELECT id FROM brands WHERE name = 'Mazda'), 'MX-5');

-- Kia Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'Kia'), 'Rio'),
    ((SELECT id FROM brands WHERE name = 'Kia'), 'Ceed'),
    ((SELECT id FROM brands WHERE name = 'Kia'), 'Optima'),
    ((SELECT id FROM brands WHERE name = 'Kia'), 'Stonic'),
    ((SELECT id FROM brands WHERE name = 'Kia'), 'Sportage'),
    ((SELECT id FROM brands WHERE name = 'Kia'), 'Sorento'),
    ((SELECT id FROM brands WHERE name = 'Kia'), 'Niro'),
    ((SELECT id FROM brands WHERE name = 'Kia'), 'Soul'),
    ((SELECT id FROM brands WHERE name = 'Kia'), 'Picanto'),
    ((SELECT id FROM brands WHERE name = 'Kia'), 'EV6');

-- Chevrolet Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'Chevrolet'), 'Spark'),
    ((SELECT id FROM brands WHERE name = 'Chevrolet'), 'Cruze'),
    ((SELECT id FROM brands WHERE name = 'Chevrolet'), 'Malibu'),
    ((SELECT id FROM brands WHERE name = 'Chevrolet'), 'Trax'),
    ((SELECT id FROM brands WHERE name = 'Chevrolet'), 'Equinox'),
    ((SELECT id FROM brands WHERE name = 'Chevrolet'), 'Traverse'),
    ((SELECT id FROM brands WHERE name = 'Chevrolet'), 'Tahoe'),
    ((SELECT id FROM brands WHERE name = 'Chevrolet'), 'Suburban');

-- Volvo Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'Volvo'), 'V40'),
    ((SELECT id FROM brands WHERE name = 'Volvo'), 'S60'),
    ((SELECT id FROM brands WHERE name = 'Volvo'), 'V60'),
    ((SELECT id FROM brands WHERE name = 'Volvo'), 'S90'),
    ((SELECT id FROM brands WHERE name = 'Volvo'), 'V90'),
    ((SELECT id FROM brands WHERE name = 'Volvo'), 'XC40'),
    ((SELECT id FROM brands WHERE name = 'Volvo'), 'XC60'),
    ((SELECT id FROM brands WHERE name = 'Volvo'), 'XC90');

-- Mini Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'Mini'), 'Cooper'),
    ((SELECT id FROM brands WHERE name = 'Mini'), 'Countryman'),
    ((SELECT id FROM brands WHERE name = 'Mini'), 'Clubman'),
    ((SELECT id FROM brands WHERE name = 'Mini'), 'Paceman');

-- Jeep Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'Jeep'), 'Renegade'),
    ((SELECT id FROM brands WHERE name = 'Jeep'), 'Compass'),
    ((SELECT id FROM brands WHERE name = 'Jeep'), 'Cherokee'),
    ((SELECT id FROM brands WHERE name = 'Jeep'), 'Grand Cherokee'),
    ((SELECT id FROM brands WHERE name = 'Jeep'), 'Wrangler');

-- Land Rover Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'Land Rover'), 'Discovery'),
    ((SELECT id FROM brands WHERE name = 'Land Rover'), 'Discovery Sport'),
    ((SELECT id FROM brands WHERE name = 'Land Rover'), 'Range Rover'),
    ((SELECT id FROM brands WHERE name = 'Land Rover'), 'Range Rover Sport'),
    ((SELECT id FROM brands WHERE name = 'Land Rover'), 'Range Rover Evoque'),
    ((SELECT id FROM brands WHERE name = 'Land Rover'), 'Range Rover Velar'),
    ((SELECT id FROM brands WHERE name = 'Land Rover'), 'Defender');

-- Range Rover Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'Range Rover'), 'Range Rover'),
    ((SELECT id FROM brands WHERE name = 'Range Rover'), 'Range Rover Sport'),
    ((SELECT id FROM brands WHERE name = 'Range Rover'), 'Range Rover Evoque'),
    ((SELECT id FROM brands WHERE name = 'Range Rover'), 'Range Rover Velar');

-- Porsche Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'Porsche'), '911'),
    ((SELECT id FROM brands WHERE name = 'Porsche'), '718'),
    ((SELECT id FROM brands WHERE name = 'Porsche'), 'Panamera'),
    ((SELECT id FROM brands WHERE name = 'Porsche'), 'Macan'),
    ((SELECT id FROM brands WHERE name = 'Porsche'), 'Cayenne'),
    ((SELECT id FROM brands WHERE name = 'Porsche'), 'Taycan');

-- Jaguar Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'Jaguar'), 'XE'),
    ((SELECT id FROM brands WHERE name = 'Jaguar'), 'XF'),
    ((SELECT id FROM brands WHERE name = 'Jaguar'), 'XJ'),
    ((SELECT id FROM brands WHERE name = 'Jaguar'), 'E-Pace'),
    ((SELECT id FROM brands WHERE name = 'Jaguar'), 'F-Pace'),
    ((SELECT id FROM brands WHERE name = 'Jaguar'), 'I-Pace');

-- Lexus Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'Lexus'), 'IS'),
    ((SELECT id FROM brands WHERE name = 'Lexus'), 'ES'),
    ((SELECT id FROM brands WHERE name = 'Lexus'), 'GS'),
    ((SELECT id FROM brands WHERE name = 'Lexus'), 'LS'),
    ((SELECT id FROM brands WHERE name = 'Lexus'), 'NX'),
    ((SELECT id FROM brands WHERE name = 'Lexus'), 'RX'),
    ((SELECT id FROM brands WHERE name = 'Lexus'), 'GX'),
    ((SELECT id FROM brands WHERE name = 'Lexus'), 'LX'),
    ((SELECT id FROM brands WHERE name = 'Lexus'), 'UX');

-- Infiniti Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'Infiniti'), 'Q30'),
    ((SELECT id FROM brands WHERE name = 'Infiniti'), 'Q50'),
    ((SELECT id FROM brands WHERE name = 'Infiniti'), 'Q60'),
    ((SELECT id FROM brands WHERE name = 'Infiniti'), 'QX30'),
    ((SELECT id FROM brands WHERE name = 'Infiniti'), 'QX50'),
    ((SELECT id FROM brands WHERE name = 'Infiniti'), 'QX60'),
    ((SELECT id FROM brands WHERE name = 'Infiniti'), 'QX80');

-- Alfa Romeo Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'Alfa Romeo'), 'Giulia'),
    ((SELECT id FROM brands WHERE name = 'Alfa Romeo'), 'Stelvio'),
    ((SELECT id FROM brands WHERE name = 'Alfa Romeo'), 'Tonale'),
    ((SELECT id FROM brands WHERE name = 'Alfa Romeo'), '4C'),
    ((SELECT id FROM brands WHERE name = 'Alfa Romeo'), 'Giulietta'),
    ((SELECT id FROM brands WHERE name = 'Alfa Romeo'), 'Mito');

-- DS Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'DS'), 'DS 3'),
    ((SELECT id FROM brands WHERE name = 'DS'), 'DS 4'),
    ((SELECT id FROM brands WHERE name = 'DS'), 'DS 5'),
    ((SELECT id FROM brands WHERE name = 'DS'), 'DS 7'),
    ((SELECT id FROM brands WHERE name = 'DS'), 'DS 9');

-- Cupra Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'Cupra'), 'Formentor'),
    ((SELECT id FROM brands WHERE name = 'Cupra'), 'Born'),
    ((SELECT id FROM brands WHERE name = 'Cupra'), 'Leon'),
    ((SELECT id FROM brands WHERE name = 'Cupra'), 'Ateca');

-- MG Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'MG'), 'MG4'),
    ((SELECT id FROM brands WHERE name = 'MG'), 'ZS'),
    ((SELECT id FROM brands WHERE name = 'MG'), 'HS'),
    ((SELECT id FROM brands WHERE name = 'MG'), 'Marvel R');

-- BYD Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'BYD'), 'Atto 3'),
    ((SELECT id FROM brands WHERE name = 'BYD'), 'Han'),
    ((SELECT id FROM brands WHERE name = 'BYD'), 'Tang'),
    ((SELECT id FROM brands WHERE name = 'BYD'), 'Dolphin');

-- Tesla Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'Tesla'), 'Model 3'),
    ((SELECT id FROM brands WHERE name = 'Tesla'), 'Model S'),
    ((SELECT id FROM brands WHERE name = 'Tesla'), 'Model X'),
    ((SELECT id FROM brands WHERE name = 'Tesla'), 'Model Y');

-- Togg Modelleri
INSERT INTO models (brand_id, name) VALUES 
    ((SELECT id FROM brands WHERE name = 'Togg'), 'T10X'),
    ((SELECT id FROM brands WHERE name = 'Togg'), 'T10F'),
    ((SELECT id FROM brands WHERE name = 'Togg'), 'T10C'),
    ((SELECT id FROM brands WHERE name = 'Togg'), 'T10S');
