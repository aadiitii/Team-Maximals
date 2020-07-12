
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
var allowDiagonal = false;

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
	} else if (algorithm == "Bidirectional BFS"){
		$("#startBtn").html("Start Bidirectional BFS");
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

// to  execute the algorithm
function executeAlgo(){
	if (algorithm == "Depth-First Search (DFS)"){
		var visited = createVisited();
		var pathFound = DFS(startCell[0], startCell[1], visited);
	} else if (algorithm == "Breadth-First Search (BFS)"){
		var pathFound = BFS();
	} else if (algorithm == "Bidirectional BFS"){
		var pathFound = biBFS();
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

// to keep track of visited nodes
function createVisited(){
	var visited = [];
    var cells = $("#tableContainer").find("td");
   
	for (var i = 0; i < totalRows; i++){
		var row = [];
		for (var j = 0; j < totalCols; j++){  
				row.push(null);        
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

//taking neighbours only when not a wall
function getNeighbours(i, j,allowDiagonal){
	var neighbours = [];
	var cells = $("#tableContainer").find("td");

	if(allowDiagonal){
		if ( i > 0 ){ neighbours.push( [i - 1, j] );} //top
		if( i > 0 && j < (totalCols - 1) ){neighbours.push( [i - 1, j+1] );} //top-right
		if ( j < (totalCols - 1) ){ neighbours.push( [i, j + 1] );} //right
	    if(i < (totalRows - 1) && j < (totalCols - 1) ){ neighbours.push( [i + 1, j + 1] );} //bottom-right
		if ( i < (totalRows - 1) ){ neighbours.push( [i + 1, j] );} //bottom
		if(i < (totalRows - 1) && j > 0){ neighbours.push( [i + 1, j - 1] );} // bottom-left
		if ( j > 0 ){ neighbours.push( [i, j - 1] );} //left
		if(i > 0 && j > 0){ neighbours.push( [i - 1, j - 1] );} // top-left
	}else{
		if ( i > 0 && !cellIsAWall(i-1,j,cells) ){ neighbours.push( [i - 1, j] );} //top
		if ( j < (totalCols - 1)   && !cellIsAWall(i,j+1,cells)){ neighbours.push( [i, j + 1] );} //right
		if ( i < (totalRows - 1)   && !cellIsAWall(i+1,j,cells)){ neighbours.push( [i + 1, j] );} //bottom
		if ( j > 0  && !cellIsAWall(i,j-1,cells) ){ neighbours.push( [i, j - 1] );} //left

		
	}
	
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

//algo1 = Breadth First Search
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


//Algo2 = Bidirectional BFS
function biBFS(){
    var pathFound = false;
    var s_queue = new Array();  // queue for search
    var t_queue = new Array();
 
    var s_prev = createPrev(); //for parent
    var t_prev = createPrev();

    var visited = createVisited(); // to keep track of visited nodes
   
    var intersecting_node = -1; // initialising 
 
    s_queue.unshift( startCell ); // begin from start and end
    t_queue.unshift( endCell ); 
    cellsToAnimate.push(startCell, "searching");  // animation
    cellsToAnimate.push(endCell, "searching");
 
    visited[ startCell[0] ][ startCell[1] ] = 's'; //visited made true if from start
    visited[ endCell[0] ][ endCell[1] ] = 't'; // when from target node
    var intersecting_node =-1;
    while ( s_queue.length > 0 && t_queue.length > 0 ){
        var s_cell = s_queue.pop();
        var t_cell = t_queue.pop();
        var s_r = s_cell[0];
        var t_r = t_cell[0];
        var s_c = s_cell[1];
        var t_c = t_cell[1];
        cellsToAnimate.push( [s_cell, "visited"] ); //animation
		cellsToAnimate.push( [t_cell, "visited"] );
		
            // Put neighboring cells in queue
            var s_neighbours = getNeighbours(s_r,s_c,allowDiagonal);
            var t_neighbours = getNeighbours(t_r,t_c,allowDiagonal);
			
			// neighbours for end or target node
            for (var p = 0; p < t_neighbours.length ; p++){
	
				var m2 = t_neighbours[p][0];
				var n2 = t_neighbours[p][1];
				if (visited[m2][n2] === 't' ) {
					console.log("continue for t");
					 continue ;
				   }else
				if(visited[m2][n2] === null){ 
					   visited[m2][n2] = 't'; // updating if null before
					   t_prev[m2][n2] = [t_r, t_c];
					   console.log("parent of [" + m2 + n2 + "] is" + t_r + t_c); 
					   cellsToAnimate.push( [t_neighbours[p], "searching"] );
					   t_queue.unshift(t_neighbours[p]);
				}else{
					 intersecting_node = [m2,n2]; // if present and not from t then it is intersecting
					 t_prev[m2][n2] = [t_r, t_c];
					 console.log("t_prev of IN"+t_prev[intersecting_node[0]][intersecting_node[1]]);
					 break;

				  }
			   
			   }
            // neighbours of start node
             for (var k = 0; k < s_neighbours.length ; k++){
                 var m1 = s_neighbours[k][0];
                 var n1 = s_neighbours[k][1];
                 if (visited[m1][n1] === 's') {
					console.log("continue for s"); 
                     continue;
                    }else
                 if(visited[m1][n1] === null){
                        visited[m1][n1] = 's'; // updating if null before
                        s_prev[m1][n1] = [s_r, s_c];
                        console.log("parent of [" + m1 + n1 + "] is" + s_r + s_c); 
                        cellsToAnimate.push( [s_neighbours[k], "searching"] );
                        s_queue.unshift(s_neighbours[k]);
					}else{
					 intersecting_node = [m1,n1]; // if present and not from s then intersecting
					 s_prev[m1][n1] = [s_r, s_c];
					 console.log("s_prev of IN"+s_prev[intersecting_node[0]][intersecting_node[1]]);
					}
             }
			
			// if intersection found 
            if(intersecting_node !== -1){
                pathFound =true;
                console.log("intersecting node "+intersecting_node);

 
 
              var r = intersecting_node[0];
              var c = intersecting_node[1];
             cellsToAnimate.push( [[r, c], "success"] );
             while (s_prev[r][c] != null){ // path from start
                 var prevCell = s_prev[r][c];
                 r = prevCell[0];
                 c = prevCell[1];
      
                 cellsToAnimate.push( [[r, c], "success"] );
             }
			      r = intersecting_node[0];
                  c = intersecting_node[1];
			 cellsToAnimate.push( [[r, c], "success"] );
			 if(t_prev[r][c]===null){
				 console.log("t_prev for intersecting node is null");
			 }
             while (t_prev[r][c] != null){ // path for target 
                 console.log("t_prev console" + t_prev[r][c]);
                 var prevCell = t_prev[r][c];
                 r = prevCell[0];
                 c = prevCell[1];
      
                 cellsToAnimate.push( [[r, c], "success"] );
             }
 
                break;
            }
            
        }
         return pathFound;
     }

	 //animation 
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

// get delay in animation
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
