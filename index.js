const num_rows = 8;
const num_columns = 10;
const num_mines = 10;
const gameboard = document.getElementById("gameboard");
let time_range;
let elapsed_time = 0;

let board = [];
let remainingFlags = 10; // Start with 10 flags 
let firstClick = true;

//Function to only generate the board at the start of the game
function startboard() {
    document.getElementById("NumFlags").textContent = remainingFlags;
    for (let i = 0; i < num_rows; i++) {
        board[i] = [];
        for (let j = 0; j < num_columns; j++) {
            board[i][j] = {
                ismine: false,
                revealed: false,
                flagged: false, // Added flagged property
                count: 0,
            };
        }
    }
}


//This is to place the mines in the board
function placeMines(firstRow, firstColumn) {
    let mines_placement = 0;
    while (mines_placement < num_mines) {
        const row = Math.floor(Math.random() * num_rows);
        const column = Math.floor(Math.random() * num_columns);
        if (
            !board[row][column].ismine &&
            Math.abs(row - firstRow) > 1 &&
            Math.abs(column - firstColumn) > 1
        ) {
            board[row][column].ismine = true;
            mines_placement++;
        }
    }

    // Calculate mine count
    for (let i = 0; i < num_rows; i++) {
        for (let j = 0; j < num_columns; j++) {
            if (!board[i][j].ismine) {
                let count = 0;
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        const ni = i + dx;
                        const nj = j + dy;
                        if (
                            ni >= 0 &&
                            ni < num_rows &&
                            nj >= 0 &&
                            nj < num_columns &&
                            board[ni][nj].ismine
                        ) {
                            count++;
                        }
                    }
                }
                board[i][j].count = count;
            }
        }
    }
}


//Start the timer when the first click is false
function start_timer(){
    time_range = 0;
    elapsed_time = 0;
    time_range = setInterval(function(){
        elapsed_time++;
        document.getElementById("timer").textContent = elapsed_time;
    },1000)
}

//Stop the timer after we finish (lose or win the game)
function stop_timer(){
    clearInterval(time_range);
}

//Regenerating the board and elements after we click play again when we lose or win
function restartGame() {
    firstClick = false;
    elapsed_time = 0;
    document.getElementById("Winning_Screen").style.display = "none";
    document.getElementById("gameboard").classList.remove("disabled");
    document.getElementById("Losing_Screen").style.display = "none";
    document.getElementById("gameboard").classList.remove("disabled");
    firstClick = true;
    startboard();
    remainingFlags = 10;
    UpdateFlagCounter();
    board_generation();
    elapsed_time = 0;
    document.getElementById("timer").textContent = elapsed_time;
  }

  //Winning Screen
function winScreen(){
    stop_timer();
    document.getElementById("Winning_Screen").style.display = "block";
    document.getElementById("gameboard").classList.add("disabled");
}

//Losing screen
function lossScreen() {
    stop_timer();
    document.getElementById("Losing_Screen").style.display = "block";
    document.getElementById("gameboard").classList.add("disabled");
}


//Main function to reveal cells after being clicked
//Theory: and -> && or -> ||
function revealedcell(row, column) {
    if (
        row < 0 ||
        row >= num_rows ||
        column < 0 ||
        column >= num_columns ||
        board[row][column].revealed
    ) {
        return;
    }
    if(firstClick){
        placeMines(row, column);
        firstClick = false;
        start_timer();
    }

    if (board[row][column].flagged) {
        return; // Ignore revealed cells that are flagged
    }

    board[row][column].revealed = true;

    if (board[row][column].ismine) {
        lossScreen();
        return;
    } else if (board[row][column].count === 0) {
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                revealedcell(row + dx, column + dy);
            }
        }
    }
    board_generation();
    let all_cells_revealed = true;
    for (let i = 0; i < num_rows; i++){
        for (let j = 0; j < num_columns; j++){
            if(!board[i][j].ismine && !board[i][j].revealed){
                all_cells_revealed = false;
                break;
            }
        }
        if(!all_cells_revealed){
            break;
        }
    }
    if(all_cells_revealed){
        setTimeout(function(){
            winScreen();}, 100
        );
    }
}

//Updating in real time the flag counter
function UpdateFlagCounter(){
    document.getElementById("NumFlags").textContent = remainingFlags;

}

//Function to use right click to toggle the cells with flags
function toggleFlag(row, column) {
    if (
        row < 0 ||
        row >= num_rows ||
        column < 0 ||
        column >= num_columns ||
        board[row][column].revealed
    ) {
        return;
    }

    if (board[row][column].flagged) {
        board[row][column].flagged = false;
        remainingFlags++;
        UpdateFlagCounter();
    } else {
        if (remainingFlags > 0) {
            board[row][column].flagged = true;
            remainingFlags--;
            UpdateFlagCounter();
        } else {
            // Alert or handle if maximum flags reached
            alert("Maximum number of flags reached.");
            return;
        }
    }

    board_generation(); // Regenerate the board to reflect the changes
}


//Function in charge of generating the board depending of the actions that we apply to
function board_generation() {
    gameboard.innerHTML = "";
    for (let i = 0; i < num_rows; i++) {
        for (let j = 0; j < num_columns; j++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            if (board[i][j].revealed) {
                cell.classList.add("revealed");
                if (board[i][j].ismine) {
                    cell.classList.add("mine");
                    cell.textContent = "?";
                } else if (board[i][j].count > 0) {
                    cell.textContent = board[i][j].count;
                }
            } else if (board[i][j].flagged) {
                cell.classList.add("flagged");
                cell.textContent = "🚩";
            }
            cell.addEventListener("click", () => revealedcell(i, j));
            cell.addEventListener("contextmenu", (event) => {
                event.preventDefault();
                toggleFlag(i, j);
            });
            gameboard.appendChild(cell);
        }
        gameboard.appendChild(document.createElement("br"));
    }
}

//Initialize the main functions
startboard();
board_generation();
