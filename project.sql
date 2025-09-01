-- Reset Database
BEGIN
	FOR t IN (SELECT table_name FROM user_tables) LOOP
		EXECUTE IMMEDIATE 'DROP TABLE ' || t.table_name || ' CASCADE CONSTRAINTS';
	END LOOP;
END;
/

-- Aircraft

CREATE TABLE Aircraft2 (
	yearIntroduced NUMBER(38),
	manufacturer NVARCHAR2(20),
	model NVARCHAR2(20),
	PRIMARY KEY (yearIntroduced, manufacturer)
);

CREATE TABLE Aircraft4 (
	yearIntroduced NUMBER(38),
	manufacturer NVARCHAR2(20),
	mainWeapon NVARCHAR2(20),
	PRIMARY KEY (yearIntroduced, manufacturer),
	FOREIGN KEY (yearIntroduced, manufacturer)
		REFERENCES Aircraft2(yearIntroduced, manufacturer)
		ON DELETE CASCADE
);

CREATE TABLE Aircraft3 (
	aircraftID NUMBER(38) PRIMARY KEY,
	yearIntroduced NUMBER(38),
	manufacturer NVARCHAR2(20),
	FOREIGN KEY (yearIntroduced, manufacturer)
		REFERENCES Aircraft4(yearIntroduced, manufacturer)
		ON DELETE CASCADE
);

-- RepairBase

CREATE TABLE RepairBase2 (
	city NVARCHAR2(20) PRIMARY KEY,
	country NVARCHAR2(20)
);

CREATE TABLE RepairBase4 (
	certification NVARCHAR2(20) PRIMARY KEY,
	specialization NVARCHAR2(20)
);

CREATE TABLE RepairBase3 (
	coordinateX FLOAT,
	coordinateY FLOAT,
	city NVARCHAR2(20),
	certification NVARCHAR2(20),
	PRIMARY KEY (coordinateX, coordinateY),
	FOREIGN KEY (city)
		REFERENCES RepairBase2(city)
		ON DELETE CASCADE,
	FOREIGN KEY (certification)
		REFERENCES RepairBase4(certification)
		ON DELETE CASCADE
);

-- Mechanic

CREATE TABLE Mechanic4 (
	contact NVARCHAR2(20) PRIMARY KEY,
	availabilityStatus NVARCHAR2(1)
);

CREATE TABLE Mechanic2 (
	contact NVARCHAR2(20) PRIMARY KEY,
	name NVARCHAR2(20) UNIQUE,
	FOREIGN KEY (contact)
		REFERENCES Mechanic4(contact)
		ON DELETE CASCADE
);

CREATE TABLE Mechanic3 (
	mechanicID NUMBER(38) PRIMARY KEY,
	contact NVARCHAR2(20) UNIQUE,
	FOREIGN KEY (contact)
		REFERENCES Mechanic2(contact)
		ON DELETE CASCADE
);

-- MaintenanceNeedsStationedAt

CREATE TABLE MaintenanceNeedsStationedAt (
	parts NVARCHAR2(20),
	maintenanceID NUMBER(38) PRIMARY KEY,
	maintenanceDate NVARCHAR2(30),
	coordinateX FLOAT NOT NULL,
	coordinateY FLOAT NOT NULL,
	aircraftID NUMBER(38) NOT NULL,
	downtimeDuration NUMBER(38),
	complexityLevel NUMBER(38),
	FOREIGN KEY (aircraftID)
		REFERENCES Aircraft3(aircraftID)
		ON DELETE CASCADE,
	FOREIGN KEY (coordinateX, coordinateY)
		REFERENCES RepairBase3(coordinateX, coordinateY)
		ON DELETE CASCADE
);

-- HomeBase

CREATE TABLE HomeBase3 (
	commissionDate NVARCHAR2(30) PRIMARY KEY,
	baseType NVARCHAR2(20)
);

CREATE TABLE HomeBase4 (
	commissionDate NVARCHAR2(30),
	region NVARCHAR2(20),
	capacity NUMBER(38),
	PRIMARY KEY (commissionDate, region),
	FOREIGN KEY (commissionDate)
		REFERENCES HomeBase3(commissionDate)
		ON DELETE CASCADE
);

CREATE TABLE HomeBase6 (
	commissionDate NVARCHAR2(30),
	region NVARCHAR2(20),
	homeBaseID NUMBER(38) PRIMARY KEY,
	FOREIGN KEY (commissionDate, region)
		REFERENCES HomeBase4(commissionDate, region)
		ON DELETE CASCADE
);

-- SquadronFrom

CREATE TABLE SquadronFrom (
	squadronID NUMBER(38) PRIMARY KEY,
	name NVARCHAR2(20) UNIQUE,
	dateFormed NVARCHAR2(30),
	aircraftCount NUMBER(38),
	homeBaseID NUMBER(38) UNIQUE,
	FOREIGN KEY (homeBaseID)
		REFERENCES HomeBase6(homeBaseID)
		ON DELETE CASCADE
);

-- Performed

CREATE TABLE Performed (
	mechanicID NUMBER(38),
	maintenanceID NUMBER(38),
	workingHours NUMBER(38),
	PRIMARY KEY (mechanicID, maintenanceID),
	FOREIGN KEY (mechanicID)
		REFERENCES Mechanic3(mechanicID)
		ON DELETE CASCADE,
	FOREIGN KEY (maintenanceID)
		REFERENCES MaintenanceNeedsStationedAt(maintenanceID)
		ON DELETE CASCADE
);

-- Works

CREATE TABLE Works (
	mechanicID NUMBER(38),
	coordinateX FLOAT,
	coordinateY FLOAT,
	PRIMARY KEY (mechanicID, coordinateX, coordinateY),
	FOREIGN KEY (mechanicID)
		REFERENCES Mechanic3(mechanicID)
		ON DELETE CASCADE,
	FOREIGN KEY (coordinateX, coordinateY)
		REFERENCES RepairBase3(coordinateX, coordinateY)
		ON DELETE CASCADE
);

-- PilotsAndCrew

CREATE TABLE PilotsAndCrew (
	crewID NUMBER(38) PRIMARY KEY,
	name NVARCHAR2(20) UNIQUE,
	role NVARCHAR2(20),
	rank NVARCHAR2(20)
);

-- Operate

CREATE TABLE Operate (
	crewID NUMBER(38),
	aircraftID NUMBER(38),
	PRIMARY KEY (crewID, aircraftID),
	FOREIGN KEY (crewID)
		REFERENCES PilotsAndCrew(crewID)
		ON DELETE CASCADE,
	FOREIGN KEY (aircraftID)
		REFERENCES Aircraft3(aircraftID)
		ON DELETE CASCADE
);

-- Missions

CREATE TABLE Missions2 (
	missionLocation NVARCHAR2(20),
	missionDate NVARCHAR2(30),
	weather NVARCHAR2(20),
	PRIMARY KEY (missionLocation, missionDate)
);

CREATE TABLE Missions1 (
	missionID NUMBER(38) PRIMARY KEY,
	missionDate NVARCHAR2(30),
	missionLocation NVARCHAR2(20),
	outcome CHAR(1),
	duration NVARCHAR2(30),
	FOREIGN KEY (missionLocation, missionDate)
		REFERENCES Missions2(missionLocation, missionDate)
);

-- Fly

CREATE TABLE Fly (
	crewID NUMBER(38),
	missionID NUMBER(38),
	squadronID NUMBER(38),
	PRIMARY KEY (crewID, missionID, squadronID),
	FOREIGN KEY (crewID)
		REFERENCES PilotsAndCrew(crewID)
		ON DELETE CASCADE,
	FOREIGN KEY (missionID)
		REFERENCES Missions1(missionID)
		ON DELETE CASCADE,
	FOREIGN KEY (squadronID)
		REFERENCES SquadronFrom(squadronID)
		ON DELETE CASCADE
);

-- Land

CREATE TABLE Land (
	coordinateX FLOAT,
	coordinateY FLOAT,
	aircraftID NUMBER(38),
	landTime NVARCHAR2(30),
	PRIMARY KEY (coordinateX, coordinateY, aircraftID),
	FOREIGN KEY (coordinateX, coordinateY)
		REFERENCES RepairBase3(coordinateX, coordinateY)
		ON DELETE CASCADE,
	FOREIGN KEY (aircraftID)
		REFERENCES Aircraft3(aircraftID)
		ON DELETE CASCADE
);

-- Repair

CREATE TABLE Repair (
	maintenanceID NUMBER(38) PRIMARY KEY,
	partReplaced NVARCHAR2(20),
	FOREIGN KEY (maintenanceID)
		REFERENCES MaintenanceNeedsStationedAt(maintenanceID)
		ON DELETE CASCADE
);

-- Upgrade

CREATE TABLE Upgrade (
	maintenanceID NUMBER(38) PRIMARY KEY,
	newParts NVARCHAR2(30),
	FOREIGN KEY (maintenanceID)
		REFERENCES MaintenanceNeedsStationedAt(maintenanceID)
		ON DELETE CASCADE
);

-- AircraftDamage

CREATE TABLE AircraftDamage (
	aircraftID NUMBER(38),
	damagePart NVARCHAR2(20),
	date_ NVARCHAR2(30),
	PRIMARY KEY (aircraftID, damagePart, date_),
	FOREIGN KEY (aircraftID)
		REFERENCES Aircraft3(aircraftID)
		ON DELETE CASCADE
);

-- Inserting tuples

-- Aircraft

INSERT INTO Aircraft2 (yearIntroduced, manufacturer, model) VALUES (2015, 'Boeing', 'F18');
INSERT INTO Aircraft2 (yearIntroduced, manufacturer, model) VALUES (2017, 'Lockheed', 'F35');
INSERT INTO Aircraft2 (yearIntroduced, manufacturer, model) VALUES (2016, 'Dassault', 'Rafale');
INSERT INTO Aircraft2 (yearIntroduced, manufacturer, model) VALUES (2020, 'Saab', 'Gripen');
INSERT INTO Aircraft2 (yearIntroduced, manufacturer, model) VALUES (2019, 'Eurofighter', 'Typhoon');

INSERT INTO Aircraft4 (yearIntroduced, manufacturer, mainWeapon) VALUES (2015, 'Boeing', 'AIM-120 AMRAAM');
INSERT INTO Aircraft4 (yearIntroduced, manufacturer, mainWeapon) VALUES (2017, 'Lockheed', 'AIM-9 Sidewinder');
INSERT INTO Aircraft4 (yearIntroduced, manufacturer, mainWeapon) VALUES (2016, 'Dassault', 'Meteor');
INSERT INTO Aircraft4 (yearIntroduced, manufacturer, mainWeapon) VALUES (2020, 'Saab', 'IRIS-T');
INSERT INTO Aircraft4 (yearIntroduced, manufacturer, mainWeapon) VALUES (2019, 'Eurofighter', 'Storm Shadow');

INSERT INTO Aircraft3 (aircraftID, yearIntroduced, manufacturer) VALUES (101, 2015, 'Boeing');
INSERT INTO Aircraft3 (aircraftID, yearIntroduced, manufacturer) VALUES (102, 2017, 'Lockheed');
INSERT INTO Aircraft3 (aircraftID, yearIntroduced, manufacturer) VALUES (103, 2016, 'Dassault');
INSERT INTO Aircraft3 (aircraftID, yearIntroduced, manufacturer) VALUES (104, 2020, 'Saab');
INSERT INTO Aircraft3 (aircraftID, yearIntroduced, manufacturer) VALUES (105, 2019, 'Eurofighter');

-- RepairBase

INSERT INTO RepairBase2 (city, country) VALUES ('Vancouver', 'Canada');
INSERT INTO RepairBase2 (city, country) VALUES ('Seattle', 'USA');
INSERT INTO RepairBase2 (city, country) VALUES ('London', 'UK');
INSERT INTO RepairBase2 (city, country) VALUES ('Paris', 'France');
INSERT INTO RepairBase2 (city, country) VALUES ('Berlin', 'Germany');

INSERT INTO RepairBase4 (certification, specialization) VALUES ('Engine Repair', 'Engines');
INSERT INTO RepairBase4 (certification, specialization) VALUES ('Avionics Repair', 'Avionics');
INSERT INTO RepairBase4 (certification, specialization) VALUES ('Structure Repair', 'Structures');

INSERT INTO RepairBase3 (coordinateX, coordinateY, city, certification) VALUES (52.345, -106.123, 'Vancouver', 'Engine Repair');
INSERT INTO RepairBase3 (coordinateX, coordinateY, city, certification) VALUES (49.987, -123.456, 'Seattle', 'Avionics Repair');
INSERT INTO RepairBase3 (coordinateX, coordinateY, city, certification) VALUES (55.678, -120.789, 'London', 'Engine Repair');
INSERT INTO RepairBase3 (coordinateX, coordinateY, city, certification) VALUES (53.432, -122.321, 'Paris', 'Structure Repair');
INSERT INTO RepairBase3 (coordinateX, coordinateY, city, certification) VALUES (51.234, -124.567, 'Berlin', 'Engine Repair');

-- Mechanic

INSERT INTO Mechanic4 (contact, availabilityStatus) VALUES ('123-456-7890', 'F');
INSERT INTO Mechanic4 (contact, availabilityStatus) VALUES ('123-555-7890', 'F');
INSERT INTO Mechanic4 (contact, availabilityStatus) VALUES ('987-654-3210', 'O');
INSERT INTO Mechanic4 (contact, availabilityStatus) VALUES ('789-456-1230', 'F');
INSERT INTO Mechanic4 (contact, availabilityStatus) VALUES ('555-123-9876', 'O');

INSERT INTO Mechanic2 (contact, name) VALUES ('123-456-7890', 'John Doe');
INSERT INTO Mechanic2 (contact, name) VALUES ('123-555-7890', 'Jane Smith');
INSERT INTO Mechanic2 (contact, name) VALUES ('987-654-3210', 'David Brown');
INSERT INTO Mechanic2 (contact, name) VALUES ('789-456-1230', 'Michael Lee');
INSERT INTO Mechanic2 (contact, name) VALUES ('555-123-9876', 'Emily Davis');

INSERT INTO Mechanic3 (mechanicID, contact) VALUES (1, '123-456-7890');
INSERT INTO Mechanic3 (mechanicID, contact) VALUES (2, '123-555-7890');
INSERT INTO Mechanic3 (mechanicID, contact) VALUES (3, '987-654-3210');
INSERT INTO Mechanic3 (mechanicID, contact) VALUES (4, '789-456-1230');
INSERT INTO Mechanic3 (mechanicID, contact) VALUES (5, '555-123-9876');

-- MaintenanceNeedsStationedAt
INSERT INTO MaintenanceNeedsStationedAt (parts, maintenanceID, maintenanceDate, coordinateX, coordinateY, aircraftID, downtimeDuration, complexityLevel) VALUES ('Engine', 1, '2024-01-10', 52.345, -106.123, 101, 150, 3);
INSERT INTO MaintenanceNeedsStationedAt (parts, maintenanceID, maintenanceDate, coordinateX, coordinateY, aircraftID, downtimeDuration, complexityLevel) VALUES ('Landing Gear', 2, '2024-02-15', 49.987, -123.456, 102, 105, 2);
INSERT INTO MaintenanceNeedsStationedAt (parts, maintenanceID, maintenanceDate, coordinateX, coordinateY, aircraftID, downtimeDuration, complexityLevel) VALUES ('Fuel Tank', 3, '2024-03-20', 55.678, -120.789, 103, 180, 4);
INSERT INTO MaintenanceNeedsStationedAt (parts, maintenanceID, maintenanceDate, coordinateX, coordinateY, aircraftID, downtimeDuration, complexityLevel) VALUES ('Hydraulics', 4, '2024-04-22', 53.432, -122.321, 104, 350, 5);
INSERT INTO MaintenanceNeedsStationedAt (parts, maintenanceID, maintenanceDate, coordinateX, coordinateY, aircraftID, downtimeDuration, complexityLevel) VALUES ('Wing', 5, '2024-05-05', 51.234, -124.567, 105, 400, 1);

-- HomeBase

INSERT INTO HomeBase3 (commissionDate, baseType) VALUES ('2010-06-01', 'Airbase');
INSERT INTO HomeBase3 (commissionDate, baseType) VALUES ('2011-07-15', 'Naval Base');
INSERT INTO HomeBase3 (commissionDate, baseType) VALUES ('2009-09-20', 'Airbase');
INSERT INTO HomeBase3 (commissionDate, baseType) VALUES ('2012-10-30', 'Naval Base');
INSERT INTO HomeBase3 (commissionDate, baseType) VALUES ('2013-05-25', 'Airbase');

INSERT INTO HomeBase4 (commissionDate, region, capacity) VALUES ('2010-06-01', 'West', 500);
INSERT INTO HomeBase4 (commissionDate, region, capacity) VALUES ('2011-07-15', 'East', 400);
INSERT INTO HomeBase4 (commissionDate, region, capacity) VALUES ('2009-09-20', 'South', 600);
INSERT INTO HomeBase4 (commissionDate, region, capacity) VALUES ('2012-10-30', 'North', 300);
INSERT INTO HomeBase4 (commissionDate, region, capacity) VALUES ('2013-05-25', 'Central', 450);

INSERT INTO HomeBase6 (commissionDate, region, homeBaseID) VALUES ('2010-06-01', 'West', 201);
INSERT INTO HomeBase6 (commissionDate, region, homeBaseID) VALUES ('2011-07-15', 'East', 202);
INSERT INTO HomeBase6 (commissionDate, region, homeBaseID) VALUES ('2009-09-20', 'South', 203);
INSERT INTO HomeBase6 (commissionDate, region, homeBaseID) VALUES ('2012-10-30', 'North', 204);
INSERT INTO HomeBase6 (commissionDate, region, homeBaseID) VALUES ('2013-05-25', 'Central', 205);

-- SquadronFrom
INSERT INTO SquadronFrom (squadronID, name, dateFormed, aircraftCount, homeBaseID) VALUES (1, 'Eagles', '2020-05-12', 10, 201);
INSERT INTO SquadronFrom (squadronID, name, dateFormed, aircraftCount, homeBaseID) VALUES (2, 'Falcons', '2021-06-15', 12, 202);
INSERT INTO SquadronFrom (squadronID, name, dateFormed, aircraftCount, homeBaseID) VALUES (3, 'Hawks', '2019-07-20', 8, 203);
INSERT INTO SquadronFrom (squadronID, name, dateFormed, aircraftCount, homeBaseID) VALUES (4, 'Raptors', '2022-03-10', 9, 204);
INSERT INTO SquadronFrom (squadronID, name, dateFormed, aircraftCount, homeBaseID) VALUES (5, 'Vultures', '2023-01-18', 11, 205);

-- Performed
INSERT INTO Performed (mechanicID, maintenanceID, workingHours) VALUES (1, 1, 10);
INSERT INTO Performed (mechanicID, maintenanceID, workingHours) VALUES (2, 2, 8);
INSERT INTO Performed (mechanicID, maintenanceID, workingHours) VALUES (3, 3, 12);
INSERT INTO Performed (mechanicID, maintenanceID, workingHours) VALUES (4, 4, 7);
INSERT INTO Performed (mechanicID, maintenanceID, workingHours) VALUES (5, 5, 6);

-- Works
INSERT INTO Works (mechanicID, coordinateX, coordinateY) VALUES (1, 52.345, -106.123);
INSERT INTO Works (mechanicID, coordinateX, coordinateY) VALUES (2, 49.987, -123.456);
INSERT INTO Works (mechanicID, coordinateX, coordinateY) VALUES (3, 55.678, -120.789);
INSERT INTO Works (mechanicID, coordinateX, coordinateY) VALUES (4, 53.432, -122.321);
INSERT INTO Works (mechanicID, coordinateX, coordinateY) VALUES (5, 51.234, -124.567);

-- PilotsAndCrew

INSERT INTO PilotsAndCrew (crewID, name, role, rank) VALUES (1, 'John Connor', 'Pilot', 'Captain');
INSERT INTO PilotsAndCrew (crewID, name, role, rank) VALUES (2, 'Sarah Lance', 'Co-pilot', 'Lieutenant');
INSERT INTO PilotsAndCrew (crewID, name, role, rank) VALUES (3, 'Mike Jordan', 'Navigator', 'Major');
INSERT INTO PilotsAndCrew (crewID, name, role, rank) VALUES (4, 'Bruce Wayne', 'Pilot', 'Colonel');
INSERT INTO PilotsAndCrew (crewID, name, role, rank) VALUES (5, 'Clark Kent', 'Navigator', 'Lieutenant');

-- Operate
INSERT INTO Operate (crewID, aircraftID) VALUES (1, 101);
INSERT INTO Operate (crewID, aircraftID) VALUES (2, 102);
INSERT INTO Operate (crewID, aircraftID) VALUES (3, 103);
INSERT INTO Operate (crewID, aircraftID) VALUES (4, 104);
INSERT INTO Operate (crewID, aircraftID) VALUES (5, 105);

-- Missions

INSERT INTO Missions2 (missionLocation, missionDate, weather) VALUES ('Syria', '2024-01-01', 'Clear');
INSERT INTO Missions2 (missionLocation, missionDate, weather) VALUES ('Iraq', '2024-02-10', 'Cloudy');
INSERT INTO Missions2 (missionLocation, missionDate, weather) VALUES ('Afghanistan', '2024-03-15', 'Stormy');
INSERT INTO Missions2 (missionLocation, missionDate, weather) VALUES ('Libya', '2024-04-22', 'Rainy');
INSERT INTO Missions2 (missionLocation, missionDate, weather) VALUES ('Somalia', '2024-05-05', 'Clear');

INSERT INTO Missions1 (missionID, missionDate, missionLocation, outcome, duration) VALUES (1001, '2024-01-01', 'Syria', 'S', 600);
INSERT INTO Missions1 (missionID, missionDate, missionLocation, outcome, duration) VALUES (1002, '2024-02-10', 'Iraq', 'F', 650);
INSERT INTO Missions1 (missionID, missionDate, missionLocation, outcome, duration) VALUES (1003, '2024-03-15', 'Afghanistan', 'S', 900);
INSERT INTO Missions1 (missionID, missionDate, missionLocation, outcome, duration) VALUES (1004, '2024-04-22', 'Libya', 'S', 6000);
INSERT INTO Missions1 (missionID, missionDate, missionLocation, outcome, duration) VALUES (1005, '2024-05-05', 'Somalia', 'F', 100);

-- Fly
INSERT INTO Fly (crewID, missionID, squadronID) VALUES (1, 1001, 1);
INSERT INTO Fly (crewID, missionID, squadronID) VALUES (2, 1002, 2);
INSERT INTO Fly (crewID, missionID, squadronID) VALUES (3, 1003, 3);
INSERT INTO Fly (crewID, missionID, squadronID) VALUES (4, 1004, 4);
INSERT INTO Fly (crewID, missionID, squadronID) VALUES (5, 1005, 5);

-- Land
INSERT INTO Land (coordinateX, coordinateY, aircraftID, landTime) VALUES (52.345, -106.123, 101, '2024-01-01 10:30:00');
INSERT INTO Land (coordinateX, coordinateY, aircraftID, landTime) VALUES (49.987, -123.456, 102, '2024-02-10 12:45:00');
INSERT INTO Land (coordinateX, coordinateY, aircraftID, landTime) VALUES (55.678, -120.789, 103, '2024-03-15 14:00:00');
INSERT INTO Land (coordinateX, coordinateY, aircraftID, landTime) VALUES (53.432, -122.321, 104, '2024-04-22 15:30:00');
INSERT INTO Land (coordinateX, coordinateY, aircraftID, landTime) VALUES (51.234, -124.567, 105, '2024-05-05 11:45:00');

-- Repair

INSERT INTO Repair (maintenanceID, partReplaced) VALUES (1, 'Engine');
INSERT INTO Repair (maintenanceID, partReplaced) VALUES (2, 'Landing Gear');
INSERT INTO Repair (maintenanceID, partReplaced) VALUES (3, 'Fuel Tank');
INSERT INTO Repair (maintenanceID, partReplaced) VALUES (4, 'Hydraulics');
INSERT INTO Repair (maintenanceID, partReplaced) VALUES (5, 'Wing');

-- Upgrade

INSERT INTO Upgrade (maintenanceID, newParts) VALUES (1, 'Advanced Engine');
INSERT INTO Upgrade (maintenanceID, newParts) VALUES (2, 'Upgraded Landing Gear');
INSERT INTO Upgrade (maintenanceID, newParts) VALUES (3, 'Reinforced Fuel Tank');
INSERT INTO Upgrade (maintenanceID, newParts) VALUES (4, 'Improved Hydraulics');
INSERT INTO Upgrade (maintenanceID, newParts) VALUES (5, 'High-Performance Wing');

-- AircraftDamage

INSERT INTO AircraftDamage (aircraftID, damagePart, date_) VALUES (101, 'Engine', '2024-01-05');
INSERT INTO AircraftDamage (aircraftID, damagePart, date_) VALUES (102, 'Landing Gear', '2024-02-12');
INSERT INTO AircraftDamage (aircraftID, damagePart, date_) VALUES (103, 'Fuel Tank', '2024-03-18');
INSERT INTO AircraftDamage (aircraftID, damagePart, date_) VALUES (104, 'Hydraulics', '24-04-25');
INSERT INTO AircraftDamage (aircraftID, damagePart, date_) VALUES (105, 'Wing', '2024-05-07');

