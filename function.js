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
db.ref("Turn").set("white")

var Team = ""

db.ref("PlayerCount").get()
    .then((snapshot) => {
        var PlayerCount = snapshot.val();
        if (PlayerCount[0] == false && PlayerCount[1] == false) {
            db.ref("Board").set("")
            CreateTable()
            BoardToArray()
        }
        if (PlayerCount[0] == false && PlayerCount[1] == false || PlayerCount[0] == false && PlayerCount[1] == true) { Team = "white"; PlayerCount[0] = true; FillCharacterMenu() }
        else if (PlayerCount[0] == true && PlayerCount[1] == false) { Team = "black"; PlayerCount[1] = true; FillCharacterMenu() }
        else { Team = ""; document.querySelector(".character-menu").remove(); document.querySelector(".ready-up").remove() }
        document.body.classList.add(Team)
        db.ref("PlayerCount").set(PlayerCount);
})
.catch((error) => {
  console.error("Error getting PlayerCount:", error);
});

const TableOuter = document.querySelector(".table-outer")
var TableWidth = 10
var TableHeight = 10
var isBuilding = true

var isAboutToMove = false
var ValidMoves = []
var LastClicked = ""
var LastHP = 0
var LastMaxHP = 0
var CurrentAttackDamage = 0
var ManaMax = 100
var Mana = ManaMax
var isAttacking = false

var TurnClient = "white"

var Characters = {
    "soldier": {Range: [
        [-1, -1], [0, -1], [+1, -1],
        [-1,  0],          [+1,  0],
        [-1, +1], [0, +1], [+1, +1]
    ], Attacks: [
        {Name: "Stab", Damage: 30}
    ], Level: "★", Name: "soldier", Health: 100, Cost: 10 },

    "archer": {Range: [
                  [-1, -2], [0, -2], [+1, -2],
        [-2, -1], [-1, -1], [0, -1], [+1, -1], [+2, -1],
        [-2,  0], [-1,  0],          [+1,  0], [+2,  0],
        [-2, +1], [-1, +1], [0, +1], [+1, +1], [+2, +1],
                  [-1, +2], [0, +2], [+1, +2]
    ], Attacks: [
        {Name: "Shoot", Damage: 25}
    ], Level: "★", Name: "archer", Health: 75, Cost: 15 },

    "mage": {Range: [
        [-1, -1], [0, -1], [+1, -1],
        [-1,  0],          [+1,  0],
        [-1, +1], [0, +1], [+1, +1]
    ], Attacks: [
        {Name: "Firebolt", Damage: 20},
        {Name: "Heal", Damage: -20}
    ], Level: "★", Name: "mage", Health: 75, Cost: 20 },
}
var CharacterSelected = ""
document.querySelector(".mana-text").textContent = `${Mana} / ${ManaMax}`

function CharacterRangeToBoard(CharacterRange, CellCoord) {
    var elementsWithClasses = document.querySelectorAll('.table-cell-select-main, .table-cell-select-sub');
    for (var i = 0; i < elementsWithClasses.length; i++) {
        elementsWithClasses[i].classList.remove('table-cell-select-main');
        elementsWithClasses[i].classList.remove('table-cell-select-sub');
    }

    let x = CellCoord[0];
    let y = CellCoord[1];

    //document.querySelector(`[CellCoord="${x},${y}"]`).classList.add("table-cell-select-main")

    for (let i = 0; i < CharacterRange.length; i++) {
        let CurrentMultiplier = CharacterRange[i]
        let MultiplierX = x + CurrentMultiplier[0]
        let MultiplierY = y + CurrentMultiplier[1]
        if (MultiplierX > 0 && MultiplierX <= TableWidth && MultiplierY > 0 && MultiplierY <= TableHeight) { // && document.querySelector(`[CellCoord="${MultiplierX},${MultiplierY}"]`).id.split("-")[1] != Team
            document.querySelector(`[CellCoord="${MultiplierX},${MultiplierY}"]`).classList.add("table-cell-select-sub")
            if (isBuilding == false && isBuilding == false) {
                ValidMoves.push(`${MultiplierX},${MultiplierY}`)
            }
        }
    }
}

function CreateTable() {
    document.querySelector(".table-outer").innerHTML = ""

    let Counter = 0
    for (let y = 0; y < TableHeight; y++) {
        var TableRow = document.createElement("div")
        TableRow.classList.add("table-row")

        for (let x = 0; x < TableWidth; x++) {
            Counter++

            var TableCell = document.createElement("div")
            TableCell.classList.add("table-cell")

            if (y == (TableHeight/2)-1) {
                if (Counter % 2 == 0) { TableCell.classList.add("center-top-even") }
                else { TableCell.classList.add("center-top-odd") }
            }
            else if (y == TableHeight/2) {
                if (Counter % 2 == 0) { TableCell.classList.add("center-bottom-even") }
                else { TableCell.classList.add("center-bottom-odd") }
            }
            else if (y < TableHeight/2) {
                if (Counter % 2 == 0) { TableCell.classList.add("top-even") }
                else { TableCell.classList.add("top-odd") }
            }
            else if (y > TableHeight/2) {
                if (Counter % 2 == 0) { TableCell.classList.add("bottom-even") }
                else { TableCell.classList.add("bottom-odd") }
            }

            TableCell.setAttribute("CellCoord", [x+1, y+1])
            TableCell.setAttribute("CellHP", 0)

            TableCell.onmouseover = function() {
                let StringCoord = this.getAttribute("CellCoord")
                let CellCoord = [Number(StringCoord.split(",")[0]), Number(StringCoord.split(",")[1])]

                if (isBuilding) {
                    if (CellCoord[1] >= 7 && Team == "white" || CellCoord[1] <= 4 && Team == "black") {
                        if (CharacterSelected != "" && CharacterSelected != "delete") { CharacterRangeToBoard(CharacterSelected.Range, CellCoord) }
                    }
                }
                else {
                    if (this.id != "") { this.style.cursor = "pointer" }
                    else { this.style.cursor = "auto" }
                }
            }
            TableCell.onmouseout = function() {
                if (isBuilding) {
                    var elementsWithClasses = document.querySelectorAll('.table-cell-select-main, .table-cell-select-sub');
                    for (var i = 0; i < elementsWithClasses.length; i++) {
                        elementsWithClasses[i].classList.remove('table-cell-select-main');
                        elementsWithClasses[i].classList.remove('table-cell-select-sub');
                    }
                }
            }
            TableCell.onclick = function() {
                let StringCoord = this.getAttribute("CellCoord")
                let CellCoord = [Number(StringCoord.split(",")[0]), Number(StringCoord.split(",")[1])]
                if (isBuilding) {
                    if (CharacterSelected != "") {
                        if (CellCoord[1] >= 7 && Team == "white" || CellCoord[1] <= 4 && Team == "black") {
                            if (CharacterSelected == "delete") {
                                console.log(`${this.id.split("-")[0]}`)
                                Mana += Characters[`${this.id.split("-")[0]}`].Cost
                                document.querySelector(".mana-text").textContent = `${Mana} / ${ManaMax}`
                                
                                this.id = ""
                                this.setAttribute("CellHP", 0)
                                this.setAttribute("MaxCellHP", 0)

                                BoardToArray()
                            }
                            else if (this.id != "" && (Mana + Characters[`${this.id.split("-")[0]}`].Cost) >= 0) {
                                Mana += Characters[`${this.id.split("-")[0]}`].Cost
                                document.querySelector(".mana-text").textContent = `${Mana} / ${ManaMax}`

                                this.id = CharacterSelected.Name +  "-" + Team
                                this.setAttribute("CellHP", CharacterSelected.Health)
                                this.setAttribute("MaxCellHP", CharacterSelected.Health)

                                Mana -= CharacterSelected.Cost
                                document.querySelector(".mana-text").textContent = `${Mana} / ${ManaMax}`
                            }
                            else if (Mana >= 0) {
                                this.id = CharacterSelected.Name +  "-" + Team
                                this.setAttribute("CellHP", CharacterSelected.Health)
                                this.setAttribute("MaxCellHP", CharacterSelected.Health)

                                Mana -= CharacterSelected.Cost
                                document.querySelector(".mana-text").textContent = `${Mana} / ${ManaMax}`

                                BoardToArray()
                            }
                        }
                    }
                }
                else {
                    if (TurnClient == Team) {
                        let CharacterNameSplit = this.id.split("-")[0]
                        CharacterSelected = Characters[CharacterNameSplit]
    
                        if (isAboutToMove == false && this.id.split("-")[1] == Team) {
                            CharacterRangeToBoard(CharacterSelected.Range, CellCoord)
                            LastClicked = StringCoord
                            isAboutToMove = true
                        }
                        else {
    
                            if (ValidMoves.includes(StringCoord) && StringCoord != LastClicked) {
                                this.id = document.querySelector(`[CellCoord="${LastClicked}"]`).id
                                document.querySelector(`[CellCoord="${LastClicked}"]`).id = ""
                                BoardToArray()
                            }
                            isAboutToMove = false
    
                            var elementsWithClasses = document.querySelectorAll('.table-cell-select-main, .table-cell-select-sub');
                            for (var i = 0; i < elementsWithClasses.length; i++) {
                                elementsWithClasses[i].classList.remove('table-cell-select-main');
                                elementsWithClasses[i].classList.remove('table-cell-select-sub');
                            }
                            ValidMoves = []
                        }
                    }
                }
            }

            TableRow.appendChild(TableCell)
        }
        Counter++

        TableOuter.appendChild(TableRow)
    }
}



function FillCharacterMenu() {
    let CharacterMenu = document.querySelector(".character-menu")
    for (let Character in Characters) {
        let CharacterName = Character

        let NewButton = document.createElement("button")
        NewButton.classList.add("character")
        NewButton.textContent = `(${Characters[CharacterName].Cost}) ${CharacterName} ${Characters[CharacterName].Level}`

        NewButton.onclick = function() {
            if (this.textContent.split(" ")[0] == "Delete") {
                CharacterSelected = "delete"
            }
            else {
                if (Characters[CharacterName] == CharacterSelected) {
                    CharacterSelected = "";
                    let SelectedCharacters = document.querySelectorAll(".character-selected");
                    SelectedCharacters.forEach((element) => { element.classList.remove("character-selected") });
                }
                else {
                    let SelectedCharacters = document.querySelectorAll(".character-selected");
                    SelectedCharacters.forEach((element) => { element.classList.remove("character-selected") });
                    CharacterSelected = Characters[CharacterName]
                    this.classList.add("character-selected")
                }
            }
            console.log(CharacterSelected)
        }
        
        CharacterMenu.appendChild(NewButton)
    }
    document.querySelector(".delete").onclick = function() {
        if (this.classList.contains("character-selected")) {
            CharacterSelected = "";
            let SelectedCharacters = document.querySelectorAll(".character-selected");
            SelectedCharacters.forEach((element) => { element.classList.remove("character-selected") });
        }
        else {
            let SelectedCharacters = document.querySelectorAll(".character-selected");
            SelectedCharacters.forEach((element) => { element.classList.remove("character-selected") });
            CharacterSelected = "delete"
            this.classList.add("character-selected")
        }
        console.log(CharacterSelected)
    }
}

function TeamSwap() {
    if (Team == "white") {
        Team = "black"
    }
    else {
        Team = "white"
    }
}
function FinishBuilding() {
    db.ref("ReadyUp").get()
        .then((snapshot) => {
            var ReadyCount = snapshot.val();
            if (document.querySelector(".ready-up").id == "false") {
                if (ReadyCount == 0) { ReadyCount++; document.querySelector(".ready-up").textContent = "Ready (1/2)" }
                else if (ReadyCount == 1) { ReadyCount++; document.querySelector(".ready-up").textContent = "Ready (2/2)" }
                else { ReadyCount = 0 }
                document.querySelector(".ready-up").id = "true"
            }
            else {
                ReadyCount--
                document.querySelector(".ready-up").id = "false"
            }
            db.ref("ReadyUp").set(ReadyCount);
    })
    .catch((error) => {
        console.error("Error getting PlayerCount:", error);
    });
}
db.ref("ReadyUp").on("value", (snapshot) => {
    let ReadyCount = snapshot.val()

    try {
        if (ReadyCount == 0) { ReadyCount++; document.querySelector(".ready-up").textContent = "Ready (0/2)" }
        else if (ReadyCount == 1) { ReadyCount++; document.querySelector(".ready-up").textContent = "Ready (1/2)" }
        else if (ReadyCount == 2) {
            isBuilding = false
            document.querySelector(".attack-menu").style.display = "flex"
            document.querySelector(".character-menu").remove()
            CharacterSelected = ""
            document.querySelector(".ready-up").remove()
            db.ref("ReadyUp").set(0)
        }
    }
    catch{}
})


function BoardToArray() {
    let AllCells = document.querySelectorAll(".table-cell")
    let NewArray = []

    for (let i = 0; i < AllCells.length; i++) {
        NewArray.push([[AllCells[i].classList[0], AllCells[i].classList[1]], AllCells[i].id, AllCells[i].getAttribute("CellHP"), AllCells[i].getAttribute("MaxCellHP")])
    }

    if (!isBuilding) {
        if (TurnClient == "white") {
            db.ref("Turn").set("black")
            TurnClient = "black"
        }
        else {
            db.ref("Turn").set("white")
            TurnClient = "white"
        }
    }
    db.ref("Board").set(JSON.stringify(NewArray));
}



db.ref("Board").on("value", (snapshot) => {
    console.log(JSON.parse(snapshot.val()))
    let BoardArray = JSON.parse(snapshot.val())

    document.querySelector(".table-outer").innerHTML = ""
    
    let Counter = 0
    let CellCounter = -1
    for (let y = 0; y < TableHeight; y++) {
        var TableRow = document.createElement("div")
        TableRow.classList.add("table-row")

        for (let x = 0; x < TableWidth; x++) {
            Counter++
            CellCounter++

            var TableCell = document.createElement("div")
            TableCell.classList.add("table-cell")

            if (y == (TableHeight/2)-1) {
                if (Counter % 2 == 0) { TableCell.classList.add("center-top-even") }
                else { TableCell.classList.add("center-top-odd") }
            }
            else if (y == TableHeight/2) {
                if (Counter % 2 == 0) { TableCell.classList.add("center-bottom-even") }
                else { TableCell.classList.add("center-bottom-odd") }
            }
            else if (y < TableHeight/2) {
                if (Counter % 2 == 0) { TableCell.classList.add("top-even") }
                else { TableCell.classList.add("top-odd") }
            }
            else if (y > TableHeight/2) {
                if (Counter % 2 == 0) { TableCell.classList.add("bottom-even") }
                else { TableCell.classList.add("bottom-odd") }
            }

            TableCell.setAttribute("CellCoord", [x+1, y+1])
            try {
                TableCell.id = BoardArray[CellCounter][1]
                TableCell.setAttribute("CellHP", BoardArray[CellCounter][2])
                TableCell.setAttribute("MaxCellHP", BoardArray[CellCounter][3])
            }
            catch {

            }

            TableCell.onmouseover = function() {
                let StringCoord = this.getAttribute("CellCoord")
                let CellCoord = [Number(StringCoord.split(",")[0]), Number(StringCoord.split(",")[1])]

                if (isBuilding) {
                    if (CellCoord[1] >= 7 && Team == "white" || CellCoord[1] <= 4 && Team == "black") {
                        if (CharacterSelected != "" && CharacterSelected != "delete") { CharacterRangeToBoard(CharacterSelected.Range, CellCoord) }
                    }
                }
                else {
                    if (this.id != "") { this.style.cursor = "pointer" }
                    else { this.style.cursor = "auto" }
                }
            }
            TableCell.onmouseout = function() {
                if (isBuilding) {
                    var elementsWithClasses = document.querySelectorAll('.table-cell-select-main, .table-cell-select-sub');
                    for (var i = 0; i < elementsWithClasses.length; i++) {
                        elementsWithClasses[i].classList.remove('table-cell-select-main');
                        elementsWithClasses[i].classList.remove('table-cell-select-sub');
                    }
                }
            }
            TableCell.onclick = function() {
                let StringCoord = this.getAttribute("CellCoord")
                let CellCoord = [Number(StringCoord.split(",")[0]), Number(StringCoord.split(",")[1])]
                if (isBuilding) {
                    if (CharacterSelected != "") {
                        if (CellCoord[1] >= 7 && Team == "white" || CellCoord[1] <= 4 && Team == "black") {
                            if (CharacterSelected == "delete") {
                                console.log(`${this.id.split("-")[0]}`)
                                Mana += Characters[`${this.id.split("-")[0]}`].Cost
                                document.querySelector(".mana-text").textContent = `${Mana} / ${ManaMax}`
                                
                                this.id = ""
                                this.setAttribute("CellHP", 0)
                                this.setAttribute("MaxCellHP", 0)

                                BoardToArray()
                            }
                            else if (this.id != "" && (Mana + Characters[`${this.id.split("-")[0]}`].Cost) >= CharacterSelected.Cost) {
                                Mana += Characters[`${this.id.split("-")[0]}`].Cost
                                document.querySelector(".mana-text").textContent = `${Mana} / ${ManaMax}`

                                this.id = CharacterSelected.Name +  "-" + Team
                                this.setAttribute("CellHP", CharacterSelected.Health)
                                this.setAttribute("MaxCellHP", CharacterSelected.Health)

                                Mana -= CharacterSelected.Cost
                                document.querySelector(".mana-text").textContent = `${Mana} / ${ManaMax}`
                            }
                            else if (Mana >= CharacterSelected.Cost) {
                                this.id = CharacterSelected.Name +  "-" + Team
                                this.setAttribute("CellHP", CharacterSelected.Health)
                                this.setAttribute("MaxCellHP", CharacterSelected.Health)

                                Mana -= CharacterSelected.Cost
                                document.querySelector(".mana-text").textContent = `${Mana} / ${ManaMax}`

                                BoardToArray()
                            }
                        }
                    }
                }
                else {
                    if (TurnClient == Team) {
                        let CharacterNameSplit = this.id.split("-")[0]
                        CharacterSelected = Characters[CharacterNameSplit]
    
                        if (isAboutToMove == false && this.id.split("-")[1] == Team) {
                            CharacterRangeToBoard(CharacterSelected.Range, CellCoord)
                            LastClicked = StringCoord
                            LastHP = this.getAttribute("CellHP")
                            LastMaxHP = this.getAttribute("MaxCellHP")
                            isAboutToMove = true

                            // Setting up the attack menu
                            let CharacterAttacks = CharacterSelected.Attacks
                            let AttackMenu = document.querySelector(".attack-menu")
                            AttackMenu.innerHTML = ""
                            for (i = 0; i < CharacterAttacks.length; i++) {
                                let AttackName = CharacterAttacks[i].Name
                                let AttackDamage = CharacterAttacks[i].Damage
                        
                                let NewButton = document.createElement("button")
                                NewButton.classList.add("attack")
                                if (AttackDamage >= 0) { NewButton.textContent = `${AttackName} (${AttackDamage})` }
                                else { NewButton.textContent = `${AttackName} (+${Math.abs(AttackDamage)})` }
                                NewButton.id = AttackDamage
                        
                                NewButton.onclick = function() {
                                    if (this.classList.contains("attack-selected")) {
                                        this.classList.remove("attack-selected")
                                        CurrentAttackDamage = 0
                                        isAttacking = false
                                    }
                                    else {
                                        this.classList.add("attack-selected")
                                        CurrentAttackDamage = this.id
                                        isAttacking = true
                                    }
                                }
                                
                                AttackMenu.appendChild(NewButton)
                            }
                        }
                        else {
    
                            if (ValidMoves.includes(StringCoord) && StringCoord != LastClicked) {
                                if (this.id != "" && isAttacking == true) {
                                    if (this.getAttribute("CellHP") - CurrentAttackDamage > this.getAttribute("MaxCellHP")) {
                                        toastr.error("This character is already at max health!")
                                    }
                                    else {
                                        this.setAttribute("CellHP", this.getAttribute("CellHP") - CurrentAttackDamage)
                                        if (this.getAttribute("CellHP") <= 0) {
                                            this.setAttribute("CellHP", 0)
                                            this.id = ""
                                        }
                                        document.querySelector(".attack-menu").innerHTML = ""
                                        BoardToArray()
                                    }
                                }
                                else if (this.id == "") {
                                    CurrentAttackDamage = 0
                                    document.querySelector(".attack-menu").innerHTML = ""
                                    this.id = document.querySelector(`[CellCoord="${LastClicked}"]`).id
                                    this.setAttribute("CellHP", LastHP)
                                    this.setAttribute("MaxCellHP", LastMaxHP)
                                    document.querySelector(`[CellCoord="${LastClicked}"]`).id = ""
                                    document.querySelector(`[CellCoord="${LastClicked}"]`).setAttribute("CellHP", 0)
                                    document.querySelector(`[CellCoord="${LastClicked}"]`).setAttribute("MaxCellHP", 0)
                                    BoardToArray()
                                }
                                else {
                                    toastr.error("Please select an attack first!")
                                }
                            }
                            isAboutToMove = false
    
                            var elementsWithClasses = document.querySelectorAll('.table-cell-select-main, .table-cell-select-sub');
                            for (var i = 0; i < elementsWithClasses.length; i++) {
                                elementsWithClasses[i].classList.remove('table-cell-select-main');
                                elementsWithClasses[i].classList.remove('table-cell-select-sub');
                            }
                            ValidMoves = []
                        }
                    }
                }
            }

            TableRow.appendChild(TableCell)
        }
        Counter++

        TableOuter.appendChild(TableRow)
    }
    AddHealthBars()
})

db.ref("Turn").on("value", (snapshot) => {
    document.querySelector(".turn-text").textContent = snapshot.val()
    TurnClient = snapshot.val()
})


CreateTable()

function AddHealthBars() {
    let AllSquares = document.querySelectorAll(".table-cell")
    for (let i = 0; i < AllSquares.length; i++) {
        let Square = AllSquares[i]
        if (Square.id != "") {
            let NewHealthBar = document.createElement("div")
            NewHealthBar.textContent = `${Square.getAttribute("CellHP")} / ${Square.getAttribute("MaxCellHP")}`
            NewHealthBar.classList.add("health-bar")
            Square.appendChild(NewHealthBar)
            console.log(Square.getAttribute("CellHP"))
        }
    }
}



//
window.addEventListener("beforeunload", function(event) {
    db.ref("PlayerCount").get()
        .then((snapshot) => {
            var PlayerCount = snapshot.val();
            if (Team == "white") { PlayerCount[0] = false }
            if (Team == "black") { PlayerCount[1] = false }
            db.ref("PlayerCount").set(PlayerCount);
    })
    .catch((error) => {
      console.error("Error getting PlayerCount:", error);
    });
    event.returnValue = null; //"Any text"; //true; //false;
    //return null; //"Any text"; //true; //false;
  });