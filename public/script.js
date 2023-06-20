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

  const logRef = firebase.database().ref(`runningLog/lastTen`);

  // Attach listener for child_added event.
  logRef.on("child_added", function (snapshot) {
    let log = snapshot.val();

    // Create a new log card and add it to the logContainer.
    let logCard = document.createElement("div");
    logCard.className = "logCard animate__animated animate__backInDown";
    logCard.id = snapshot.key; // Store Firebase key to match card with data.
    logCard.innerHTML = `
        <h4>${moment(log.timestamp).format("LTS")}</h4>
        <p>${log.message}</p>
    `;

    // Insert the new log card at the top of the logContainer.
    logContainer.insertBefore(logCard, logContainer.firstChild);
});

  // Attach listener for child_removed event.
  logRef.on("child_removed", function (snapshot) {
    let logCard = document.getElementById(snapshot.key);
    if (logCard) {
      logContainer.removeChild(logCard);
    }
  });
});
