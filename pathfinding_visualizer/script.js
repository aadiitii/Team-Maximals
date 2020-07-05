
var totalRows = 25;
var totalCols = 40;
var inProgress = false;
var createWalls = false;
var justFinished = false;
var algorithm = null;
var animationSpeed = "Fast";
var startCell = [11, 15];
var endCell = [11, 25];
var cellsToAnimate = [];
var movingStart = false;
var movingEnd = false;

function generateGrid( rows, cols ) {
    var grid = "<table>";
    for ( row = 1; row <= rows; row++ ) {
        grid += "<tr>"; 
        for ( col = 1; col <= cols; col++ ) {      
            grid += "<td></td>";
        }
        grid += "</tr>"; 
    }
    grid += "</table>"
    return grid;
}

var myGrid = generateGrid( totalRows, totalCols);
$( "#tableContainer" ).append( myGrid );


// MOUSE FUNCTIONS

$( "td" ).mousedown(function(){
    // console.log("mouse down");
	var index = $( "td" ).index( this );
	var startCellIndex = (startCell[0] * (totalCols)) + startCell[1];
	var endCellIndex = (endCell[0] * (totalCols)) + endCell[1];
	if ( !inProgress ){
		// Clear board if just finished
		if ( justFinished   ){ 
			Board( keepWalls = true ); 
			justFinished = false;
		}
		if (index == startCellIndex){
			movingStart = true;
			console.log("Now moving start!");
		} else if (index == endCellIndex){
			movingEnd = true;
			console.log("Now moving end!");
		} else {
            // console.log("create wall!");
			createWalls = true;
		}
	 }
});

$( "td" ).mouseup(function(){
    // console.log("mouse  up");
	createWalls = false;
	movingStart = false;
	movingEnd = false;
});

$( "td" ).mouseenter(function() {
     
    // console.log("mouse enter");
	if (!createWalls && !movingStart && !movingEnd){ return; }
    var index = $( "td" ).index( this );
    var startCellIndex = (startCell[0] * (totalCols)) + startCell[1];
	var endCellIndex = (endCell[0] * (totalCols)) + endCell[1];
    if (!inProgress){
        //clear board if just finished
    	if (justFinished){ 
    		Board( keepWalls = true );
    		justFinished = false;
    	}
    	// console.log("Cell index = " + index);
    	if (movingStart && index != endCellIndex) {
    		moveStartOrEnd( index, "start");
    	} else if (movingEnd && index != startCellIndex) {
    		moveStartOrEnd( index, "end");
    	} else if (index != startCellIndex && index != endCellIndex) {
    		$(this).toggleClass("wall");
    	}
    }
});

$( "td" ).click(function() {
    // console.log("click");
    var index = $( "td" ).index( this );
    var startCellIndex = (startCell[0] * (totalCols)) + startCell[1];
	var endCellIndex = (endCell[0] * (totalCols)) + endCell[1];
    if ((inProgress == false) && !(index == startCellIndex) && !(index == endCellIndex)){
    	if ( justFinished ){ 
    		Board( keepWalls = true );
    		justFinished = false;
        }
    	$(this).toggleClass("wall");
    }
});


/* ----------------- */
/* ---- BUTTONS ---- */
/* ----------------- */

$( "#startBtn" ).click(function(){
    if ( algorithm == null ){ return;}
    if ( inProgress ){ update("wait"); return; }
	traverseGraph(algorithm);
});

$( "#clearBtn" ).click(function(){
    if ( inProgress ){ update("wait"); return; }
	Board(keepWalls = false);
});

/* --------------------- */
/* --- NAV BAR MENUS --- */
/* --------------------- */

$( "#algorithms .dropdown-item").click(function(){
	if ( inProgress ){ update("wait"); return; }
	algorithm = $(this).text();
	updateStartBtnText();
	console.log("Algorithm has been changd to: " + algorithm);
});

$( "#speed .dropdown-item").click(function(){
	if ( inProgress ){ update("wait"); return; }
	animationSpeed = $(this).text();
	updateSpeedDisplay();
	console.log("Speed has been changd to: " + animationSpeed);
});



/* ----------------- */
/* --- FUNCTIONS --- */
/* ----------------- */

function Board( keepWalls ){
	var cells = $("#tableContainer").find("td");
	var startCellIndex = (startCell[0] * (totalCols)) + startCell[1];
	var endCellIndex = (endCell[0] * (totalCols)) + endCell[1];
	for (var i = 0; i < cells.length; i++){
			isWall = $( cells[i] ).hasClass("wall");  //stores a true or false value
			$( cells[i] ).removeClass();
			if (i == startCellIndex){
				$(cells[i]).addClass("start"); 
			} else if (i == endCellIndex){
				$(cells[i]).addClass("end"); 
			} else if ( keepWalls && isWall ){ 
				$(cells[i]).addClass("wall"); 
			}
	}
}

// Ending statements
Board();

function moveStartOrEnd( newIndex, startOrEnd){
    console.log(newIndex);
	var newCellY = newIndex % totalCols;
	var newCellX = Math.floor((newIndex - newCellY) / totalCols);
	if (startOrEnd == "start"){
    	startCell = [newCellX, newCellY];
    	console.log("Moving start to [" + newCellX + ", " + newCellY + "]")
    } else {
    	endCell = [newCellX, newCellY];
    	console.log("Moving end to [" + newCellX + ", " + newCellY + "]")
    }
    Board(keepWalls = true);
    return;
}

function updateSpeedDisplay(){
	if (animationSpeed == "Slow"){
		$(".speedDisplay").text("Speed: Slow");
	} else if (animationSpeed == "Normal"){
		$(".speedDisplay").text("Speed: Normal");
	} else if (animationSpeed == "Fast"){
		$(".speedDisplay").text("Speed: Fast");
	}
	return;
}

function updateStartBtnText(){
	if (algorithm == "Depth-First Search (DFS)"){
		$("#startBtn").html("Start DFS");
	} else if (algorithm == "Breadth-First Search (BFS)"){
		$("#startBtn").html("Start BFS");
	} else if (algorithm == "Dijkstra"){
		$("#startBtn").html("Start Dijkstra");
	} else if (algorithm == "A*"){
		$("#startBtn").html("Start A*");
	} else if (algorithm == "Greedy Best-First Search"){
		$("#startBtn").html("Start Greedy BFS");
	} else if (algorithm == "Jump Point Search"){
		$("#startBtn").html("Start JPS");
	}
	return;
}

// Used to display error messages
function update(message){
	$("#resultsIcon").removeClass();
	$("#resultsIcon").addClass("fas fa-exclamation");
	$('#results').css("background-color", "#ff0707");
	$("#length").text("");
	if (message == "wait"){
		$("#duration").text("Please wait for the algorithm to finish.");
	}
}

// Used to display results
function updateResults(duration, pathFound, length){
	var firstAnimation = "swashOut";
	var secondAnimation = "swashIn";
	$("#results").removeClass();
    $("#results").addClass("magictime " + firstAnimation); 
    setTimeout(function(){ 
    	$("#resultsIcon").removeClass();
    	//$("#results").css("height","80px");
    	if (pathFound){
    		$('#results').css("background-color", "#77dd77");
    		$("#resultsIcon").addClass("fas fa-check");
    	} else {
    		$('#results').css("background-color", "#ff6961");
    		$("#resultsIcon").addClass("fas fa-times");
    	}
    	$("#duration").text("Duration: " + duration + " ms");
    	$("#length").text("Length: " + length);
    	$('#results').removeClass(firstAnimation);
    	$('#results').addClass(secondAnimation); 
    }, 1100);
}

// Counts length of successful path
// ************** CHECK IF EUCLIDEAN DIST IS CORRECT OR NOT  *********
function countLength(){
	var cells = $("td");
	var l = 0;
	for (var i = 0; i < cells.length; i++){
		if ($(cells[i]).hasClass("success")){
			l++;
		}
	}
	return l;
}
async function traverseGraph(algorithm){
    inProgress = true;
	Board( keepWalls = true );
	var startTime = Date.now();
	var pathFound = executeAlgo();
	var endTime = Date.now();
	await animateCells();
	if ( pathFound ){ 
		updateResults((endTime - startTime), true, countLength());
	} else {
		updateResults((endTime - startTime), false, countLength());
	}
	inProgress = false;
	justFinished = true;
}

function executeAlgo(){
	if (algorithm == "Depth-First Search (DFS)"){
		var visited = createVisited();
		var pathFound = DFS(startCell[0], startCell[1], visited);
	} else if (algorithm == "Breadth-First Search (BFS)"){
		var pathFound = BFS();
	} else if (algorithm == "Dijkstra"){
		var pathFound = dijkstra();
    }
     else if (algorithm == "A*"){
		var pathFound = AStar();
	} else if (algorithm == "Greedy Best-First Search"){
		var pathFound = greedyBestFirstSearch();
	} else if (algorithm == "Jump Point Search"){
		var pathFound = jumpPointSearch();
	}
	return pathFound;
}
function createVisited(){
	var visited = [];
    var cells = $("#tableContainer").find("td");
   
	for (var i = 0; i < totalRows; i++){
		var row = [];
		for (var j = 0; j < totalCols; j++){
			if (cellIsAWall(i, j, cells)){
               
                row.push(true);
               
            } else 
            {   
				row.push(false);
			}
		}
		visited.push(row);
    }
    
	return visited;
}
function cellIsAWall(i, j, cells){
	var cellNum = (i * (totalCols)) + j;
	return $(cells[cellNum]).hasClass("wall");
}
function createPrev(){
	var prev = [];
	for (var i = 0; i < totalRows; i++){
		var row = [];
		for (var j = 0; j < totalCols; j++){
			row.push(null);
		}
		prev.push(row);
	}
	return prev;
}

function getNeighbours(i, j){
	var neighbours = [];
	if ( i > 0 ){ neighbours.push( [i - 1, j] );}
	if ( j > 0 ){ neighbours.push( [i, j - 1] );}
	if ( i < (totalRows - 1) ){ neighbours.push( [i + 1, j] );}
	if ( j < (totalCols - 1) ){ neighbours.push( [i, j + 1] );}
	return neighbours;
}
function createDistances(){
	var distances = [];
	for (var i = 0; i < totalRows; i++){
		var row = [];
		for (var j = 0; j < totalCols; j++){
			row.push(Number.POSITIVE_INFINITY);
		}
		distances.push(row);
	}
	return distances;
}
function BFS(){
	var pathFound = false;
	var myQueue = new Array();
	var prev = createPrev();
	var visited = createVisited();
	myQueue.unshift( startCell );
	cellsToAnimate.push(startCell, "searching");
	visited[ startCell[0] ][ startCell[1] ] = true;
	while ( myQueue.length > 0 ){
		var cell = myQueue.pop();
		var r = cell[0];
		var c = cell[1];
		cellsToAnimate.push( [cell, "visited"] );
		if (r == endCell[0] && c == endCell[1]){
			pathFound = true;
			break;
		}
		// Put neighboring cells in queue
		var neighbours = getNeighbours(r, c);
		for (var k = 0; k < neighbours.length; k++){
			var m = neighbours[k][0];
			var n = neighbours[k][1];
			if ( visited[m][n] ) { continue ;}
			visited[m][n] = true;
			prev[m][n] = [r, c];
			cellsToAnimate.push( [neighbours[k], "searching"] );
			myQueue.unshift(neighbours[k]);
		}
	}
	// Make any nodes still in the queue "visited"
	while ( myQueue.length > 0){
		var cell = myQueue.pop();
		var r = cell[0];
		var c = cell[1];
		cellsToAnimate.push( [cell, "visited"] );
	}
	// If a path was found, illuminate it
	if (pathFound) {
		var r = endCell[0];
		var c = endCell[1];
		cellsToAnimate.push( [[r, c], "success"] );
		while (prev[r][c] != null){
			var prevCell = prev[r][c];
			r = prevCell[0];
			c = prevCell[1];
			cellsToAnimate.push( [[r, c], "success"] );
		}
	}
	return pathFound;
}

// function dijkstra() {
// 	var pathFound = false;
// 	var myHeap = [];
// 	var prev = createPrev();
// 	var distances = createDistances();
// 	var visited = createVisited();
// 	distances[ startCell[0] ][ startCell[1] ] = 0;
// 	myHeap.push([0, [startCell[0], startCell[1]]]);
// 	cellsToAnimate.push([[startCell[0], startCell[1]], "searching"]);
// 	while (myHeap.length > 0){
// 		var cell = myHeap.dequeue();
// 		//console.log("Min was just popped from the heap! Heap is now: " + JSON.stringify(myHeap.heap));
// 		var i = cell[1][0];
// 		var j = cell[1][1];
// 		if (visited[i][j]){ continue; }
// 		visited[i][j] = true;
// 		cellsToAnimate.push([[i, j], "visited"]);
// 		if (i == endCell[0] && j == endCell[1]){
// 			pathFound = true;
// 			break;
// 		}
// 		var neighbors = getNeighbors(i, j);
// 		for (var k = 0; k < neighbors.length; k++){
// 			var m = neighbors[k][0];
// 			var n = neighbors[k][1];
// 			if (visited[m][n]){ continue; }
// 			var newDistance = distances[i][j] + 1;
// 			if (newDistance < distances[m][n]){
// 				distances[m][n] = newDistance;
// 				prev[m][n] = [i, j];
// 				myHeap.push([newDistance, [m, n]]);
// 				//console.log("New cell was added to the heap! It has distance = " + newDistance + ". Heap = " + JSON.stringify(myHeap.heap));
// 				cellsToAnimate.push( [[m, n], "searching"] );
// 			}
// 		}
// 		//console.log("Cell [" + i + ", " + j + "] was just evaluated! myHeap is now: " + JSON.stringify(myHeap.heap));
// 	}
// 	//console.log(JSON.stringify(myHeap.heap));
// 	// Make any nodes still in the heap "visited"
// 	while ( !myHeap.isEmpty() ){
// 		var cell = myHeap.getMin();
// 		var i = cell[1][0];
// 		var j = cell[1][1];
// 		if (visited[i][j]){ continue; }
// 		visited[i][j] = true;
// 		cellsToAnimate.push( [[i, j], "visited"] );
// 	}
// 	// If a path was found, illuminate it
// 	if (pathFound) {
// 		var i = endCell[0];
// 		var j = endCell[1];
// 		cellsToAnimate.push( [endCell, "success"] );
// 		while (prev[i][j] != null){
// 			var prevCell = prev[i][j];
// 			i = prevCell[0];
// 			j = prevCell[1];
// 			cellsToAnimate.push( [[i, j], "success"] );
// 		}
// 	}
// 	return pathFound;
// }
async function animateCells(){
	animationState = null;
	var cells = $("#tableContainer").find("td");
	var startCellIndex = (startCell[0] * (totalCols)) + startCell[1];
	var endCellIndex = (endCell[0] * (totalCols)) + endCell[1];
	var delay = getDelay();
	for (var i = 0; i < cellsToAnimate.length; i++){
		var cellCoordinates = cellsToAnimate[i][0];
		var x = cellCoordinates[0];
		var y = cellCoordinates[1];
		var num = (x * (totalCols)) + y;
		if (num == startCellIndex || num == endCellIndex){ continue; }
		var cell = cells[num];
		var colorClass = cellsToAnimate[i][1];

		// Wait until its time to animate
		await new Promise(resolve => setTimeout(resolve, delay));

		$(cell).removeClass();
		$(cell).addClass(colorClass);
	}
	cellsToAnimate = [];
	//console.log("End of animation has been reached!");
	return new Promise(resolve => resolve(true));
}
function getDelay(){
	var delay;
	if (animationSpeed === "Slow"){
		if (algorithm == "Depth-First Search (DFS)") {
			delay = 25;
		} else {
			delay = 20;
		}
	} else if (animationSpeed === "Normal") {
		if (algorithm == "Depth-First Search (DFS)") {
			delay = 15;
		} else {
			delay = 10;
		}
	} else if (animationSpeed == "Fast") {
		if (algorithm == "Depth-First Search (DFS)") {
			delay = 10;
		} else {
			delay = 5;
		}
	}
	console.log("Delay = " + delay);
	return delay;
}
