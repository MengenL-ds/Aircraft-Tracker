const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
	user: envVariables.ORACLE_USER,
	password: envVariables.ORACLE_PASS,
	connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
	poolMin: 1,
	poolMax: 3,
	poolIncrement: 1,
	poolTimeout: 60
};

// initialize connection pool
async function initializeConnectionPool() {
	try {
		await oracledb.createPool(dbConfig);
		console.log('Connection pool started');
	} catch (err) {
		console.error('Initialization error: ' + err.message);
	}
}

async function closePoolAndExit() {
	console.log('\nTerminating');
	try {
		await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
		console.log('Pool closed');
		process.exit(0);
	} catch (err) {
		console.error(err.message);
		process.exit(1);
	}
}

initializeConnectionPool();

process
	.once('SIGTERM', closePoolAndExit)
	.once('SIGINT', closePoolAndExit);


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
	let connection;
	try {
		connection = await oracledb.getConnection(); // Gets a connection from the default pool
		return await action(connection);
	} catch (err) {
		console.error(err);
		throw err;
	} finally {
		if (connection) {
			try {
				await connection.close();
			} catch (err) {
				console.error(err);
			}
		}
	}
}


// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
	return await withOracleDB(async (connection) => {
		return true;
	}).catch(() => {
		return false;
	});
}

async function fetchDemotableFromDb() {
	return await withOracleDB(async (connection) => {
		const result = await connection.execute('SELECT * FROM DEMOTABLE');
		return result.rows;
	}).catch(() => {
		return [];
	});
}

async function initiateDemotable() {
	return await withOracleDB(async (connection) => {
		try {
			await connection.execute(`DROP TABLE DEMOTABLE`);
		} catch(err) {
			console.log('Table might not exist, proceeding to create...');
		}

		const result = await connection.execute(`
			CREATE TABLE DEMOTABLE (
									   id NUMBER PRIMARY KEY,
									   name VARCHAR2(20)
			)
		`);
		return true;
	}).catch(() => {
		return false;
	});
}

async function insertDemotable(id, name) {
	return await withOracleDB(async (connection) => {
		const result = await connection.execute(
			`INSERT INTO DEMOTABLE (id, name) VALUES (:id, :name)`,
			[id, name],
			{ autoCommit: true }
		);

		return result.rowsAffected && result.rowsAffected > 0;
	}).catch(() => {
		return false;
	});
}

async function updateNameDemotable(oldName, newName) {
	return await withOracleDB(async (connection) => {
		const result = await connection.execute(
			`UPDATE DEMOTABLE SET name=:newName where name=:oldName`,
			[newName, oldName],
			{ autoCommit: true }
		);

		return result.rowsAffected && result.rowsAffected > 0;
	}).catch(() => {
		return false;
	});
}

async function countDemotable() {
	return await withOracleDB(async (connection) => {
		const result = await connection.execute('SELECT Count(*) FROM DEMOTABLE');
		return result.rows[0][0];
	}).catch(() => {
		return -1;
	});
}

// FOR OUR PROJECT

// ADD RECORD PAGE
// add a new aircraft
async function addAircraft(aircraftID, yearIntroduced, model, manufacturer, mainWeapon) {
	return await withOracleDB(async (connection) => {
		try {
			await connection.execute(`
				INSERT INTO Aircraft2 (yearIntroduced, manufacturer, model)
				VALUES (:yearIntroduced, :manufacturer, :model)
			`, [yearIntroduced, manufacturer, model]);

			await connection.execute(`
				INSERT INTO Aircraft4 (yearIntroduced, manufacturer, mainWeapon)
				VALUES (:yearIntroduced, :manufacturer, :mainWeapon)
			`, [yearIntroduced, manufacturer, mainWeapon]);

			await connection.execute(`
				INSERT INTO Aircraft3 (aircraftID, yearIntroduced, manufacturer)
				VALUES (:aircraftID, :yearIntroduced, :manufacturer)
			`, [aircraftID, yearIntroduced, manufacturer], { autoCommit: true });

			return true;
		} catch (error) {
			console.log('Error adding aircraft:', error);
			await connection.rollback();
			return false;
		}
	}).catch((error) => {
		console.log('Error adding aircraft:', error);
		return false;
	});
}

// Function to add a new Mechanic
async function addMechanic(mechanicID, name, contact, availabilityStatus) {
	return await withOracleDB(async (connection) => {
		try {
			await connection.execute(`
				INSERT INTO Mechanic4 (contact, availabilityStatus)
				VALUES (:contact, :availabilityStatus)
			`, [contact, availabilityStatus]);

			await connection.execute(`
				INSERT INTO Mechanic2 (contact, name) VALUES (:contact, :name)
			`, [contact, name]);

			await connection.execute(`
				INSERT INTO Mechanic3 (mechanicID, contact) VALUES (:mechanicID, :contact)
			`, [mechanicID, contact], { autoCommit: true });

			return true;
		} catch (error) {
			console.log('Error adding mechanic:', error);
			await connection.rollback();
			return false;
		}
	}).catch((error) => {
		console.log('Error adding mechanic:', error);
		return false;
	});
}

// Function to insert new crew memeber
async function addCrew(crewID, crewName, crewRole, crewRank) {
	return await withOracleDB(async (connection) => {
		try {
			const result = await connection.execute(
				`
				INSERT INTO PilotsAndCrew (crewID, name, role, rank)
				VALUES (:1, :2, :3, :4)
				`,
				[crewID, crewName, crewRole, crewRank], // Positional binding array
				{ autoCommit: true }
			);

			return result.rowsAffected && result.rowsAffected > 0;
		} catch (error) {
			console.log('Error adding mechanic:', error);
			await connection.rollback();
			return false;
		}
	}).catch((error) => {
		console.log('Error adding crew:', error);
		return false;
	});
}

// add a new mission
async function addMission(missionID, missionDate, missionLocation,
						  weather, outcome, duration) {
	return await withOracleDB(async (connection) => {
		try {
			await connection.execute(`
				INSERT INTO Missions2 (missionLocation, missionDate, weather)
				VALUES (:missionLocation, :missionDate, :weather)
			`, [missionLocation, missionDate, weather]);

			await connection.execute(`
				INSERT INTO Missions1 (missionID, missionDate, missionLocation, outcome, duration)
				VALUES (:missionID, :missionDate, :missionLocation, :outcome, :duration)
			`, [missionID, missionDate, missionLocation, outcome, duration], { autoCommit: true });

			return true;
		} catch (error) {
			console.log('Error adding mission:', error);
			await connection.rollback();
			return false;
		}
	}).catch((error) => {
		console.log('Error adding mission: ', error);
		return false;
	});
}

// add a new maintenance
async function addMaintenance(maintenanceID, complexity, downtime,
							  maintenanceDate, parts, coordinateX, coordinateY, aircraftID) {
	return await withOracleDB(async (connection) => {
		try {
			await connection.execute(`
				INSERT INTO MaintenanceNeedsStationedAt (parts, maintenanceID, maintenanceDate, coordinateX, coordinateY, aircraftID, downtimeDuration, complexityLevel)
				VALUES (:parts, :maintenanceID, :maintenanceDate, :coordinateX, :coordinateY, :aircraftID, :downtime, :complexity)
			`, [parts, maintenanceID, maintenanceDate, coordinateX, coordinateY, aircraftID, downtime, complexity], { autoCommit: true });

			return true;
		} catch (error) {
			console.log('Error adding maintenance:', error);
			await connection.rollback();
			return false;
		}
	}).catch((error) => {
		console.log('Error adding maintenance:', error);
		return false;
	});
}

// get all aircraft data
async function getAircraftData() {
	return await withOracleDB(async (connection) => {
		const result = await connection.execute(`
			SELECT a3.aircraftID,
				   a3.yearIntroduced,
				   a2.model,
				   a3.manufacturer,
				   a4.mainWeapon,
				   o.crewID,
				   mns4.maintenanceID,
				   d.damagePart,
				   d.date_
			FROM Aircraft3 a3
				LEFT OUTER JOIN Aircraft2 a2 ON a3.yearIntroduced = a2.yearIntroduced
				LEFT OUTER JOIN Aircraft4 a4 ON a3.manufacturer = a4.manufacturer
				LEFT OUTER JOIN Operate o ON a3.aircraftID = o.aircraftID
				LEFT OUTER JOIN AircraftDamage d ON a3.aircraftID = d.aircraftID
				LEFT OUTER JOIN MaintenanceNeedsStationedAt mns4 ON a3.aircraftID = mns4.aircraftID
		`);
		return result.rows;
	}).catch((error) => {
		console.log("Something Wrong: ", error);
		return [];
	});
}

// Fetch the maximum average downtime for aircraft
// Nested aggregation with GROUP BY.
async function fetchMaxAvgDowntime() {
	return await withOracleDB(async (connection) => {
		const result = await connection.execute(`
			SELECT MAX(average_downtime) AS max_avg_downtime
			FROM (
				SELECT m.aircraftID, AVG(m.downtimeDuration) AS average_downtime
				FROM MaintenanceNeedsStationedAt m
				GROUP BY m.aircraftID
			) aircraft_downtime
		`);
		console.log(JSON.stringify(result.rows));
		return result.rows;
	}).catch((error) => {
		console.log("Something Wrong: ", error);
		return [];
	});
}

// adds damage to a particular aircraft
async function addDamage(aircraftID, damagePart, damageDate) {
	return await withOracleDB(async (connection) => {
		const result = await connection.execute(`
			INSERT INTO AircraftDamage (aircraftID, damagePart, date_)
			VALUES (:aircraftID, :damagePart, :damageDate)`,
			[aircraftID, damagePart, damageDate],
			{ autoCommit: true }
		);
		return result.rowsAffected && result.rowsAffected > 0;
	}).catch((error) => {
		console.log('Error adding damage: ', error);
		return false;
	});
}

// assign a crew to an aircraft
async function assignCrewToAircraft(aircraftID, crewID) {
	return await withOracleDB(async (connection) => {
		const result = await connection.execute(`
			INSERT INTO Operate (aircraftID, crewID)
			VALUES (:aircraftID, :crewID)`,
			[aircraftID, crewID],
			{ autoCommit: true }
		);
		return result.rowsAffected && result.rowsAffected > 0;
	}).catch((error) => {
		console.log("Something Wrong: ", error);
		return false;
	});
}

// remove an aircraft from database
async function removeAircraft(aircraftID) {
	return await withOracleDB(async (connection) => {
		const result = await connection.execute(`
			DELETE FROM Aircraft3 WHERE aircraftID = :aircraftID`,
			[aircraftID],
			{ autoCommit: true }
		);
		return result.rowsAffected && result.rowsAffected > 0;
	}).catch((error) => {
		console.log("Something Wrong: ", error);
		return false;
	});
}

// assign a maintenance to an aircraft
async function assignMaintenance(aircraftID, maintenanceID) {
	return await withOracleDB(async (connection) => {
		const result = await connection.execute(`
			UPDATE MaintenanceNeedsStationedAt
			SET maintenanceID=:maintenanceID
			WHERE aircraftID=:aircraftID`,
			[maintenanceID, aircraftID],
			{ autoCommit: true }
		);
		return result.rowsAffected && result.rowsAffected > 0;
	}).catch((error) => {
		console.log("Something Wrong: ", error);
		return false;
	});
}

// complete a maintenance by removing it from the database
async function removeMaintenance(maintenanceID) {
	return await withOracleDB(async (connection) => {
		try {
			await connection.execute(`
				DELETE FROM AircraftDamage
				WHERE aircraftID = (
					SELECT m.aircraftID
					FROM MaintenanceNeedsStationedAt m
					WHERE m.maintenanceID = :maintenanceID
				)
			`, [maintenanceID]);

			await connection.execute(`
				DELETE FROM MaintenanceNeedsStationedAt WHERE maintenanceID = :maintenanceID
			`, [maintenanceID], { autoCommit: true });

			return true;
		} catch (error) {
			console.log('Error removing maintenance');
			await connection.rollback();
			return false;
		}
	}).catch((error) => {
		console.log('Error removing maintenance:', error);
		return false;
	});
}

// CREW
// get all crew data
async function getCrewData() {
	return await withOracleDB(async (connection) => {
		const result = await connection.execute(`
			SELECT c.crewID,
				   c.name,
				   c.role,
				   c.rank,
				   f.squadronID,
				   f.missionID,
				   o.aircraftID
			FROM PilotsAndCrew c
				LEFT OUTER JOIN Fly f ON c.crewID = f.crewID
				LEFT OUTER JOIN Operate o ON c.crewID = o.crewID
		`);
		return result.rows;
	}).catch((error) => {
		console.log('Something Wrong:', error);
		return [];
	});
}

// Division
// Identify crew who have flown every mission
// Fetches and puts it in the table view
async function fetchVeterans() {
	return await withOracleDB(async (connection) => {
		const result = await connection.execute(`
			SELECT crewID, name, role, rank FROM PilotsAndCrew pc
			WHERE NOT EXISTS((SELECT missionID FROM Missions1)
				MINUS (SELECT f.missionID FROM FLY f WHERE f.crewID = pc.crewID))
		`);
		console.log(result.rows);
		return result.rows;
	}).catch((error) => {
		console.log('Something Wrong:', error);
		return [];
	});
}

// Identify roles that have a large number of crew members, which might indicate overstaffing or popularity of that role.
// GROUP BY + HAVING
async function getExcessRoles() {
	return await withOracleDB(async (connection) => {
		const result = await connection.execute(`
			SELECT role, COUNT(*) AS crew_count
			FROM PilotsAndCrew
			GROUP BY role HAVING COUNT(*) > 5
		`);
		return result.rows;
	}).catch((error) => {
		console.log('Something Wrong:', error);
		return [];
	});
}

// update rank of a crew
async function updateRank(crewID, newRank) {
	return await withOracleDB(async (connection) => {
		const result = await connection.execute(
			`UPDATE PilotsAndCrew SET rank=:newRank where crewID=:crewID`,
			[newRank, crewID],
			{ autoCommit: true }
		);
		return result.rowsAffected && result.rowsAffected > 0;
	}).catch((error) => {
		console.log("Something Wrong: ", error);
		return false;
	});
}


// MECHANIC
// get all mechanic data
async function getMechanicData() {
	return await withOracleDB(async (connection) => {
		const result = await connection.execute(`
			SELECT m3.mechanicID, m2.name, m3.contact, m4.availabilityStatus, p.maintenanceID
			FROM Mechanic3 m3
			LEFT JOIN Mechanic2 m2 ON m3.contact = m2.contact
			LEFT JOIN Mechanic4 m4 ON m3.contact = m4.contact
			LEFT JOIN Performed p ON p.mechanicID = m3.mechanicID
		`);
		return result.rows;
	}).catch((error) => {
		console.log("Something Wrong: ", error);
		return [];
	});
}

// Fetch the maximum total working hours for mechanics
// Nested aggregation with GROUP BY
async function fetchMaxWorkingHours() {
	return await withOracleDB(async (connection) => {
		const result = await connection.execute(`
			SELECT name, total_hours AS max_working_hours
			FROM (
				SELECT m2.name, SUM(p.workingHours) AS total_hours
				FROM Mechanic3 m3, Mechanic4 m4, Mechanic2 m2, Performed p
				WHERE m3.contact = m4.contact AND m3.mechanicID = p.mechanicID AND m3.contact = m2.contact
				GROUP BY m2.name
				ORDER BY total_hours DESC
			) mechanic_working_hours
			FETCH FIRST ROW ONLY
		`);
		return result.rows;
	}).catch((error) => {
		console.log("Something Wrong: ", error);
		return [];
	});
}

// assign maintenance to mechanic
async function assignTask(mechanicID, maintenanceID, hours) {
	return await withOracleDB(async (connection) => {
		const result = await connection.execute(`
			INSERT INTO Performed (mechanicID, maintenanceID, workingHours)
			VALUES (:mechanicID, :maintenanceID, :hours)`,
			[mechanicID, maintenanceID, hours],
			{ autoCommit: true }
		);
		return result.rowsAffected && result.rowsAffected > 0;
	}).catch((error) => {
		console.log("Something Wrong: ", error);
		return false;
	});
}

// Count the number of mechanics by their availability status (O/F)
// GROUP BY
async function fetchMechanicStatus() {
	return await withOracleDB(async (connection) => {
		const result = await connection.execute(`
			SELECT availabilityStatus, COUNT(*) AS total_mechanics
			FROM Mechanic4
			GROUP BY availabilityStatus
		`);
		console.log(JSON.stringify(result.rows));
		return result.rows;
	}).catch((error) => {
		console.log("Something Wrong: ", error);
		return [];
	});
}

// MISSION
// get mission data
async function getMissionData() {
	return await withOracleDB(async (connection) => {
		const result = await connection.execute(`
			SELECT m1.missionID, m1.missionDate, m1.missionLocation, m2.weather, m1.outcome, m1.duration, f.crewID, f.squadronID
			FROM Missions1 m1
			JOIN Missions2 m2 ON m1.missionLocation = m2.missionLocation
			AND m1.missionDate = m2.missionDate
			LEFT JOIN Fly f ON f.missionID = m1.missionID
		`);
		return result.rows;
	}).catch((error) => {
		console.log("Something Wrong: ", error);
		return [];
	});
}

// assign crew and squadron to mission
async function insertFly(crewID, missionID, squadronID) {
	return await withOracleDB(async (connection) => {
		const result = await connection.execute(
			`INSERT INTO Fly (crewID, missionID, squadronID) VALUES (:crewID, :missionID, :squadronID)`,
			[crewID, missionID, squadronID],
			{ autoCommit: true }
		);
		return result.rowsAffected && result.rowsAffected > 0;
	}).catch(() => {
		console.log('Something went wrong');
		return false;
	});
}

module.exports = {
	testOracleConnection,
	fetchDemotableFromDb,
	initiateDemotable,
	insertDemotable,
	updateNameDemotable,
	countDemotable,
	addAircraft,
	addCrew,
	addMechanic,
	addMission,
	addMaintenance,
	addDamage,
	assignCrewToAircraft,
	removeAircraft,
	removeMaintenance,
	getAircraftData,
	fetchMaxAvgDowntime,
	getCrewData,
	fetchVeterans,
	getExcessRoles,
	updateRank,
	getMechanicData,
	assignMaintenance,
	fetchMaxWorkingHours,
	fetchMechanicStatus,
	assignTask,
	getMissionData,
	insertFly
 };