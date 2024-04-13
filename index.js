/*
winning screen
change website icon
change title of website
main menu
counter for flags
timer
final time
best time*/
const num_rows = 8;
const num_columns = 10;
const num_mines = 10;
const gameboard = document.getElementById("gameboard");
let board = [];
let remainingFlags = 10; // Start with 10 flags
let firstClick = true;

function startboard() {
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

    // Place mines randomly
    let mines_placement = 0;
    while (mines_placement < num_mines) {
        const row = Math.floor(Math.random() * num_rows);
        const column = Math.floor(Math.random() * num_columns);
        if (!board[row][column].ismine) {
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
function winScreen(){
    alert("pretty");
}


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
        while(board[row][column].ismine){
            startboard();
        }
        firstClick = false;
    }

    if (board[row][column].flagged) {
        return; // Ignore revealed cells that are flagged
    }

    board[row][column].revealed = true;

    if (board[row][column].ismine) {
        alert("Game Over...womp womp");
        startboard();
        board_generation();
        remainingFlags = 10;
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
        winScreen();
    }
}

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
    } else {
        if (remainingFlags > 0) {
            board[row][column].flagged = true;
            remainingFlags--;
        } else {
            // Alert or handle if maximum flags reached
            alert("Maximum number of flags reached.");
            return;
        }
    }

    board_generation(); // Regenerate the board to reflect the changes
}

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

startboard();
board_generation();