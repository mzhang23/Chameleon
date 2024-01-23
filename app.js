// Import the functions you need from the SDKs you need
import { showConfirmation } from './confirmationModule.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-analytics.js";
import { getFirestore, collection, getDocs, getDoc, addDoc, doc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";
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
var curRoomID = "";

const loginDiv = document.getElementsByClassName("login_wrapper").item(0);

const titleDiv = document.getElementsByClassName("title_name_input_wrapper").item(0);
const hostJoinRulesDiv = document.getElementsByClassName("host_join_rules_wrapper").item(0);
const joinGameCodeDiv = document.getElementsByClassName("join_game_code_wrapper").item(0);
const rulesDiv = document.getElementsByClassName("rules_wrapper").item(0);

const gameDiv = document.getElementsByClassName("game_wrapper").item(0);
const hostStuff = document.getElementsByClassName("host_stuff_wrapper").item(0);

// set up player's id
var notUnique = true; 
while (notUnique) {
    notUnique = false;
    var newID = Math.floor(100000 + Math.random() * 900000);
    document.getElementById("player_id").textContent = newID;
    const checkDoc = await getDoc(collection(db, "curPlayers", "2SLSPq1ABtbYRX4xcQv1"));
    const checkDocData = checkDoc.data();
    for (let i = 0; i < checkDocData.allPlayerIDs.length; i++) {

    //check to see if the code is the same
        if (newID == checkDocData.allPlayerIDs[i]) {
            notUnique = true;
        }
    }
}


// Functions

// --------------- Setting up the game ---------------

async function hostGame() {

    //set up spectate button
    document.getElementById("player_spectator_switch").textContent = "Spectate";

    //set up code
    let notUnique = true;
    while (notUnique) {
        notUnique = false;
        var newCode = Math.floor(100000 + Math.random() * 900000);
        document.getElementById("code").textContent = newCode;
        const checkDocs = await getDocs(collection(db, "curRooms"));
        for (const checkDoc of checkDocs.docs) {

            //check to see if the code is the same
            if (newCode == checkDoc.data().code) {
                notUnique = true;
            }
        }
    }

    //create room 
    const createDoc = await addDoc(collection(db, "users"), {
        code: newCode,
        curHost: document.getElementById("player_id").textContent,
        curBoard: "null",
        curChameleon: "null",
        curWord: "null",
        //TODO: Add Timer pause/unpause, on/off, reset
        names: [(document.getElementById("name").textContent + " (host)")],
        roles: ["player"],
        ids: [document.getElementById("player_id").textContent]
    });

    //add id to current players
    await updateDoc(doc(db, "curPlayers", "2SLSPq1ABtbYRX4xcQv1"), {
        allPlayerIDs: arrayUnion(document.getElementById("player_id").textContent)
    });

    //hide non-game stuff
    hostJoinRulesDiv.hidden = true;
    loginDiv.hidden = true;
    gameDiv.hidden = false;

    //temp hide status stuff so no flash
    document.getElementById("status_wrapper").hidden = true;

    //Start Game
    curRoomID = createDoc.id;
    displayGame();
}

async function joinGame(code, isSpectator) {
    const querySnapshot = await getDocs(collection(db, "curRooms"));
    for (const doc of querySnapshot.docs) {

        //check to see if the room is the same
        if (code == doc.data().code) {

            //set up spectator button
            if (isSpectator) {
                document.getElementById("player_spectator_switch").textContent = "Join Game";
            } else {
                document.getElementById("player_spectator_switch").textContent = "Spectate";
            }

            //set code
            document.getElementById("code").textContent = code;

            //update room's player list
            await updateDoc(doc, {
                names: arrayUnion(document.getElementById("name").textContent),
                ids: arrayUnion(document.getElementById("player_id").textContent)
            });

            //update room's role list
            if (isSpectator) {
                await updateDoc(doc, {
                    roles: arrayUnion("spectator")
                });
            } else {

                //if room hasn't started, join. if not, pop a notification
                if (!(doc.data().curChameleon == "null")) {
                    await updateDoc(doc, {
                        roles: arrayUnion("player")
                    })
                }
                else {
                    alert("This room is currently playing, you can only spectate.")
                }
            }

            //add id to current players
            await updateDoc(doc(db, "curPlayers", "2SLSPq1ABtbYRX4xcQv1"), {
                allPlayerIDs: arrayUnion(document.getElementById("player_id").textContent)
            });

            //hide non-game stuff
            loginDiv.hidden = true;
            gameDiv.hidden = false;
            
            //start the game
            curRoomID = doc.id;
            displayGame();
            return;
        }
    };
}

// --------------- Playing The Game ---------------

async function displayGame() {

    //get curRooms collection data
    const newDoc = doc(db, "curRooms", curRoomID)
    const newDocSnapshot = await getDoc(newDoc);
    const newDocData = newDocSnapshot.data();
    var curBoard = newDocData.curBoard;
    var curChameleon = newDocData.curChameleon;
    var curWord = newDocData.curWord;

    //get player data
    const names = newDocData.names;
    const roles = newDocData.roles;
    const ids = newDocData.ids;
    var curHost = newDocData.curHost;

    //get wordData collection data
    if (!(curBoard == "null")) {
        const newWordsSnapshot = await getDoc(doc(db, "wordData", "5IpbfTV5SxloicaGOEmr"));
        const curBoardWords = newWordsSnapshot.data()[curBoard];    
    }
    
    //show/update hostStuff based on host status
    if (document.getElementById("player_id").textContent == curHost) {
        hostStuff.hidden = false;
        
        //add all selections to board changer
        const wordsDoc = await getDoc(doc(db, "wordData", "5IpbfTV5SxloicaGOEmr"));
        const wordsDocData = wordsDoc.data();
        for (const category in wordsDocData) {
            const optionElement = document.createElement("option");
            optionElement.value = category;
            optionElement.text = category; 
            document.getElementById("theme_select").add(optionElement);
        }
        //update board changer to curBoard
        document.getElementById("theme_select").text = curBoard;
        document.getElementById("theme_select").value = curBoard;
    }
    else {
        hostStuff.hidden = true;
    }

    //update status
    if (roles[ids.indexOf(document.getElementById("player_id").textContent)] == "spectator")
    {
        document.getElementById("status_wrapper").hidden = true;
    }
    else if (roles[ids.indexOf(document.getElementById("player_id").textContent)] == "player") {
        document.getElementById("status_wrapper").hidden = false;
        if (curChameleon == "null") {
            //TODO: Add in ... animation
            document.getElementById("status").textContent = "Waiting for Host to Start";
        }
        else if (curChameleon == document.getElementById("player_id").textContent) {
            document.getElementById("status").textContent = "You are the Chameleon!";
        }
        else {
            document.getElementById("status").textContent = "The secret word is " + curWord + ". Unmask the Chameleon!";
        }
    }

    //update user's player list
    for (let i = 0; i < names.length; i++) {
        const curName = document.createElement('li');
        curName.textContent = names[i];
        document.getElementById("player_list").appendChild(curName);
    }

    //update user's game board table
    if (curBoard != "null") {
        document.getElementById("r1c1").textContent = curBoardWords[0];
        document.getElementById("r1c2").textContent = curBoardWords[1];
        document.getElementById("r1c3").textContent = curBoardWords[2];
        document.getElementById("r1c4").textContent = curBoardWords[3];

        document.getElementById("r2c1").textContent = curBoardWords[4];
        document.getElementById("r2c2").textContent = curBoardWords[5];
        document.getElementById("r2c3").textContent = curBoardWords[6];
        document.getElementById("r2c4").textContent = curBoardWords[7];

        document.getElementById("r3c1").textContent = curBoardWords[8];
        document.getElementById("r3c2").textContent = curBoardWords[9];
        document.getElementById("r3c3").textContent = curBoardWords[10];
        document.getElementById("r3c4").textContent = curBoardWords[11];

        document.getElementById("r4c1").textContent = curBoardWords[12];
        document.getElementById("r4c2").textContent = curBoardWords[13];
        document.getElementById("r4c3").textContent = curBoardWords[14];
        document.getElementById("r4c4").textContent = curBoardWords[15];
    }

    //TODO: update timer

    //tab close end condition
    window.addEventListener('beforeunload', async function (event) {
        const confirmationMessage = 'Are you sure you want to leave?';

        // Display a confirmation dialog
        if (window.confirm(confirmationMessage)) {

            //Remove id from current players
            await updateDoc(doc(db, "curPlayers", "2SLSPq1ABtbYRX4xcQv1"), {
                allPlayerIDs: arrayRemove(document.getElementById("player_id").textContent)
            });

            // If last in room, delete curRoom doc
            if (ids.length == 1) {
                await deleteDoc(newDoc);
            }
            else {

                // delete personal data from ids, names, roles
                await updateDoc(newDoc, {
                    ids: arrayRemove(document.getElementById("player_id").textContent),
                    names: arrayRemove(names[ids.indexOf(document.getElementById("player_id")).textContent]),
                    roles: arrayRemove(roles[ids.indexOf(document.getElementById("player_id")).textContent])
                });

                // if user was host, promote some other player
                while (true) {
                    const randomPlayer = Math.floor(Math.random() * ids.length);
                    if (roles[randomPlayer] == "player") {
                        await updateDoc(newDoc, {
                            curHost: ids[randomPlayer]
                        });
                        break;
                    }
                }

                //stop running the game
                clearInterval(intervalGame);
            }
        } else {
            // User clicked "Cancel" (wants to stay)
            // Prevent the page from unloading
            event.preventDefault();
        }
    });
}

// --------------- Helper Functions --------------- 

function storeName() {
    document.getElementById("name").textContent = document.getElementById('name_input').value;
    titleDiv.hidden = true;
    hostJoinRulesDiv.hidden = false;
}

function enterJoinCode() {
    hostJoinRulesDiv.hidden = true;
    joinGameCodeDiv.hidden = false;
}

function backJoinCode() {
    joinGameCodeDiv.hidden = true;
    hostJoinRulesDiv.hidden = false;
}

function showRules() {
    hostJoinRulesDiv.hidden = true;
    rulesDiv.hidden = false;
}

function backRules() {
    rulesDiv.hidden = true;
    hostJoinRulesDiv.hidden = false;
}

async function updateTotalPlayers() {
    const playerList = await getDoc(doc(db, "curPlayers", "2SLSPq1ABtbYRX4xcQv1"))
    const playerListData = playerList.data();
    document.getElementById("total_players").textContent = "Online: " + playerListData.length
    if (!(curRoomID == "")) {
        //stop updating total players
        clearInterval(intervalTotalPlayers);
    }
}

//TODO: add timer controls

async function startStopGame() {

    const curDoc = await getDoc(doc(db, curRooms, curRoomID));
    const curDocData = curDoc.data();
    if (curDocData.curHost == document.getElementById("player_id").textContent) {
        const newWordsDoc = await getDoc(doc(db, "wordData", "5IpbfTV5SxloicaGOEmr"));
        const newBoardWords = newWordsDoc.data()[curDocData.curBoard];
        //if game hasn't started, assign chameleon(ID) and word and start game button
        if (curWord == "null") {
            await updateDoc(curDoc, {
                curChameleon: curDocData.ids[Math.floor(Math.random()*curDocData.ids.length)],
                curWord: newBoardWords[Math.floor(Math.random()*newBoardWords.length)]
            });
            document.getElementById("start_stop_game_button").textContent = "End Game";
        }
        
        //if game has already started, de-assign chameleon and word and stop game button
        else {
            await updateDoc(curDoc, {
                curChameleon: "null",
                curWord: "null"
            });
            document.getElementById("start_stop_game_button").textContent = "Start Game";
        }
    }
}

async function changeBoard(boardName) {
    await updateDoc(doc(db, curRooms, curRoomID), {
        curBoard: boardName
    });
}

async function switchSpectate(gamemode) {

    const gameDoc = getDoc(doc(db, "curRooms", curRoomID));

    //if wanna leave
    if (gamemode == "Spectate") {
        showConfirmation("Leave game and spectate?", async function(isConfirmed) {
            if (isConfirmed) {
                const newRoles = gameDoc.data().roles;
                newRoles[gameDoc.data().ids.indexOf(document.getElementById("player_id").textContent)] = "spectator";
                await updateDoc(gameDoc, {
                    roles: newRoles
                });
                document.getElementById("player_spectator_switch").textContent = "Join Game";
            }
        });
    }
    //if wanna join
    else if (gamemode == "Join Game") {
        //TODO: Check if game has already startedm also fix leaving and joining
        if (!(gameDoc.data().curChameleon == "null")) {
            const changeRoles = gameDoc.data().roles;
            changeRoles[gameDoc.data().ids.indexOf(document.getElementById("player_id").textContent)] = "player";
            await updateDoc(gameDoc, {
                roles: changeRoles
            });
            document.getElementById("player_spectator_switch").textContent = "Spectate";
        }
        else {
            alert("This room is currently playing, you can only spectate.")
        }
    }
}


// --------------- Initial Setup --------------- //

loginDiv.hidden = false;
titleDiv.hidden = false;

hostJoinRulesDiv.hidden = true;
joinGameCodeDiv.hidden = true;
rulesDiv.hidden = true;

gameDiv.hidden = true;

hostStuff.hidden = true;

//start updating total players
const intervalTotalPlayers = setInterval(updateTotalPlayers, 1000);
const intervalGame = setInterval(displayGame, 500);
updateTotalPlayers();

//Enter Name
document.getElementById("name_enter").onclick = () => storeName();

//choose option
document.getElementById("host_game_button").onclick = () => hostGame();
document.getElementById("join_game_button").onclick = () => enterJoinCode();
document.getElementById("how_to_play_button").onclick = () => showRules();

//you can go back
document.getElementById("back_from_join").onclick = () => backJoinCode();
document.getElementById("back_from_rules").onclick = () => backRules();

//try to join room
document.getElementById("game_pin_enter").onclick = () => joinGame(document.getElementById("game_pin_input").value, false);
document.getElementById("game_pin_enter_spectator").onclick = () => joinGame(document.getElementById("game_pin_input").value, true);

//switch to/from spectatorship
document.getElementById("player_spectator_switch").onclick = () => switchSpectate(document.getElementById("player_spectator_switch").textContent);

//host stuff
document.getElementById("start_stop_game_button").onclick = () => startStopGame();
document.getElementById("theme_enter").onclick = () => changeBoard(document.getElementById("theme_select".value));

//makes sure no raw html leaks through
document.addEventListener('DOMContentLoaded', function () {
    // Remove the class that hides the elements
    document.querySelector('.hidden_content').classList.remove('hidden_content');
});

//demo code to help me understand:
        //console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
        //doc.id + " => " + JSON.stringify(doc.data())


//make sure all game-sensitive data is stored in the database, disable console, set up security
//make data be accessed through the database, not by checking some document.getElementById("example")