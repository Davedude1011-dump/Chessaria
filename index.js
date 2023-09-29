const firebaseConfig = {
    apiKey: "AIzaSyAWrZMD6UEhxw8LZcL0s4qy9PmrUR7u2tA",
    authDomain: "chessaria-ea2ab.firebaseapp.com",
    projectId: "chessaria-ea2ab",
    storageBucket: "chessaria-ea2ab.appspot.com",
    messagingSenderId: "508510432994",
    appId: "1:508510432994:web:48f43e9ba252401b7378bb",
    measurementId: "G-K6BTEVJFZ0"
};
firebase.initializeApp(firebaseConfig);
var db = firebase.database()

db.ref("PlayerCount").get()
    .then((snapshot) => {
        var PlayerCount = snapshot.val();
        console.log(PlayerCount)
        if (PlayerCount[0] == false && PlayerCount[1] == false) { document.querySelector(".join").textContent = "Join Game (0/2)" }
        else if (PlayerCount[0] == false || PlayerCount[1] == false) { document.querySelector(".join").textContent = "Join Game (1/2)" }
        else { document.querySelector(".join").textContent = "Spectate Game (2/2)" }
})
.catch((error) => {
  console.error("Error getting PlayerCount:", error);
});