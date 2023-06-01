// Initialize Firebase
var firebaseConfig = {
    apiKey: "AIzaSyBe5xjnc0ysOn1eHySuntTN_uVwCtNcWfQ",
    authDomain: "planemate-4aabc.firebaseapp.com",
    databaseURL: "https://planemate-4aabc-default-rtdb.firebaseio.com",
    projectId: "planemate-4aabc",
    storageBucket: "planemate-4aabc.appspot.com",
    messagingSenderId: "213497172210",
    appId: "1:213497172210:web:fa19e97749593ca0d5c06b",
  };
  firebase.initializeApp(firebaseConfig);
  var db = firebase.database();
  
  window.onload = function() {
    var toggleLatestTransaction = document.getElementById('toggleLatestTransaction');
    var toggleVariables = document.getElementById('toggleVariables');
  
    // Load initial state from Firebase
    db.ref('dashboard').on('value', function(snapshot) {
      var data = snapshot.val();
      toggleLatestTransaction.checked = data.displayLatestTransaction;
      toggleVariables.checked = data.displayVariables;
    });
  
    // Update Firebase when toggles change
    toggleLatestTransaction.addEventListener('change', function() {
      db.ref('dashboard').update({
        displayLatestTransaction: toggleLatestTransaction.checked
      });
    });
  
    toggleVariables.addEventListener('change', function() {
      db.ref('dashboard').update({
        displayVariables: toggleVariables.checked
      });
    });
  };
  