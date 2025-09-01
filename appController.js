const express = require('express');
const appService = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
	const isConnect = await appService.testOracleConnection();
	if (isConnect) {
		res.send('connected');
	} else {
		res.send('unable to connect');
	}
});

router.get('/demotable', async (req, res) => {
	const tableContent = await appService.fetchDemotableFromDb();
	res.json({data: tableContent});
});

router.post("/initiate-demotable", async (req, res) => {
	const initiateResult = await appService.initiateDemotable();
	if (initiateResult) {
		res.json({ success: true });
	} else {
		res.status(500).json({ success: false });
	}
});

router.post("/insert-demotable", async (req, res) => {
	const { id, name } = req.body;
	const insertResult = await appService.insertDemotable(id, name);
	if (insertResult) {
		res.json({ success: true });
	} else {
		res.status(500).json({ success: false });
	}
});

router.post("/update-name-demotable", async (req, res) => {
	const { oldName, newName } = req.body;
	const updateResult = await appService.updateNameDemotable(oldName, newName);
	if (updateResult) {
		res.json({ success: true });
	} else {
		res.status(500).json({ success: false });
	}
});

router.get('/count-demotable', async (req, res) => {
	const tableCount = await appService.countDemotable();
	if (tableCount >= 0) {
		res.json({
			success: true,
			count: tableCount
		});
	} else {
		res.status(500).json({
			success: false,
			count: tableCount
		});
	}
});

// FOR OUR PROJECT

// Add Records Page
// add a new aircraft
router.post('/add-aircraft', async (req, res) => {
	const { aircraftID, yearIntroduced, model, manufacturer, mainWeapon } = req.body;

	if (!aircraftID) {
		return res.status(400).json({ message: 'Aircraft ID is required.' });
	}

	const result = await appService.addAircraft(
		aircraftID, yearIntroduced, model, manufacturer, mainWeapon
	);
		if (result) {
			res.json({ success: true });
		} else {
			res.status(500).json({ success: false });
		}
});

// Function to add a new Mechanic
router.post('/add-mechanic', async (req, res) => {
	try {
		// Extract data from the request body
		const { mechanicID, mechanicName, mechanicContact, availabilityStatus } = req.body;

		// Validate that required fields are present
		if (!mechanicID) {
			return res.status(400).json({ message: 'mechanicID ID is required.' });
		}

		// Call the AppService to add the mechanic to the database
		const result = await appService.addMechanic(
			mechanicID, mechanicName, mechanicContact, availabilityStatus
		);

		// Check if the mechanic was successfully added
		if (result) {
			res.json({ success: true });
		} else {
			res.status(500).json({ success: false });
		}
	} catch (error) {
		res.status(500).json({ success: false });
	}
});

// Function to insert new crew memeber
router.post('/add-crew', async (req, res) => {
	const { crewID, crewName, crewRole, crewRank } = req.body;

	if (!crewID) {
		return res.status(400).json({ message: 'Crew ID is required.' });
	}

	const result = await appService.addCrew(
		crewID, crewName, crewRole, crewRank
	);
	if (result) {
		res.status(200).json({ success: true });
	} else {
		res.status(500).json({ success: false });
	}
});

// add a new mission
router.post('/add-mission', async (req, res) => {
	try {
		// Extract data from the request body
		const { missionID, missionDate, missionLocation,
		missionWeather, missionOutcome, missionDuration } = req.body;

		// Validate that required fields are present
		if (!missionID) {
			return res.status(400).json({ message: 'Mission ID is required.' });
		}

		// Call the AppService to add the mission to the database
		const result = await appService.addMission(
			missionID, missionDate, missionLocation,
			missionWeather, missionOutcome, missionDuration
		);

		// Check if the mission was successfully added
		if (result) {
			res.json({ success: true });
		} else {
			res.status(500).json({ success: false });
		}
	} catch (error) {
		console.error('Error adding mission:', error);
		res.status(500).send('An error occurred while adding the mission.');
	}
});

// add a new maintenance
router.post('/add-maintenance', async (req, res) => {
	try {
		// Extract data from the request body
		const { maintenanceID, complexity, downtime, maintenanceDate, parts, coordinateX, coordinateY, aircraftID } = req.body;

		console.log("appController.js");
		console.log(maintenanceID);
		console.log(coordinateX);
		console.log(coordinateY);
		console.log(aircraftID);
		// Validate that required fields are present
		if (!maintenanceID || !coordinateX || !coordinateY || !aircraftID) {
			return res.status(400).json({ message: 'maintenance ID is required.' });
		}

		// Call the AppService to add the maintenance to the database
		const result = await appService.addMaintenance(
			maintenanceID, complexity, downtime, maintenanceDate, parts, coordinateX, coordinateY, aircraftID
		);

		// Check if the aircraft was successfully added
		if (result) {
			res.json({ success: true });
		} else {
			res.status(500).json({ success: false });
		}
	} catch (error) {
		console.error('Error adding maintenance:', error);
		res.status(500).send('An error occurred while adding the maintenance.');
	}
});

// AIRCRAFT
// get all aircraft data
router.get('/get_aircraft', async (req, res) => {
	try {
		// Fetch
		const aircraftData = await appService.getAircraftData();

		// Check if data was successfully retrieved
		if (aircraftData) {
			res.json(aircraftData); // Send data as JSON
		}
		else {
			res.status(404).send('No aircraft data found.');
		}
	} catch (error) {
		console.error('Error adding aircraft:', error);
		res.status(500).send('An error occurred while getting aircraft.');
	}
});

// Fetch the maximum average downtime for aircraft
router.get('/max_avg_downtime', async (req, res) => {
	try {
		const maxAvgDowntime = await appService.fetchMaxAvgDowntime();
		// Check if data was successfully retrieved
		if (maxAvgDowntime && maxAvgDowntime.length > 0) {
			res.json({ data: maxAvgDowntime });
		} else {
			res.status(404).send('No downtime data found.');
		}
	} catch (error) {
		console.error('Error fetching max average downtime:', error);
		res.status(500).send('An error occurred');
	}
});

// adds damage to a particular aircraft
router.post('/add-damage', async (req, res) => {
	try {
		// Extract data from the request body
		const { aircraftID, damagePart, damageDate} = req.body;

		// Validate that required fields are present
		if (!aircraftID || !damagePart || !damageDate) {
			return res.status(400).json({ message: 'Invalid attribute' });
		}

		// Call the AppService to add the damage to the database
		const result = await appService.addDamage(
			aircraftID, damagePart, damageDate
		);

		// Check if the mission was successfully added
		if (result) {
			res.json({ success: true });
		} else {
			res.status(500).json({ success: false });
		}
	} catch (error) {
		console.error('Error adding damage:', error);
		res.status(500).send('An error occurred while adding the damage.');
	}
});

// assign a crew to an aircraft
router.post('/assign-crew-to-aircraft', async (req, res) => {
	try {
		// Extract data from the request body
		const { aircraftID, crewID } = req.body;

		// Validate that required fields are present
		if (!aircraftID || !crewID) {
			return res.status(400).json({ message: 'Invalid attribute' });
		}

		// Call the AppService to add the damage to the database
		const result = await appService.assignCrewToAircraft(
			aircraftID, crewID
		);

		// Check if the mission was successfully added
		if (result) {
			res.json({ success: true });
		} else {
			res.status(500).json({ success: false });
		}
	} catch (error) {
		console.error('Error assigning crew:', error);
		res.status(500).send('An error occurred while assigning crew.');
	}
});

// remove an aircraft from database
router.post ('/remove-aircraft', async (req, res) => {
	try {
		// Extract data from the request body
		const { aircraftID } = req.body;

		// Validate that required fields are present
		if (!aircraftID) {
			return res.status(400).json({ message: 'Invalid attribute' });
		}

		// Call the AppService to add the damage to the database
		const result = await appService.removeAircraft(
			aircraftID
		);

		// Check if the mission was successfully added
		if (result) {
			res.json({ success: true });
		} else {
			res.status(500).json({ success: false });
		}
	} catch (error) {
		console.error('Error removing aircraft:', error);
		res.status(500).send('An error occurred while removing aircraft.');
	}
})

// assign a maintenance to an aircraft
router.post ('/assign-maintenance', async (req, res) => {
	try {
		// Extract data from the request body
		const { aircraftID, maintenanceID } = req.body;

		// Validate that required fields are present
		if (!maintenanceID || !aircraftID) {
			return res.status(400).json({ message: 'Invalid attribute' });
		}

		// Call the AppService to add the damage to the database
		const result = await appService.assignMaintenance(
			aircraftID, maintenanceID
		);

		// Check if the mission was successfully added
		if (result) {
			res.json({ success: true });
		} else {
			res.status(500).json({ success: false });
		}
	} catch (error) {
		console.error('Error assigning maintenance:', error);
		res.status(500).send('An error occurred while assigning maintenance.');
	}
})

// complete a maintenance by removing it from the database
router.post ('/remove-maintenance', async (req, res) => {
	try {
		// Extract data from the request body
		const { maintenanceID } = req.body;

		// Validate that required fields are present
		if (!maintenanceID) {
			return res.status(400).json({ message: 'Invalid attribute' });
		}

		// Call the AppService to add the damage to the database
		const result = await appService.removeMaintenance(
			maintenanceID
		);

		// Check if the mission was successfully added
		if (result) {
			res.json({ success: true });
		} else {
			res.status(500).json({ success: false });
		}
	} catch (error) {
		console.error('Error removing maintenance:', error);
		res.status(500).send('An error occurred while removing maintenance.');
	}
})

// CREW
// get all crew data
router.get('/get_crew', async (req, res) => {
	try {
		// Fetch
		const crewData = await appService.getCrewData();

		// Check if data was successfully retrieved
		if (crewData) {
			res.json(crewData); // Send data as JSON
		}
		else {
			res.status(404).send('No crew data found.');
		}
	} catch (error) {
		console.error('Error getting crew:', error);
		res.status(500).send('An error occurred while getting the crew.');
	}
});

// get crew who have flown every mission
router.get('/get_Veterans', async (req, res) => {
	try {
		const getVeterans = await appService.fetchVeterans();
		// Check if data was successfully retrieved
		if (getVeterans) {
			 res.json({data: getVeterans});
		}
		else {
			 res.status(404).send('No veterans found.');
		}
	} catch (error) {
		console.error('Error getting veterans:', error);
		res.status(500).send('An error occurred while getting veterans.');
	}
});

// get the excess roles of crews, roles with more than 5 crews
router.get('/excess_Roles', async (req, res) => {
	try {
		const getCrew = await appService.getExcessRoles();
		// Check if data was successfully retrieved
		if (getCrew) {
			 res.json({data: getCrew});
		}
		else {
			 res.status(404).send('No excess roles found.');
		}
	} catch (error) {
		console.error('Error getting excess roles:', error);
		res.status(500).send('An error occurred while getting excess roles.');
	}
});

// update rank of a crew
router.post('/update-rank', async (req, res) => {
	try {
			// Extract data from the request body
			const { crewID, newRank } = req.body;

			// Validate that required fields are present
			if (!crewID || !newRank) {
				return res.status(400).json({ message: 'Invalid attribute' });
			}

			// Call the AppService to add the damage to the database
			const result = await appService.updateRank(
				crewID, newRank
			);

			// Check if the mission was successfully added
			if (result) {
				res.json({ success: true });
			} else {
				res.status(500).json({ success: false });
			}
		} catch (error) {
			console.error('Error updating rank:', error);
			res.status(500).send('An error occurred while updating rank.');
		}
})

// MECHANIC
// get all mechanic data
router.get('/get_mechanic', async (req, res) => {
	try {
		// Fetch
		const crewData = await appService.getMechanicData();

		// Check if data was successfully retrieved
		if (crewData) {
			res.json(crewData); // Send data as JSON
		}
		else {
			res.status(404).send('No crew data found.');
		}
	} catch (error) {
		console.error('Error getting mechanics:', error);
		res.status(500).send('An error occurred while getting mechanics.');
	}
});

// Fetch the maximum total working hours for mechanics
router.get('/max_working_hours', async (req, res) => {
	try {
		const maxWorkingHours = await appService.fetchMaxWorkingHours();
		if (maxWorkingHours && maxWorkingHours.length > 0) {
			res.json({ data: maxWorkingHours });
		} else {
			res.status(404).send('No working hours data found.');
		}
	} catch (error) {
		console.error('Error fetching max working hours:', error);
		res.status(500).send('An error occurred');
	}
});

// assign maintenance to mechanic
router.post('/assign-task', async (req, res) => {
	try {
		// Extract data from the request body
		const { mechanicID, maintenanceID, hours } = req.body;

		// Validate that required fields are present
		if (!mechanicID || !maintenanceID) {
			return res.status(400).json({ message: 'Invalid attribute' });
		}

		// Call the AppService to add the damage to the database
		const result = await appService.assignTask(
			mechanicID, maintenanceID, hours
		);

		// Check if the mission was successfully added
		if (result) {
			res.json({ success: true });
		} else {
			res.status(500).json({ success: false });
		}
	} catch (error) {
		console.error('Error assigning task:', error);
		res.status(500).send('An error occurred while assigning task.');
	}
});

// Count the number of mechanics by their availability status (O/F)
router.get('/get_Mechanic_Status', async (req, res) => {
	try {
		const getStatus = await appService.fetchMechanicStatus();
		// Check if data was successfully retrieved
		if (getStatus) {
			 res.json({data: getStatus});
		}
		else {
			 res.status(404).send('No mechanic data found.');
		}
	} catch (error) {
		console.error('Error getting mechanic status:', error);
		res.status(500).send('An error occurred while getting mechanic status.');
	}
});


// MISSION
// get mission data
router.get('/mission', async (req, res) => {
	try {
		// Fetch
		const missionData = await appService.getMissionData();

		// Check if data was successfully retrieved
		if (missionData) {
			res.json(missionData); // Send data as JSON
		}
		else {
			res.status(404).send('No mission data found.');
		}
	} catch (error) {
		console.error('Error getting mission:', error);
		res.status(500).send('An error occurred while getting the mission.');
	}
});

// assign crew and squadron to mission
router.post("/fly", async (req, res) => {
	try {
		const { crewID, missionID, squadronID } = req.body;
		const insertResult = await appService.insertFly(
			crewID, missionID, squadronID);

		if (insertResult) {
			res.json({ success: true });
		} else {
			console.error('Error inserting Fly:', error);
			res.status(500).json({ success: false });
		}
	} catch (error) {
		console.error('Error adding fly:', error);
		res.status(500).send('An error occurred while adding fly.');
	}
});

module.exports = router;