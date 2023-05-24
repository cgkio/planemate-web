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
  for (let i = 1; i <= 16; i++) {
    const doorRef = firebase.database().ref(`doors/Door${i}`);
    doorRef.on("value", (snapshot) => {
      const status = snapshot.val();
      updateDoorColor(i, status);
    });
  }

  // Reference to the lastTransaction in Firebase Realtime Database
  const lastTransactionRef = database.ref("lastTransaction");

  // Listen for changes to the lastTransaction data
  lastTransactionRef.on("value", (snapshot) => {
    const data = snapshot.val();

    // Convert timestamps to readable format
    const closeTimestamp = moment(data.closeTimestamp).format('LTS');
    const firstPassengerTimestamp = moment(data.firstPassengerTimestamp).format('LTS');
    const lastPassengerTimestamp = moment(data.lastPassengerTimestamp).format('LTS');
    const openTimestamp = moment(data.openTimestamp).format('LTS');

    // Set the data to HTML elements
    document.getElementById("boarding-duration").textContent =
      data.boardingDuration.toFixed(2) + " seconds";
    document.getElementById("door-open-duration").textContent =
      data.doorOpenDuration.toFixed(2) + " seconds";
    document.getElementById("close-timestamp").textContent = closeTimestamp;
    document.getElementById("first-passenger-timestamp").textContent =
      firstPassengerTimestamp;
    document.getElementById("last-passenger-timestamp").textContent =
      lastPassengerTimestamp;
    document.getElementById("open-timestamp").textContent = openTimestamp;
    document.getElementById("people-count").textContent = data.peopleCount;
    document.getElementById("passenger-count").textContent = data.activePassengerCount;
  });

  // Function to calculate the time difference between now and the last updated timestamp
  function getTimeSinceUpdate(lastUpdatedTimestamp) {
    const now = new Date();
    const updatedTimestamp = new Date(lastUpdatedTimestamp);
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

    // // Add the flashing class
    // statusMessageElement.classList.add("flash");

    // // Remove the flashing class after 5 seconds
    // setTimeout(() => {
    //   statusMessageElement.classList.remove("flash");
    // }, 5000);

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

  // Add this inside your "window.addEventListener("load", function ()" block
  // Fetch average turnaround time overall from Firebase
  const averageTurnaroundTimeRef = database.ref(
    "stats/AverageTurnaroundTimeOverall"
  );

  const averageBoardingTimeRef = database.ref("stats/AverageBoardingTime");

  const averageLoadRef = database.ref("stats/AverageLoad");

  averageTurnaroundTimeRef.on("value", (snapshot) => {
    const averageTurnaroundTime = snapshot.val();
    document.getElementById("average-turnaround-time").textContent =
      averageTurnaroundTime;
  });

  averageBoardingTimeRef.on("value", (snapshot) => {
    const AverageBoardingTime = snapshot.val();
    document.getElementById("average-boarding-time").textContent =
      AverageBoardingTime;
  });

  averageLoadRef.on("value", (snapshot) => {
    const AverageLoad = snapshot.val();
    document.getElementById("average-load").textContent = AverageLoad;
  });

  // Fetch individual door turnaround times from Firebase
  for (let i = 1; i <= 16; i++) {
    const doorAverageTurnaroundTimeRef = database.ref(
      `stats/Door${i}AverageTurnaroundTime`
    );
    doorAverageTurnaroundTimeRef.on("value", (snapshot) => {
      const doorAverageTurnaroundTime = snapshot.val();
      document.getElementById(
        `door${i}AverageTurnaroundTime`
      ).textContent = `Door ${i}: ${doorAverageTurnaroundTime}`;
    });
  }
});
