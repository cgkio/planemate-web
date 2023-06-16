window.addEventListener("load", function () {
  const doorPositions = [
    { x: 670, y: 327 }, // Door1
    { x: 705, y: 327 }, // Door2
    { x: 850, y: 327 }, // Door3
    { x: 885, y: 327 }, // Door4
    { x: 1060, y: 327 }, // Door5
    { x: 1095, y: 327 }, // Door6
    { x: 1235, y: 327 }, // Door7
    { x: 1270, y: 327 }, // Door8
    { x: 660, y: 413 }, // Door9
    { x: 705, y: 413 }, // Door10
    { x: 850, y: 413 }, // Door11
    { x: 885, y: 413 }, // Door12
    { x: 1050, y: 413 }, // Door13
    { x: 1085, y: 413 }, // Door14
    { x: 1235, y: 413 }, // Door15
    { x: 1270, y: 413 }, // Door16
  ];

  // Initialize doors and set their positions
  doorPositions.forEach((position, index) => {
    try {
      const door = document.getElementById(`door${index + 1}`);
      door.style.left = `${position.x}px`;
      door.style.top = `${position.y}px`;
    } catch (error) {
      console.error(`Error in door${index + 1}:`, error);
    }
  });

  // Function to update door color based on status
  function updateDoorColor(doorNumber, status) {
    const door = document.getElementById(`door${doorNumber}`);
    door.style.backgroundColor = status ? "red" : "green";
    if (status) {
      door.classList.remove("green-door");
    } else {
      door.classList.add("green-door");
    }
  }

  // Connect to Firebase Realtime Database
  const database = firebase.database();

  // Listen for changes in door statuses
  for (let i = 1; i <= 32; i += 2) {
    const door1Ref = firebase.database().ref(`doors/Door${i}`);
    const door2Ref = firebase.database().ref(`doors/Door${i + 1}`);

    door1Ref.on("value", (snapshot) => {
      const status = snapshot.val();
      updateDoorColor(i, status);
    });

    door2Ref.on("value", (snapshot) => {
      const status = snapshot.val();
      updateDoorColor(i + 1, status);
    });
  }

  function updateDoorColor(doorNumber, status) {
    // Find which half-door to update, round down because doorNumber starts from 1
    const halfDoorNumber = Math.floor((doorNumber - 1) / 2) + 1;
    // Find whether to update the left half (even doorNumber) or right half (odd doorNumber)
    const halfDoorSide = doorNumber % 2 === 0 ? "right" : "left";

    const doorElement = document.getElementById(
      `door${halfDoorNumber}-${halfDoorSide}`
    );
    doorElement.className = status
      ? "half-door open-door"
      : "half-door closed-door";
  }

  // Reference to the lastTransaction in Firebase Realtime Database
  const lastTransactionRef = database.ref("lastTransaction");

  // Listen for changes to the lastTransaction data
  lastTransactionRef.on("value", (snapshot) => {
    const data = snapshot.val();

    // Set the data to HTML elements for the last reported transaction call out
    // document.getElementById("boarding-duration").textContent =
    //   data.boardingDuration.toFixed(2) + " seconds";
    document.getElementById("boarding-duration").textContent =
      data.boardingDuration;
    document.getElementById("door-open-duration").textContent =
      data.doorOpenDuration;
    document.getElementById("close-timestamp").textContent =
      data.closeTimestamp;
    document.getElementById("first-passenger-timestamp").textContent =
      data.firstPassengerTimestamp;
    document.getElementById("last-passenger-timestamp").textContent =
      data.lastPassengerTimestamp;
    document.getElementById("open-timestamp").textContent = data.openTimestamp;
    document.getElementById("planeMate-OnTimeYN").textContent =
      data.planeMateOnTime;
    document.getElementById("location").textContent = data.location;
    document.getElementById("turnaround-time").textContent =
      data.turnaroundTime;
    // document.getElementById("people-count").textContent = data.peopleCount;
    document.getElementById("passenger-count").textContent =
      data.activePassengerCount;
  });

 // Function to calculate the time difference between now and the last updated timestamp
function getTimeSince(unixTimestampMilliseconds) {
  if (isNaN(unixTimestampMilliseconds)) {
    return "Invalid timestamp!";
  }

  const now = new Date();
  const updatedTimestamp = new Date(unixTimestampMilliseconds); // Convert from UNIX timestamp to Date object
  let diffInSeconds = Math.floor((now - updatedTimestamp) / 1000);

  let days = Math.floor(diffInSeconds / (3600 * 24));
  diffInSeconds -= days * 3600 * 24;
  let hrs = Math.floor(diffInSeconds / 3600);
  diffInSeconds -= hrs * 3600;
  let mins = Math.floor(diffInSeconds / 60);
  diffInSeconds -= mins * 60;

  return `${days} days, ${hrs} hours, ${mins} minutes, and ${diffInSeconds} seconds ago.`;
}

// Function to calculate the time difference between now and the last updated timestamp
function getTimeSince(unixTimestampMilliseconds) {
  if (isNaN(unixTimestampMilliseconds)) {
    return "Invalid timestamp!";
  }

  const now = new Date();
  const updatedTimestamp = new Date(unixTimestampMilliseconds); // Convert from UNIX timestamp to Date object
  let diffInSeconds = Math.floor((now - updatedTimestamp) / 1000);

  let days = Math.floor(diffInSeconds / (3600 * 24));
  diffInSeconds -= days * 3600 * 24;
  let hrs = Math.floor(diffInSeconds / 3600);
  diffInSeconds -= hrs * 3600;
  let mins = Math.floor(diffInSeconds / 60);
  diffInSeconds -= mins * 60;

  return `${days} days, ${hrs} hours, ${mins} minutes, and ${diffInSeconds} seconds ago.`;
}

  // Get reference to the status message in the database
  const statusMessageRef = database.ref("message");

  // Listen for changes to the status message
  statusMessageRef.on("value", (snapshot) => {
    const message = snapshot.val();
    const statusMessageElement = document.getElementById("status-message");

    statusMessageElement.innerText = message.main;

    const timestampElement = document.getElementById("timestampUpdated");
    timestampElement.innerText = getTimeSinceUpdate(message.updated);

    // Clear the previous interval if it exists
    if (window.timeSinceUpdateInterval) {
      clearInterval(window.timeSinceUpdateInterval);
    }

    // Update the "time since last update" every second
    window.timeSinceUpdateInterval = setInterval(() => {
      timestampElement.innerText = getTimeSinceUpdate(message.updated);
    }, 1000);
  });

  // Reference to the stats in Firebase Realtime Database
  const statsRef = database.ref("stats");

  // Listen for changes to the lastTransaction data
  statsRef.on("value", (snapshot) => {
    const statsdata = snapshot.val();

    // Set the data to HTML elements
    document.getElementById("average-load").textContent = statsdata.AverageLoad;
    document.getElementById("average-boarding-time").textContent =
      statsdata.AverageBoardingTime;
    document.getElementById("average-turnaround-time").textContent =
      statsdata.AverageTurnaroundTimeOverall;
    document.getElementById("planeMate-OnTime-stat").textContent =
      statsdata.planeMateOnTime;
  });

  // Reference to the variables in Firebase Realtime Database
  const variablesRef = database.ref("variables");

  // Listen for changes to the lastTransaction data
  variablesRef.on("value", (snapshot) => {
    const vardata = snapshot.val();

    // Set the data to HTML elements
    // document.getElementById("baselineDetectedPulses").textContent = vardata.baselineDetectedPulses;
    document.getElementById("boardingStartPersons").textContent =
      vardata.boardingStartPersons;
    document.getElementById("boardingStartTimeWindow").textContent =
      vardata.boardingStartTimeWindow;
    document.getElementById("initialDoorOpenDelay").textContent =
      vardata.initialDoorOpenDelay;
    // document.getElementById("personDetectedPulses").textContent = vardata.personDetectedPulses;
    document.getElementById("turnaroundReset").textContent =
      vardata.turnaroundReset;
    document.getElementById("baselineVariance").textContent =
      vardata.baselineVariance;
    document.getElementById("KPIrecalulation").textContent =
      vardata.KPIrecalulation;
    document.getElementById("onTimeDeterminationLimit").textContent =
      vardata.onTimeDeterminationLimit;
    document.getElementById("falsePositiveDoorOpening").textContent =
      vardata.falsePositiveDoorOpening;
    document.getElementById("lastPassengerSubtraction").textContent =
      vardata.lastPassengerSubtraction;
  });

  var db = firebase.database();
  db.ref("dashboard").on("value", function (snapshot) {
    var data = snapshot.val();

    var calloutBox = document.getElementById("callout-box");
    var calloutBox7 = document.getElementById("callout-box-7");

    if (data.displayLatestTransaction) {
      calloutBox.style.display = "block";
    } else {
      calloutBox.style.display = "none";
    }

    if (data.displayVariables) {
      calloutBox7.style.display = "block";
    } else {
      calloutBox7.style.display = "none";
    }
  });

  function updateLog(item, index) {
    let logContainer = document.getElementById("logContainer");
    let logItem = document.createElement("div");
    logItem.id = `logItem${index}`;

    let logMessage = document.createElement("p");
    logMessage.id = `logMessage${index}`;
    logMessage.innerText = item.message;

    let logTimestamp = document.createElement("p");
    logTimestamp.id = `logTimestamp${index}`;
    logTimestamp.classList.add("timestamp-text");
    logTimestamp.dataset.timestamp = item.timestamp;  // store original timestamp in a data attribute
    logTimestamp.innerText = `${getTimeSince(item.timestamp)} ago`;

    logItem.appendChild(logMessage);
    logItem.appendChild(logTimestamp);
    logContainer.appendChild(logItem);
}

// Call this function every second to update all the timestamps
setInterval(() => {
  let timestamps = document.getElementsByClassName("timestamp-text");
  for (let i = 0; i < timestamps.length; i++) {
      let timestamp = parseInt(timestamps[i].dataset.timestamp); // get the original timestamp value
      timestamps[i].innerText = `${getTimeSince(timestamp)} ago`;
  }
}, 1000);

const logRef = firebase.database().ref(`runningLog/lastTen`);
logRef.on("value", (snapshot) => {
    const logData = snapshot.val();
    let index = 1;
    for (let key in logData) {
        const data = logData[key];
        // Pass in the time since the last update using the getTimeSince function
        updateLog(data, index);
        index++;
    }
});
  
});
