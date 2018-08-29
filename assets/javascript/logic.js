$('#resultsContainer').hide(); //Hides the results container before the page loads

//Inial function to load on document ready
$(document).ready(function(){

//#region initialize firebase, global config, and global variables

  //Initialize Firebase For Users Data Collection
  var config = {
        apiKey: "AIzaSyCRmQIgP5QRngV4cj6Z0bDnabYv-5_1vF8",
        authDomain: "orlandotravelproject.firebaseapp.com",
        databaseURL: "https://orlandotravelproject.firebaseio.com",
        projectId: "orlandotravelproject",
        storageBucket: "orlandotravelproject.appspot.com",
        messagingSenderId: "182828242079"
    };
  firebase.initializeApp(config);
 
  // Define database variables
  var db = firebase.database();

  // Database reference for guests
  var guestsRef = db.ref("/guests");
  var ridesRef = db.ref("/attractions")
  var adultsRef = db.ref("/attractions/adultsList") //List of attractions for adults only
  var kidsRef = db.ref("/attractions/kidsList") //List of attractions for parties with kids
  var babiesRef = db.ref("/attractions/babiesList") //List of attractions for parties with babies
  var bothRef = db.ref("/attractions/kidsAndBabiesList") //List of attractions for parties with kids and babies

  //Global Variables

  rideList = [] // Client-Side JavaScript Variable to contain the FireBase Attraction List
  // rideList is blank upon page load so that it only gets pushed with the values we want based on the selections below

  //object for guest input
  guest = { 
      name: "",
      adults: 0,
      children: 0,
      infants: 0
      }

  // Javascript for HTML Parallax function
    $('.parallax').parallax();
    $(document).ready(function(){
      $('.carousel').carousel();
    });

  // Javascript for Scroll Funtion
  $(document).ready(function(){
    $('.scrollspy').scrollSpy();
  });

  $(document).ready(function(){
    $('.tooltipped').tooltip();
  });
     


  // Javascript for HTML Carousel function
    $('.carousel.carousel-slider').carousel({
      fullWidth: true
    });
  // Javascript for HTML Form Function
    $(document).ready(function(){
      $('select').formSelect();
      });
      $(".dropdown-trigger").dropdown();


//#endregion

//#region Weather API Config 

//weather api URL
var weather = "https://api.apixu.com/v1/current.json?key=cf2b992aa9b84d70b67132615183103&q=Orlando,FL"

//AJAX call
$.ajax({
  async: false, // Should prevent error in console
  url: weather,
  method: "GET"
}).then(function(response) {
    console.log(response);
    //storing weather data
    var tempC = response.current.temp_c;
    var tempF = response.current.temp_f;
    var condition = response.current.condition.text;
    var conditionImage = response.current.condition.icon;
    //Creating tags for the elements
    var displayF = $("<p class = 'weather'>").html("Temp (in Fahrenheit): " + tempF + " &#x2109;");
    var displayC = $("<p class = 'weather'>").html("Temp (in Celsius): " + tempC + "&#x2103;");
    var displayCondition = $("<p class = 'weather'>").text("Condition is " + condition);
    var displayIcon = $("<img>").attr("src", "http:" + conditionImage);
    //Putting it in the weather div
    $("#weather").append(displayIcon); 
    $("#weather").append(displayCondition);
    $("#weather").append(displayF);
    $("#weather").append(displayC);
    
   
});
//#endregion

//#region Submit Button Functions

$("#submit").on("click", function(event) {
  event.preventDefault();
  // Send the Guest's Inputs to FireBase
  pushGuestData();
  // Determine which attractions apply to this guest
  determineRideList();
  // Show/Hide the container which holdes the results table
  $('#resultsContainer').show();
  $('#inputContainer').hide();
  // Load the table containing the custom ride list
});
//#endregion

$("#close").on("click", function(event) {
  $('#resultsContainer').toggle();
  $('#inputContainer').toggle();
})
//#region Functions for Custom Ride List

// Send Guest Data to FireBase
function pushGuestData() {
  guest.name = $("#nameInput").val().trim();
    // If-Else statements to accomodate if the user doesn't make a selection (nulls)
    if (($("#adultsInput").val() == null) || ($("#adultsInput").val() == 0)) { guest.adults = "0"} 
    else guest.adults =  $("#adultsInput").val().trim();
    if (($("#childrenInput").val() == null) || ($("#childrenInput").val() == 0)) { guest.children = "0"} 
    else guest.children =  $("#childrenInput").val().trim();
    if (($("#infantsInput").val() == null) || ($("#infantsInput").val() == 0)) { guest.infants = "0"} 
    else guest.infants =  $("#infantsInput").val().trim();
  // Console log the input values as the Guest Object
  console.log(guest)
  // Push the "guest" object to firebase so that we collect the guest's info
  guestsRef.push({guest: guest})
  }

// Determine which ride list to present to the guest, based on the user inputs 
function determineRideList() {
    rideList = []
    if (guest.children > 0 && guest.infants > 0 ) { //If both children and infants present
      bothRef.on("child_added", function(snap){
        rideList.push(snap.val())
        console.log(snap.val().attractionName)
        loadResultsTable();
      });
      console.log("Adults and Kids and Babies")
    } 
    else if (guest.children == 0 && guest.infants > 0) { //If only infants present (adults assumed)
      babiesRef.on("child_added", function(snap){
        rideList.push(snap.val())
        console.log(snap.val().attractionName)
        loadResultsTable();
      });
      console.log("Adults and Babies only")
    }
    else if (guest.children > 0 && guest.infants == 0 ) { //If only infants present (adults assumed)
      kidsRef.on("child_added", function(snap){
        rideList.push(snap.val())
        console.log(snap.val().attractionName)
        loadResultsTable();
      });
      console.log("Adults and Kids only")
    }
    else { 
      adultsRef.on("child_added", function(snap){ // If only adults present
        rideList.push(snap.val())
        console.log(snap.val().attractionName)
        loadResultsTable();
      });
      console.log("Adults only")
    }
  }

function loadResultsTable() {
  console.log("Load Results Function")
    // Empty any results that would have previously existed in the table
    $("#results-table > tbody").empty(); 
    // for loop to generate the table of results based on values in the database object
    for (var i = 0; i < rideList.length; i++) {
    $("#results-table > tbody").append(
      "<tr><td>" + (parseInt([i]) + 1 ) +             // table column 1 = "customized Rank"
      "</td><td>" + rideList[i].attractionName +      // table column 2 = "Attraction Name"
      "</td><td>" + rideList[i].heightRequirement +   // table column 3 = "Height Requirement"
      "</td><td>" + rideList[i].description +           // table column 4 = "Description" (wikipedia)
      "</td><td> <iframe width='560' height='315' src='" + rideList[i].rideVideo +           // table column 5 = "Ride Vide" (YouTube)
      "' frameborder='0' allow='autoplay; encrypted-media' allowfullscreen></iframe></td></tr>");
    }
  }

//#endregion

}); //End Tag for All Javascript