// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-analytics.js";
import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCZEE9u4drq9JC1cvSEGUg2N6hXP3yQTJM",
  authDomain: "chameleon-2bb16.firebaseapp.com",
  projectId: "chameleon-2bb16",
  storageBucket: "chameleon-2bb16.appspot.com",
  messagingSenderId: "315703375342",
  appId: "1:315703375342:web:26eba2ecb431b490d04aff",
  measurementId: "G-2PD3TW6DJ9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Set up consts
const loginDiv = document.getElementsByClassName("login_wrapper").item(0);

const titleDiv = document.getElementsByClassName("title_name_input_wrapper").item(0);
const hostJoinRulesDiv = document.getElementsByClassName("host_join_rules_wrapper").item(0);
const joinGameCodeDiv = document.getElementsByClassName("join_game_code_wrapper").item(0);
const rulesDiv = document.getElementsByClassName("rules_wrapper").item(0);

const gameDiv = document.getElementsByClassName("game_wrapper").item(0);

const hostStuff = document.getElementsByClassName("host_stuff").item(0);
const nonHostStuff = document.getElementsByClassName("non_host_stuff").item(0);

// Consts I don't use?

//const nameDiv = document.getElementsByClassName("name_wrapper").item(0);
//const codeDiv = document.getElementsByClassName("code_wrapper").item(0);
//const wordTable = document.getElementsByClassName("word_table").item(0);
//const playerList = document.getElementsByClassName("player_list").item(0);

// Set up Functions

function storeName() {
    document.getElementById("name").textContent = document.getElementById('name_input').value;
    titleDiv.hidden = true;
    hostJoinRulesDiv.hidden = false;
}

function hostGame() {
    hostJoinRulesDiv.hidden = true;
    loginDiv.hidden = true;
    gameDiv.hidden = false;
    hostStuff.hidden = false;
    //set up code for new row in data matrix
    const newCode = Math.floor(100000 + Math.random() * 900000);
    document.getElementById("code").textContent = "Code: " + newCode;
    //while (tabnotClosed) {}
}

function enterJoinCode() {
    hostJoinRulesDiv.hidden = true;
    joinGameCodeDiv.hidden = false;
}

function backJoinCode() {
    joinGameCodeDiv.hidden = true;
    hostJoinRulesDiv.hidden = false;
}

async function joinGame(code) {
    const querySnapshot = await getDocs(collection(db, "curRooms"));
    querySnapshot.docs.forEach((doc) => {
        console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
    });
    //Some if else statement referring to database to check for room
    //else
    if (false) {
        hostJoinRulesDiv.hidden = true;
        loginDiv.hidden = true;
        gameDiv.hidden = false;
        hostStuff.hidden = false;
    }
    //while (tabNotClosed)
}

function showRules() {
    hostJoinRulesDiv.hidden = true;
    rulesDiv.hidden = false;
}

function backRules() {
    rulesDiv.hidden = true;
    hostJoinRulesDiv.hidden = false;
}

// Initial Screen
loginDiv.hidden = false;
titleDiv.hidden = false;

hostJoinRulesDiv.hidden = true;
joinGameCodeDiv.hidden = true;
rulesDiv.hidden = true;

gameDiv.hidden = true;

hostStuff.hidden = true;
nonHostStuff.hidden = true;

//Enter Name
document.getElementById("name_enter").onclick = storeName;

//choose option
document.getElementById("host_game_button").onclick = hostGame;
document.getElementById("join_game_button").onclick = enterJoinCode;
document.getElementById("how_to_play_button").onclick = showRules;

//you can go back
document.getElementById("back_from_join").onclick = backJoinCode;
document.getElementById("back_from_rules").onclick = backRules;

//try to join room
document.getElementById("game_pin_enter").onclick = () => joinGame(document.getElementById("game_pin_input").value);

//makes sure no raw html leaks through
document.addEventListener('DOMContentLoaded', function () {
    // Remove the class that hides the elements
    document.querySelector('.hidden_content').classList.remove('hidden_content');
});

//each room contains: code(name of room), list of players, board, who is chameleon(null if not started)