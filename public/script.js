async function checkDbConnection() {
	const statusElem = document.getElementById('dbStatus');
	const loadingGifElem = document.getElementById('loadingGif');

	const response = await fetch('/check-db-connection', {
		method: "GET"
	});

	// Hide the loading GIF once the response is received.
	loadingGifElem.style.display = 'none';
	// Display the statusElem's text in the placeholder.
	statusElem.style.display = 'inline';

	response.text()
	.then((text) => {
		statusElem.textContent = text;
	})
	.catch((error) => {
		statusElem.textContent = 'connection timed out';  // Adjust error handling if required.
	});
}

// Function to change input fields dynamically based on category selection
function updateFields() {
	const category = document.getElementById('category-select').value;

	// Define placeholders, IDs, and input types for each category
	const placeholders = {
		"aircrafts": [
			{ placeholder: "Aircraft ID", id: "aircraftID", type: "text" },
			{ placeholder: "Year Introduced", id: "yearIntroduced", type: "text" },
			{ placeholder: "Model", id: "model", type: "text" },
			{ placeholder: "Manufacturer", id: "manufacturer", type: "text" },
			{ placeholder: "Main Weapon", id: "mainWeapon", type: "text" }
		],
		"mechanics": [
			{ placeholder: "Mechanic ID", id: "mechanicID", type: "text" },
			{ placeholder: "Name", id: "mechanicName", type: "text" },
			{ placeholder: "Contact", id: "mechanicContact", type: "text" },
			{ placeholder: "Availability Status (O/F)", id: "availabilityStatus", type: "text" }
		],
		"crew": [
			{ placeholder: "Pilot/Crew ID", id: "crewID", type: "text" },
			{ placeholder: "Name", id: "crewName", type: "text" },
			{ placeholder: "Role", id: "crewRole", type: "text" },
			{ placeholder: "Rank", id: "crewRank", type: "text" }
		],
		"missions": [
			{ placeholder: "Mission ID", id: "missionID", type: "text" },
			{ placeholder: "Mission Date (dd/mm/yyyy)", id: "missionDate", type: "text" },
			{ placeholder: "Mission Location", id: "missionLocation", type: "text" },
			{ placeholder: "Weather", id: "missionWeather", type: "text" },
			{ placeholder: "Outcome (S/F)", id: "missionOutcome", type: "text" },
			{ placeholder: "Duration (in seconds)", id: "missionDuration", type: "text" }
		],
		"maintenance": [
			{ placeholder: "Maintenance ID", id: "maintenanceID", type: "text" },
			{ placeholder: "Complexity level (L/M/H)", id: "complexity", type: "text" },
			{ placeholder: "Downtime", id: "downtime", type: "text" },
			{ placeholder: "Maintenance date (dd/mm/yyyy)", id: "maintenanceDate", type: "text" },
			{ placeholder: "Parts", id: "parts", type: "text" },
			{ placeholder: "Repairbase X coordinate", id: "coordinateX", type: "text" },
			{ placeholder: "Repairbase Y coordinate", id: "coordinateY", type: "text" },
			{ placeholder: "Aircraft ID", id: "aircraftID", type: "text" },
		]
	};

	const buttonTexts = {
		'aircrafts': "Add Aircraft",
		'mechanics': "Add Mechanic",
		'crew': "Add Pilot/Crew",
		'missions': "Add Mission",
		'maintenance': "Add Maintenance Task"
	};

	// Update placeholders and types for input fields
	const fields = document.querySelectorAll('#add-record-details-div .input-div input');

	fields.forEach((field, index) => {
		if (index < placeholders[category].length) {
			field.placeholder = placeholders[category][index].placeholder;
			field.id = placeholders[category][index].id;
			field.type = placeholders[category][index].type;
			field.style.display = "block";  // Show relevant fields
		} else {
			field.style.display = "none";   // Hide unused fields
		}
	});

	// Update button text and assign onclick function
	const submitButton = document.getElementById('submit-button');
	submitButton.textContent = buttonTexts[category];

	if (category === 'aircrafts') {
		submitButton.onclick = addAircraft;
	} else if (category === 'mechanics') {
		submitButton.onclick = addMechanic;
	} else if (category === 'crew') {
		submitButton.onclick = addCrew;
	} else if (category === 'missions'){
		submitButton.onclick = addMission;
	} else {
		submitButton.onclick = addMaintenance;
	}
}

function sanitization(text) {
	return text.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");
}

// Function to add a new aircraft
function addAircraft() {
	const aircraftID = sanitization(document.getElementById('aircraftID').value);
	const yearIntroduced = sanitization(document.getElementById('yearIntroduced').value);
	const model = sanitization(document.getElementById('model').value);
	const manufacturer = sanitization(document.getElementById('manufacturer').value);
	const mainWeapon = sanitization(document.getElementById('mainWeapon').value);

	if (aircraftID) {
		fetch('/add-aircraft', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ aircraftID, yearIntroduced, model, manufacturer, mainWeapon })
		})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					alert('Aircraft is added to database successfully!');
					location.reload();
				} else {
					alert('Error occurred adding aircraft');
				}
			})
			.catch(error => alert('Error adding aircraft:', error));
	} else {
		alert("Aircraft Id is required and must be valid!");
	}
}

// Function to add a new mechanic
function addMechanic() {
	const mechanicID = sanitization(document.getElementById('mechanicID').value);
	const mechanicName = sanitization(document.getElementById('mechanicName').value);
	const mechanicContact = sanitization(document.getElementById('mechanicContact').value);
	const availabilityStatus = sanitization(document.getElementById('availabilityStatus').value);

	if (mechanicID && mechanicName && mechanicContact && availabilityStatus && (availabilityStatus == 'F' || availabilityStatus == 'O')) {
		fetch('/add-mechanic', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ mechanicID, mechanicName, mechanicContact, availabilityStatus })
		})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					alert('Mechanic is added to database successfully!');
					location.reload();
				} else {
					alert('Error occurred adding mechanic');
				}
			})
			.catch(error => alert('Error adding mechanic:', error));
	} else {
		alert("Invalid Attribute Entered");
	}
}

// Function to add a new Crew
function addCrew() {
	const crewID = sanitization(document.getElementById('crewID').value);
	const crewName = sanitization(document.getElementById('crewName').value);
	const crewRole = sanitization(document.getElementById('crewRole').value);
	const crewRank = sanitization(document.getElementById('crewRank').value);

	if (crewID) {
		fetch('/add-crew', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ crewID, crewName, crewRole, crewRank })
		})
			.then(response => response.json())
			.then(data => {
                if (data.success) {
                    alert('Crew is added to database successfully!');
                    location.reload();
                } else {
                    alert('Error occurred adding crew');
                }
            })
			.catch(error => alert('Error adding crew:', error));
	} else {
		alert("CrewID is required and must be valid!");
	}
}

// Function to add a new Mission
function addMission() {
	const missionID = sanitization(document.getElementById('missionID').value);
	const missionDate = sanitization(document.getElementById('missionDate').value);
	const missionLocation = sanitization(document.getElementById('missionLocation').value);
	const missionWeather = sanitization(document.getElementById('missionWeather').value);
	const missionOutcome = sanitization(document.getElementById('missionOutcome').value);
	const missionDuration = sanitization(document.getElementById('missionDuration').value);

	if (missionID) {
		fetch('/add-mission', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ missionID, missionDate, missionLocation,
			missionWeather, missionOutcome, missionDuration })
		})
			.then(response => response.json())
			.then(data => {
                if (data.success) {
                    alert('Mission is added to database successfully!');
                    location.reload();
                } else {
                    alert('Error occurred adding mission');
                }
            })
			.catch(error => alert('Error adding mission:', error));
	} else {
		alert("MissionID is required and must be valid!");
	}
}

// Function to add a new Maintenance
function addMaintenance() {
	const maintenanceID = sanitization(document.getElementById('maintenanceID').value);
	const complexityLevel = sanitization(document.getElementById('complexity').value);
	const downtime = sanitization(document.getElementById('downtime').value);
	const maintenanceDate = sanitization(document.getElementById('maintenanceDate').value);
	const parts = sanitization(document.getElementById('parts').value);
	const coordinateX = sanitization(document.getElementById('coordinateX').value);
	const coordinateY = sanitization(document.getElementById('coordinateY').value);
	const aircraftID = sanitization(document.getElementById('aircraftID').value);

	// Check that the maintenanceID exists and has no other aircraft assign to it
	if (maintenanceID && coordinateX && coordinateY && aircraftID) {
		fetch('/add-maintenance', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ maintenanceID, complexityLevel, downtime, maintenanceDate, parts, coordinateX, coordinateY, aircraftID })
		})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					alert('Maintenance is added to database successfully!');
					location.reload();
				} else {
					alert('Error occurred adding maintenance');
				}
			})
			.catch(error => alert('Error adding maintenance:', error));
	} else {
		alert("MaintenanceID is required and must be valid!");
	}
}

// AIRCRAFT

//fetches data from the /get_aircrafts endpoint
// Populate the table
async function loadAircraftData() {
	const response = await fetch('/get_aircraft');
	const data = await response.json();

	const tableBody = document.querySelector('#aircraftTable tbody');
	tableBody.innerHTML = ''; // Clear existing data

	data.forEach(aircraft => {
		const row = document.createElement('tr');
		Object.values(aircraft).forEach(value => {
			const cell = document.createElement('td');
			cell.textContent = value;
			row.appendChild(cell);
		});
		tableBody.appendChild(row);
	});
}

// Returns the max average downtime of the crew member
async function fetchMaxAvgDowntime() {
	try {
		const response = await fetch('/max_avg_downtime');
		const responseData = await response.json(); // responseData is { data: [[400]] }
		const data = responseData.data; // Extract the 2D array

		if (Array.isArray(data) && data.length > 0) {
			const flatData = data.map(row => row[0]);

			const tableBody = document.getElementById('tableBody');
			if (tableBody) {
				tableBody.innerHTML = '';
				flatData.forEach(item => {
					const row = `
						<tr>
							<td>${item}</td>
						</tr>`;
					tableBody.innerHTML += row;
				});
			}

			const popupModal = document.getElementById('popupModal');
			if (popupModal) {
				popupModal.innerHTML = `
					<h2>Max Avg Downtime</h2>
					<ul>
						${flatData.map(item => `<li>${item}</li>`).join('')}
					</ul>
					<button onclick="closePopup()">Close</button>
				`;
				openPopup();
			} else {
				alert('Popup modal element not found.');
			}
		} else {
			alert('No data found or invalid format');
		}
	} catch (error) {
		alert('Error fetching max average downtime:', error);
	}
}

// Functions adds damage to a particular aircraft
function addDamage() {
	const aircraftID = sanitization(document.getElementById('damageAircraftID').value);
	const damagePart = sanitization(document.getElementById('damagePart').value);
	const damageDate = sanitization(document.getElementById('damageDate').value);

	if (aircraftID && damagePart && damageDate) {
		fetch('/add-damage', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ aircraftID, damagePart, damageDate })
		})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					alert('Damage is added successfully!');
					location.reload();
				} else {
					alert('Error occurred adding damage');
				}
			})
			.catch(error => alert('Error adding damage:', error));
	} else {
		alert("AircraftID, DamagePart, DamageDate are required and must be valid!");
	}
}

// Function to assign a crew to an aircraft
// Can only be assigned to an existing crew, aircraft
function assignCrewToAircraft() {
	const aircraftID = sanitization(document.getElementById('aircraftID').value);
	const crewID = sanitization(document.getElementById('crewID').value);

	if (aircraftID && crewID) {
		fetch('/assign-crew-to-aircraft', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ aircraftID, crewID })
		})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					alert('Crew is assigned to aircraft successfully!');
					location.reload();
				} else {
					alert('Error adding Crew To Aircraft');
				}
			})
			.catch(error => alert('Error adding Crew To Aircraft'));
	} else {
		alert("Both aircraftID and crewID are required and must be valid!");
	}
}

// Function to remove an aircraft
function removeAircraft() {
	const aircraftID = sanitization(prompt("Enter the Aircraft ID to remove:"));

	if (aircraftID) {
		fetch('/remove-aircraft', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ aircraftID })
		})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					alert(`Aircraft with ID ${aircraftID} is no longer in the database.`);
					location.reload();
				} else {
					alert("Failed to remove the aircraft. Please try again.");
				}
			})
			.catch(error => {
				alert("An error occurred while trying to remove the aircraft.");
			});
	} else {
		alert("Aircraft ID is required to remove an aircraft.");
	}
}

// assign a maintenance to an aircraft
function assignMaintenance() {
	const maintenanceID = sanitization(document.getElementById('assignMaintenanceID').value);
	const aircraftID = sanitization(document.getElementById('assignAircraftID').value);

	if (maintenanceID && aircraftID) {
		fetch('/assign-maintenance', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ aircraftID, maintenanceID })
		})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					alert(`maintenanceID with ID ${maintenanceID} is assigned successfully.`);
					location.reload();
				} else {
					alert("Failed to assign the maintenance. Please try again.");
				}
			})
			.catch(error => {
				alert("An error occurred while trying to assign maintenance.");
			});
	} else {
		alert("Maintenance ID is required to assigning an maintenance.");
	}
}

// Function to complete a maintenance task
function completeMaintenanceTask() {
	const maintenanceID = sanitization(document.getElementById('maintenanceID').value);

	if (maintenanceID) {
		fetch('/remove-maintenance', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ maintenanceID })
		})
		.then(response => response.json())
		.then(data => {
			if (data.success) {
				alert(`maintenanceID with ID ${maintenanceID} is no longer in the database.`);
				location.reload();
			} else {
				alert("Failed to complete the maintenance. Please try again.");
			}
		})
		.catch(error => {
			alert("An error occurred while trying to complete maintenance.");
		});
	} else {
		alert("Maintenance ID is required to complete an maintenance.");
	}
}

// CREW ()

// Populate crew data to the table
async function loadCrewData() {
	const response = await fetch('/get_crew');
	const data = await response.json();

	const tableBody = document.querySelector('#crewTable tbody');
	tableBody.innerHTML = '';

	data.forEach(crew => {
		const row = document.createElement('tr');

		Object.values(crew).forEach(value => {
			const cell = document.createElement('td');
			cell.textContent = value;
			row.appendChild(cell);
		});
		tableBody.appendChild(row);
	});
}

// get veterans (who done every mission)
async function getVeterans() {
	try {
		const response = await fetch('/get_Veterans');
		const responseData = await response.json();
		const data = responseData.data;

    		if (Array.isArray(data)) {
				const tableBody = document.getElementById('tableBody');
				if (tableBody) {
					tableBody.innerHTML = '';
					data.forEach(row => {
						const rowHTML = `
							<tr>
								<td>${row[0]}</td>
								<td>${row[1]}</td>
								<td>${row[2]}</td>
								<td>${row[3]}</td>
							</tr>`;
						tableBody.innerHTML += rowHTML;
					});
				}

				const popupModal = document.getElementById('popupModal');
				if (popupModal) {
					popupModal.innerHTML = `
						<h2>Veterans</h2>
						<table>
							<thead>
								<tr>
									<th>Crew ID</th>
									<th>Name</th>
									<th>Role</th>
									<th>Rank</th>
								</tr>
							</thead>
							<tbody>
								${data.map(row => `
									<tr>
										<td>${row[0]}</td>
										<td>${row[1]}</td>
										<td>${row[2]}</td>
										<td>${row[3]}</td>
									</tr>
								`).join('')}
							</tbody>
						</table>
						<button onclick="closePopup()">Close</button>
					`;
    				openPopup();
    			} else {
    				alert('Popup modal element not found.');
    			}
    		} else {
    			alert('No Veteran found');
    		}
    	} catch (error) {
    		alert('Error fetching excess roles:', error);
    	}
}

// get the excess roles of crews, roles with more than 5 crews
async function getExcessRoles() {
	try {
		const response = await fetch('/excess_Roles');

		const responseData = await response.json();
		const data = responseData.data;

		if (Array.isArray(data)) {
			const tableBody = document.getElementById('tableBody');
			if (tableBody) {
				tableBody.innerHTML = '';
				data.forEach(row => {
					const rowHTML = `
						<tr>
							<td>${row[0]}</td>
							<td>${row[1]}</td>
						</tr>`;
					tableBody.innerHTML += rowHTML;
				});
			}

			const popupModal = document.getElementById('popupModal');
			if (popupModal) {
				popupModal.innerHTML = `
					<h2>Excess Role</h2>
					<table>
						<thead>
							<tr>
								<th>Role</th>
								<th>NumberTotal Mechanics</th>
							</tr>
						</thead>
						<tbody>
							${data.map(row => `
								<tr>
									<td>${row[0]}</td>
									<td>${row[1]}</td>
								</tr>
							`).join('')}
						</tbody>
					</table>
					<button onclick="closePopup()">Close</button>
				`;
				openPopup();
			} else {
				alert('Popup modal element not found.');
			}
		} else {
			alert('No excess roles found');
		}
	} catch (error) {
		alert('Error fetching excess roles:', error);
	}
}

// It demotes or promotes a crew member
function updateRank() {
	const crewID = sanitization(document.getElementById('promoteCrewID').value);
	const newRank = sanitization(document.getElementById('rank').value);

	if (crewID && newRank) {
		fetch('/update-rank', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ crewID, newRank })
		})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					alert('Rank updated!');
					location.reload();
				} else {
					alert("Failed to update rank. Please try again.");
				}
			})
			.catch(error => alert('Error updating rank:', error));
	} else {
		alert("Both crewID and newRank are required and must be valid!");
	}
}

// MECHANIC (Complete)

// Populate the table
async function loadMechanicData() {
	const response = await fetch('/get_mechanic');
	const data = await response.json();

	const tableBody = document.querySelector('#mechanicTable tbody');
	tableBody.innerHTML = '';

	data.forEach(mechanic => {
		const row = document.createElement('tr');

		Object.values(mechanic).forEach(value => {
			const cell = document.createElement('td');
			cell.textContent = value;
			row.appendChild(cell);
		});
		tableBody.appendChild(row);
	});
}

// get the max working hours of the crews
async function fetchMaxWorkingHours() {
	try {
		const response = await fetch('/max_working_hours');
		const responseData = await response.json();
		const data = responseData.data;

		const tableBody = document.getElementById('tableBody');
		if (tableBody) {
			tableBody.innerHTML = '';
			data.forEach(row => {
				const rowHTML = `
					<tr>
						<td>${row[0]}</td> <!-- Mechanic Name -->
						<td>${row[1]}</td> <!-- Max Working Hours -->
					</tr>`;
				tableBody.innerHTML += rowHTML;
			});
		}

		const popupModal = document.getElementById('popupModal');
		if (popupModal) {
			const [name, hours] = data[0];
			popupModal.innerHTML = `
				<h2>Max Working Hours</h2>
				<p><strong>Mechanic Name:</strong> ${name}</p>
				<p><strong>Max Working Hours:</strong> ${hours}</p>
				<button onclick="closePopup()">Close</button>
			`;
			openPopup();
		} else {
			alert('Popup modal element not found.');
		}
	} catch (error) {
		alert('Error fetching max working hours:', error);
	}
}

// Function to assign a mechanic to a maintenance task
// Maintenance task and mechanic must already exist in relations
function assignTask() {
	const mechanicID = sanitization(document.getElementById('mechanicID').value);
	const maintenanceID = sanitization(document.getElementById('maintenanceID').value);
	const hours = sanitization(document.getElementById('hours').value);

	if (mechanicID && maintenanceID) {
		fetch('/assign-task', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ mechanicID, maintenanceID, hours})
		})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					alert('Task assigned successfully!');
					location.reload();
				} else {
					alert('Error occurred assigning task');
				}
			})
			.catch(error => alert('Error adding assignTask:', error));
	} else {
		alert("Both mechanicID and maintenanceID are required and must be valid!");
	}
}

// Function to group by status to show how many mechanics are available
async function getStatus() {
	try {
		const response = await fetch('/get_Mechanic_Status');
		const responseData = await response.json();
		const data = responseData.data;

		if (Array.isArray(data)) {
			const tableBody = document.getElementById('tableBody');
			if (tableBody) {
				tableBody.innerHTML = '';
				data.forEach(row => {
					const rowHTML = `
						<tr>
							<td>${row[0]}</td>
							<td>${row[1]}</td>
						</tr>`;
					tableBody.innerHTML += rowHTML;
				});
			}

			const popupModal = document.getElementById('popupModal');
			if (popupModal) {
				popupModal.innerHTML = `
					<h2>Mechanic Status</h2>
					<table>
						<thead>
							<tr>
								<th>Availability Status</th>
								<th>Total Mechanics</th>
							</tr>
						</thead>
						<tbody>
							${data.map(row => `
								<tr>
									<td>${row[0]}</td>
									<td>${row[1]}</td>
								</tr>
							`).join('')}
						</tbody>
					</table>
					<button onclick="closePopup()">Close</button>
				`;
				openPopup();
			} else {
				alert('Popup modal element not found.');
			}
		} else {
			alert('Unexpected data format: ', data);
		}
	} catch (error) {
		alert('Error fetching mechanic status:', error);
	}
}


// MISSION (Complete)

// Populate the table
async function loadMissionData() {

	const response = await fetch('/mission');
	const data = await response.json();

	const tableBody = document.querySelector('#missionTable tbody');
	tableBody.innerHTML = ''; // Clear existing data

	data.forEach(mission => {
		const row = document.createElement('tr');

		// Create columns for each data point
		Object.values(mission).forEach(value => {
			const cell = document.createElement('td');
			cell.textContent = value;
			row.appendChild(cell);
		});
		tableBody.appendChild(row);
	});
}

// Assign crew to squadron and mission and vice versa
function assignCrewInSquadronToMission() {
	const crewID = sanitization(document.getElementById('crewID').value);
	const missionID = sanitization(document.getElementById('missionID').value);
	const squadronID = sanitization(document.getElementById('squadronID').value);

	if (crewID && missionID && squadronID) {
		fetch('/fly', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ crewID, missionID, squadronID })
		})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					alert('Crew and Squadron assigned successfully!');
					location.reload();
				} else {
					alert('Error occurred when assigning crew and squadron');
				}
			})
			.catch(error => alert('Error assigning crew and squadron:', error));
	} else {
		alert("crewID and missionID and squadronID are required and must be valid!");
	}
}

// No need add or remove functions for RepairBase, HomeBase and squadron. Use existing tuples from the databse

// ALL OTHER
function openPopup() {
	document.getElementById('popupOverlay').style.display = 'block';
	document.getElementById('popupModal').style.display = 'block';
}

function closePopup() {
	document.getElementById('popupOverlay').style.display = 'none';
	document.getElementById('popupModal').style.display = 'none';
}

window.onload = function() {
	checkDbConnection();
	loadAircraftData();
	loadCrewData();
	loadMechanicData();
	loadMissionData();
};