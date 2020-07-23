var totalRows = 20; //rows in grid
var totalCols = 40; //columns in grid
var inProgress = false;
var createWalls = false;
var justFinished = false;
var algorithm = null;
var animationSpeed = "Fast";
var startCell = [11, 16]; // start cell position
var endCell = [11, 25];//end cell position
var cellsToAnimate = [];
var movingStart = false;
var movingEnd = false;
var length = 0;
var bidirectional=true;   // implement a func to set this variable true when that option is clicked
var type ="manhattan"; //create a func to set the type according to the selected option
var weight = 1;  // update this value according to the weight entered by the user
var diagonalMovement = "Always";
var allowadiagonal = true;


// To Generate Grid
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

// min heap created as an object
function minHeap() {
	// of the type: [cost(integer),[i,j](index)]
	this.heap = [];
	this.isEmpty = function(){
		return (this.heap.length == 0);
	}
	this.clear = function(){
		this.heap = [];
		return;
	}
	this.getMin = function(){
		if (this.isEmpty()){    
			return null;
		}
		var min = this.heap[0]; //since min heap is used so, the 0th index element will be minimun
		this.heap[0] = this.heap[this.heap.length - 1]; // to pop this element ,swap it with the last element
		this.heap[this.heap.length - 1] = min;
		this.heap.pop();
		if (!this.isEmpty()){  //then heapify the modified heap(in the form of array) in downward manner
			this.siftDown(0);
		}
		return min;
	}
	this.push = function(item){
		this.heap.push(item);    // push the elment in the end of the array
		this.siftUp(this.heap.length - 1);   // heapify in the upward manner
		return;
	}
	this.parent = function(index){
		if (index == 0){
			return null;
		}
		return Math.floor((index - 1) / 2);
	}
	this.children = function(index){
		return [(index * 2) + 1, (index * 2) + 2];
	}
	// heapify downward, from parent node to child nodes
	this.siftDown = function(index){
		var children = this.children(index);
		var leftChildValid = (children[0] <= (this.heap.length - 1));
		var rightChildValid = (children[1] <= (this.heap.length - 1));
		var newIndex = index;
		// if left child < parent , new index value updated
		if (leftChildValid && this.heap[newIndex][0] > this.heap[children[0]][0]){
			newIndex = children[0];
		}
		// if right child < new index(initially the left child if above statement executed), new index value updated
		if (rightChildValid && this.heap[newIndex][0] > this.heap[children[1]][0]){
			newIndex = children[1];
		}
		// No sifting down needed
		if (newIndex === index){ return; }
		// swap the parent vale with new index value
		var val = this.heap[index];
		this.heap[index] = this.heap[newIndex];
		this.heap[newIndex] = val;
		this.siftDown(newIndex);    // heapify from the new index i.e. the remaining tree
		return;
	}
	//heapify upward from child node to parent node
	this.siftUp = function(index){
		var parent = this.parent(index);
		if (parent !== null && this.heap[index][0] < this.heap[parent][0]){
			var val = this.heap[index];
			this.heap[index] = this.heap[parent];
			this.heap[parent] = val;
			this.siftUp(parent);
		}
		return;
	}
}


// MOUSE FUNCTIONS

$( "td" ).mousedown(function(){
    // console.log("mouse down");
	var index = $( "td" ).index( this ); // to get index of cell
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

// calls traversegraph function on clicking start
$( "#startBtn" ).click(function(){
    if ( algorithm == null ){ return;}
    if ( inProgress ){ update("wait"); return; }
	traverseGraph(algorithm);
});

//clears the board
$( "#clearBtn" ).click(function(){
    if ( inProgress ){ update("wait"); return; }
	Board(keepWalls = false);
});



/* --------------------- */
/* --- NAV BAR MENUS --- */
/* --------------------- */

//To update Algorithms
$( "#algorithms .dropdown-item").click(function(){
	if ( inProgress ){ update("wait"); return; }
	algorithm = $(this).text();
	updateStartBtnText();
	console.log("Algorithm has been changd to: " + algorithm);
});

//To update Speed
$( "#speed .dropdown-item").click(function(){
	if ( inProgress ){ update("wait"); return; }
	animationSpeed = $(this).text();
	updateSpeedDisplay();
	console.log("Speed has been changd to: " + animationSpeed);
});

//To update Diagonal Movement
$( "#diagonal .dropdown-item").click(function(){
	if ( inProgress ){ update("wait"); return; }
	diagonalMovement = $(this).text();
	UpdateDiagonalMovement();
	console.log("DiagonalMovement has been changd to: " + diagonalMovement);
});


//To Update heuristics 
$( "#type .dropdown-item").click(function(){
	if ( inProgress ){ update("wait"); return; }
	type = $(this).text();
	Updateheuristics();
	console.log("DiagonalMovement has been changd to: " + type);
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

Board();

//To move Start or End Cell
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


function makeWall(cell){
	if (!createWalls){return;}
    var index = $( "td" ).index( cell );
    var row = Math.floor( ( index ) / totalRows) + 1;
    var col = ( index % totalCols ) + 1;
    console.log([row, col]);
    if ((inProgress == false) && !(row == 1 && col == 1) && !(row == totalRows && col == totalCols)){
    	$(cell).toggleClass("wall");
    }
}

//To update Speed in Display
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

//To update Diagonal Movement in Display
function UpdateDiagonalMovement(){
	if (diagonalMovement == "Never"){
		$(".diagonalDisplay").text("DM: Never");
	} else if (diagonalMovement== "Always"){
		$(".diagonalDisplay").text("DM: Always");
	} else if (diagonalMovement== "OnlyWhenNoObstacles"){
		$(".diagonalDisplay").text("DM:No Obstacle");
	} else if (diagonalMovement== "IfAtMostOneObstacle"){
		$(".diagonalDisplay").text("DM: When One Obstacles");
	}
	return;
}

//To update Heuristics in Display
function Updateheuristics(){
	if (type == "manhattan"){
		$(".heuristicdisplay").text("manhattan");
	} else if (type == "octile"){
		$(".heuristicdisplay").text("octile");
	} else if (type == "euclidean"){
		$(".heuristicdisplay").text("euclidean");
	} else if (type == "chebyshev"){
		$(".heuristicdisplay").text("chebyshev");
	}
	return;
}

//To Update Algorithms in Display button
function updateStartBtnText(){
	if (algorithm == "Depth-First Search (DFS)"){
		$("#startBtn").html("Start DFS");
	} else if (algorithm == "Breadth-First Search (BFS)"){
		$("#startBtn").html("Start BFS");
	} else if (algorithm == "Dijkstra"){
		$("#startBtn").html("Start Dijkstra");
	}else if (algorithm == "Bi-Dijkstra"){
		$("#startBtn").html("Start Bi-Dijkstra");
	} else if (algorithm == "A*"){
		$("#startBtn").html("Start A*");
	} else if (algorithm == "Bidirectional A*"){
		$("#startBtn").html("Start BiA*");
	}else if (algorithm == "Greedy Best-First Search"){
		$("#startBtn").html("Start Greedy BFS");
	}else if (algorithm == "Bi-Greedy Best-First Search"){
		$("#startBtn").html("Start Bi-Greedy BFS");
	} else if (algorithm == "Bidirectional BFS"){
		$("#startBtn").html("Start Bi BFS");
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

 // to return final calculated length
function countLength(){
	return length;
}

//Result the result taken to find path
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
		var visited = actualVisited();
		var pathFound = DFS(startCell[0], startCell[1], visited);
	} else if (algorithm == "Breadth-First Search (BFS)"){
		var pathFound = BFS();
	} else if (algorithm == "Dijkstra"){
		var pathFound = dijkstra();
    }else if (algorithm == "Bi-Dijkstra"){
		var pathFound = Bidijkstra();
    } else if (algorithm == "A*"){
		var pathFound = AStar();
	} else if (algorithm == "Bidirectional A*"){
		var pathFound = BiAStar();
	} else if (algorithm == "Greedy Best-First Search"){
		var pathFound = greedyBestFirstSearch();
	}else if (algorithm == "Bi-Greedy Best-First Search"){
		var pathFound = BigreedyBestFirstSearch();
	} else if (algorithm == "Bidirectional BFS"){
		var pathFound = biBFS();
	} else if (algorithm == "Jump Point Search"){
		var pathFound = jumpPointSearch();
	}
	return pathFound;
}



//Initialises all the cell value as null 
function actualVisited(){
	var visited = [];
    
	for (var i = 0; i < totalRows; i++){
		var row = [];
		for (var j = 0; j < totalCols; j++){  
				row.push(null);     
			}
		visited.push(row);
    }
    
	return visited;
}

//returns if cell is a wall
function cellIsAWall(i, j, cells){
	var cellNum = (i * (totalCols)) + j;
	return $(cells[cellNum]).hasClass("wall");
}

//True if cell is a wall otherwise false
function iswall(){
	var wall = [];
	var cells = $("#tableContainer").find("td");
	for (var i = 0; i < totalRows; i++){
		var row = [];
		for (var j = 0; j < totalCols; j++){
			if (cellIsAWall(i, j, cells)){
				row.push(true);
			} else {
				row.push(false);
			}
		}
		wall.push(row);
	}
	return wall;
}

// to get neighbours of a cell
function getNeighbours(i, j, diagonalMovement){
	var neighbours = [];
	var cells = $("#tableContainer").find("td"); 

	// initialising all directions as null
	var s0 = null; //top
	var s1 = null; //right
	var s2 = null; //bottom
	var s3 = null; //left
	var d0 = null; //top left
	var d1 = null; //top right
	var d2 = null; //bottom right 
	var d3 = null; //bottom left

// if top neighbour is inside grid and is not a wall, make it true
	if ( i > 0 && (i <= (totalRows -1) )&& !cellIsAWall(i-1,j,cells) ){ 
		s0=true;
	}
	 
// if right neighbour is inside grid and is not a wall, make it true
	if ( j < (totalCols - 1) && j>=0  && !cellIsAWall(i,j+1,cells)){
		 s1 = true;
		} 

// if bottom neighbour is inside grid and is not a wall, make it true
	if (i>=0 && i < (totalRows - 1)   && !cellIsAWall(i+1,j,cells)){
		s2 = true;
		}

// if left neighbour is inside grid and is not a wall, make it true
	if ( j > 0 && (j <= (totalCols-1))  && !cellIsAWall(i,j-1,cells) ){
		s3= true;
		}
	
// conditions for diagonal movement when no wall/obstacle 
	if (diagonalMovement === "OnlyWhenNoObstacles") {
		d0 = s3 && s0;
		d1 = s0 && s1;
		d2 = s1 && s2;
		d3 = s2 && s3;
		//If only one side has a Wall
	} else if (diagonalMovement === "IfAtMostOneObstacle") {
		d0 = s3 || s0;
		d1 = s0 || s1;
		d2 = s1 || s2;
		d3 = s2 || s3;
		//When no diagonal movement put all diagonal to false
	} else if (diagonalMovement === "Never") {
		d0 =false;
		d1 = false;
		d2 = false;
		d3 = false;
		// when diagonal movement allowed put all directions to true
	} else if (diagonalMovement === "Always") {
		d0 = true;
		d1 = true;
		d2 = true;
		d3 = true;
		
	} else {
		console.log("ERROR in  diagonal movement");
	}

	//to push in neighbours array whenever a direction is true for top right bottom left 
	//top
	if(s0){
		neighbours.push( [i - 1, j] );
	}
	//right	
	if(s1){
		neighbours.push( [i, j + 1] );
	}	
	//bottom
	if(s2){
		neighbours.push( [i + 1, j] );
	}
	//left
	if(s3){
		neighbours.push( [i, j - 1] );
	}

	// to push diagonal neighbours in array neighbours for diagonals
	// ↖
	if (d0 && !cellIsAWall(i - 1, j - 1, cells)  && i>0 && i < totalRows-1 && j>0 && j< totalCols-1) {
		neighbours.push([i- 1,j - 1]);
	}


	// ↗
	if (d1 && !cellIsAWall(i - 1, j + 1, cells ) && i>0 && i < totalRows-1 && j>0 && j< totalCols-1) {
		neighbours.push([i - 1, j + 1]);
	}

	
	// ↘
	if (d2 && !cellIsAWall(i + 1, j + 1, cells)  && i>0 && i < totalRows-1 && j>0 && j< totalCols-1) {
		neighbours.push([i + 1, j + 1]);
	}

	
	// ↙
	if (d3 && !cellIsAWall(i + 1, j - 1, cells)  && i>0 && i < totalRows-1 && j>0 && j< totalCols-1) {
		neighbours.push([i + 1, j - 1]);
	}

	console.log("neighbours are " +neighbours);
	return neighbours;
};

//to initialise all distance as infinity 
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

//To get heuristic value
function heuristics(type,i,j,pos){
	//for target cell
	if(pos== 'e'){
		var dx = Math.abs(startCell[0] - i);
	    var dy = Math.abs(startCell[1] - j);
	}
	// for start cell
	else if(pos == 's'){
		var dx = Math.abs(endCell[0] - i);
		var dy = Math.abs(endCell[1] - j);
	}
	
	// formulas  to calculate heuristics
  if(type === "manhattan"){
      return (dx + dy);
  }
  if(type === "euclidean"){
      return (Math.sqrt(dx * dx + dy*dy));
  }
  if(type === "octile"){
	var F = Math.SQRT2 - 1;
	console.log("octile distance" + (dx < dy) ? F * dx + dy : F * dy + dx);
	return (dx < dy) ? F * dx + dy : F * dy + dx;
	
  }
  if(type === "chebyshev"){
	 return ( Math.max(dx, dy));
  }
  
}



//Function to implement BREADTH FIRST SEARCH 
function BFS(){
	var pathFound = false;
	var myQueue = new Array(); // array initialise
	var prev = actualVisited();
	var visited = actualVisited(); // makes an array and initialises the cells as null
	
	myQueue.unshift( startCell ); // put start cell and animate search
	cellsToAnimate.push(startCell, "searching");
	visited[ startCell[0] ][ startCell[1] ] = true; //mark as visited
	
	while ( myQueue.length > 0 ){
		var cell = myQueue.pop();
		var r = cell[0];
		var c = cell[1];
		cellsToAnimate.push( [cell, "visited"] );
		// when equal to end node put path found as true
		if (r == endCell[0] && c == endCell[1]){
			pathFound = true;
			break;
		}
		// Put neighboring cells in queue
		var neighbours = getNeighbours(r, c,diagonalMovement);
		console.log("neighbours are" + neighbours + "of" + r + " " + c );
		for (var k = 0; k < neighbours.length; k++){
			var m = neighbours[k][0];
			var n = neighbours[k][1];
			// if not visited before mark it as visited
			if ( visited[m][n] === null){
				visited[m][n] = true;
				prev[m][n] = [r, c]; //putting previous(parent) cell
				cellsToAnimate.push( [neighbours[k], "searching"] );
				myQueue.unshift(neighbours[k]);
				}
	}
	}

	// If a path was found, illuminate it
	if (pathFound) {
		var sum=0;
		var r = endCell[0];
		var c = endCell[1];
		cellsToAnimate.push( [endCell, "success"] );
		// backtracking parent cells
		while (prev[r][c] != null){
			var a = r,b=c; 
			var prevCell = prev[r][c];
			r = prevCell[0];
			c = prevCell[1];
			var dx = a-r,dy = b-c;
			sum+= Math.sqrt(dx*dx +dy*dy); //calculating distance between cells and adding
			cellsToAnimate.push( [[r,c], "success"] );
		}
		length =sum.toFixed(2) ; // rounding off length till 2decimal places
	}
	return pathFound;
}

//Function to implement BIDIRECTIONAL BREADTH FIRST SEARCH
function biBFS(){
    var pathFound = false;
    var s_queue = new Array();  //array for search
    var t_queue = new Array();
 
    var s_prev = actualVisited(); 
    var t_prev = actualVisited();
 
    var visited = actualVisited(); // to keep track of visited nodes
   
    var intersecting_node = -1; // initialising
 
    s_queue.unshift( startCell ); // begin from start and end
    t_queue.unshift( endCell ); 
    cellsToAnimate.push(startCell, "searching");  // animation for search
    cellsToAnimate.push(endCell, "searching");
 
    visited[ startCell[0] ][ startCell[1] ] = 's'; //visited made s for start and t for target cell 
	visited[ endCell[0] ][ endCell[1] ] = 't';
	
    var intersecting_node =-1;
        while ( s_queue.length > 0 && t_queue.length > 0 ){
		    console.log("loop1");
			
			var s_cell = s_queue.pop(); // from start
			var t_cell = t_queue.pop(); // from end 
			var s_r = s_cell[0];
			var t_r = t_cell[0];
			var s_c = s_cell[1];
			var t_c = t_cell[1];
			cellsToAnimate.push( [s_cell, "visited"] );
			cellsToAnimate.push( [t_cell, "visited"] );
        
 
				//making array of neighbours for s and t side
				var s_neighbours = getNeighbours(s_r,s_c,diagonalMovement);
				var t_neighbours = getNeighbours(t_r,t_c,diagonalMovement);
			
			 // neighbours from end cell side
			 // loop through all the neighbours, check if already marked as 't' then continue
			 // if null, marks as t, put its parent in prev and animate for searching 
			 // else intersecting node found
             for (var p = 0; p < t_neighbours.length ; p++){
				var m2 = t_neighbours[p][0];
				var n2 = t_neighbours[p][1];
				// if already marked as 't' continue
				if (visited[m2][n2] === 't' ) {
					 continue ;
				   }else
				if(visited[m2][n2] === null){
					   visited[m2][n2] = 't';
					   t_prev[m2][n2] = [t_r, t_c]; 
					   cellsToAnimate.push( [t_neighbours[p], "searching"] );
					   t_queue.unshift(t_neighbours[p]);
				}else{
					 intersecting_node = [m2,n2];
					 t_prev[m2][n2] = [t_r, t_c];
                       break;
				  }
			   
			   }
 			 // neighbours from start cell side
			 // loop through all the neighbours, check if already marked as 's' then continue
			 // if null, marks as s, put its parent in prev and animate for searching 
			 // else intersecting node found, store previous
             for (var k = 0; k < s_neighbours.length ; k++){
                 var m1 = s_neighbours[k][0];
                 var n1 = s_neighbours[k][1];
                 if (visited[m1][n1] === 's') {
					console.log("continue for s");
                     continue;
                    }else
                 if(visited[m1][n1] === null){
                        visited[m1][n1] = 's';
                        s_prev[m1][n1] = [s_r, s_c];
                        console.log("parent of [" + m1 + n1 + "] is" + s_r + s_c); 
                        cellsToAnimate.push( [s_neighbours[k], "searching"] );
                        s_queue.unshift(s_neighbours[k]);
					}else{
					 intersecting_node = [m1,n1];
					 s_prev[m1][n1] = [s_r, s_c];
					 console.log("s_prev of IN"+s_prev[intersecting_node[0]][intersecting_node[1]]);
					 break;
					}
                }
        
        // if intersection found, path found made true  
		 if(intersecting_node !== -1){
			pathFound =true;
			console.log("intersecting node "+intersecting_node);
		  
		  var sum =0;
		  var r = intersecting_node[0]; //coordinated of intersection
		  var c = intersecting_node[1];
		  cellsToAnimate.push( [[r, c], "success"] );
		  
          // backtracking from intersecting node for start node
		  while (s_prev[r][c] != null){
			 var a = r, b = c;
			 var prevCell = s_prev[r][c];
			 r = prevCell[0];
			 c = prevCell[1];
			
			var dx = a-r, dy = b-c;
			sum += Math.sqrt(dx*dx + dy*dy);
			 cellsToAnimate.push( [[r, c], "success"] );
			}
		
			// for intersection to end
			r = intersecting_node[0]; //coordinates for intersection
			c = intersecting_node[1];
			cellsToAnimate.push( [[r, c], "success"] );
		 
			//backtracking from intersection for end cell
		   while (t_prev[r][c] != null){
			 a = r, b = c;
			 var prevCell = t_prev[r][c];
			 r = prevCell[0];
			 c = prevCell[1];
			 var dx = a-r, dy = b-c;
			 sum += Math.sqrt(dx*dx + dy*dy); // calculating length
			 cellsToAnimate.push( [[r, c], "success"] );
			}
		length = sum.toFixed(2); //till 2 decimal places
		break;
		}
    }
	 
    return pathFound;
}

//Function to implement ASTAR 
function AStar() {
	var pathFound = false;
	var myHeap = new minHeap(); // uses min heap(priority queue)
	var prev = actualVisited();
	var distances = createDistances();
	var costs = createDistances();
	var visited = actualVisited();

	distances[ startCell[0] ][ startCell[1] ] = 0; // distance and cost of start =0
	costs[ startCell[0] ][ startCell[1] ] = 0;
	myHeap.push([0, [startCell[0], startCell[1]]]);
	cellsToAnimate.push([[startCell[0], startCell[1]], "searching"]);
	
	while (!myHeap.isEmpty()){
		var cell = myHeap.getMin(); //pops the node with minimum cost
		var i = cell[1][0];
		var j = cell[1][1];

		if(visited[i][j]===null){
			visited[i][j] = true;
			cellsToAnimate.push([[i, j], "visited"]);

			//if  path found make true
			if (i == endCell[0] && j == endCell[1]){
				pathFound = true;
				break;
			}

			// to get neighbours of cell
			var neighbours = getNeighbours(i, j, diagonalMovement);
			for (var k = 0; k < neighbours.length; k++){
				var m = neighbours[k][0];
				var n = neighbours[k][1];

				// if hasnt been visited, check distance, if in the same row or column, add by one
				//otherwise diagonal and sqrt of 2
				if (visited[m][n]===null){
					var newDistance = distances[i][j] + (( m-i ===0 || n-j ===0) ? 1 :Math.sqrt(2));
					console.log("distance" + newDistance);
					//update the distance and cost of the neighbours
					if (newDistance < distances[m][n]){
						distances[m][n] = newDistance;
						prev[m][n] = [i, j];
						cellsToAnimate.push( [[m, n], "searching"] );
					}
				
					var newCost = distances[i][j] + (weight *heuristics(type,m,n,'s'));
					if (newCost < costs[m][n]){
						costs[m][n] = newCost;
						myHeap.push([newCost, [m, n]]);
					}
				}
		}
	}
}


	// if path found, animate the path and calculate distance
	if (pathFound) {
		var sum=0;
		var i = endCell[0];
		var j = endCell[1];
		cellsToAnimate.push( [endCell, "success"] );
		while (prev[i][j] != null){
			var a = i,b=j; 
			var prevCell = prev[i][j];
			
			i = prevCell[0];
			j = prevCell[1];
			var dx = a-i,dy = b-j;
			sum+= Math.sqrt(dx*dx +dy*dy);
			cellsToAnimate.push( [[i, j], "success"] );
		}
		length =sum.toFixed(2) ;
	}
	return pathFound;
}

//Function to implement Bidirectional ASTAR
function BiAStar() {
	var pathFound = false;
    
    var startHeap = new minHeap(); //generate a new min heap for search from start
	var startprev = actualVisited(); 
    var startdistances = createDistances(); 
	var startcosts = createDistances();

	var endHeap = new minHeap(); //generate a new min heap for search from end
	var endprev = actualVisited();
    var enddistances = createDistances();
	var endcosts = createDistances();
    var visited = actualVisited(); // to keep track of visited nodes(s from forward search & e from backward search)
   
	var intersecting_node = -1;
    // set the distances and costs for start cell and end cell =0 and visited as s nd e respectively
	//push start node in start heap and end node in end heap
    startdistances[ startCell[0] ][ startCell[1] ] = 0;
    startcosts[ startCell[0] ][ startCell[1] ] = 0;
    startHeap.push([0, [startCell[0], startCell[1]]]);
	cellsToAnimate.push([[startCell[0], startCell[1]], "searching"]);
   
    enddistances[ endCell[0] ][ endCell[1] ] = 0;
	endcosts[ endCell[0] ][ endCell[1] ] = 0;
	endHeap.push([0, [endCell[0], endCell[1]]]);
	cellsToAnimate.push([[endCell[0], endCell[1]], "searching"]);

    while (!startHeap.isEmpty() && !endHeap.isEmpty()){
        console.log("loop1");
        // pop the position of start node which has the minimum cost 
		var s_cell = startHeap.getMin();
		console.log("s_cell is: " + s_cell);
		var i = s_cell[1][0];
		var j = s_cell[1][1];
		if (visited[i][j] == null){ 
			
			visited[i][j] = 's';  // mark the node as 's' (for visited from forward search)  
			cellsToAnimate.push([[i, j], "visited"]);

	// traverse through all valid neigbours of the current node
			var start_neighbours = getNeighbours(i, j, diagonalMovement);
			for (var k = 0; k < start_neighbours.length; k++){
				var m = start_neighbours[k][0];
				var n = start_neighbours[k][1];
				if (visited[m][n] ==='s'){
					 continue;
					 }else
				if(visited[m][n]==='e'){  //if visited already visited from the backward search, then set the value of intersecting node and break
					intersecting_node = [m,n];
					startprev[m][n] = [i,j];
					break;
				}
				//update the distance and cost of neighbours from start side
				//if in the same row or column, add by one
				//otherwise diagonal and sqrt of 2
				var newDistance = startdistances[i][j]+  (( m-i ===0 || n-j ===0) ? 1 :Math.sqrt(2));
				if (newDistance < startdistances[m][n]){
					startdistances[m][n] = newDistance;
					startprev[m][n] = [i, j];
					cellsToAnimate.push( [[m, n], "searching"] );
				}
				
				var newCost = startdistances[i][j] + (weight *heuristics(type,m,n,'s'));
				if (newCost < startcosts[m][n]){
					startcosts[m][n] = newCost;
					startHeap.push([newCost, [m, n]]);
				}
			}	
			
		}
		
        
        // pop the position of end node which has the minimum cost
        var e_cell = endHeap.getMin();
		 var r = e_cell[1][0];
		 var c = e_cell[1][1];
		if (visited[r][c] == null){ 
			visited[r][c] = 'e';
			cellsToAnimate.push([[r, c], "visited"]);
			if (r == startCell[0] && c == startCell[1]){
				pathFound = true;
				break;
			}
			var end_neighbours = getNeighbours(r, c, diagonalMovement);
			for (var k = 0; k < end_neighbours.length; k++){
				var m = end_neighbours[k][0];
				var n = end_neighbours[k][1];
				if (visited[m][n] ==='e'){
					continue;
					}else
				if(visited[m][n]==='s'){
					intersecting_node = [m,n];
					endprev[m][n] = [r,c];
					break;
				}
				//update the distance and cost of neighbours from end side
				//if in the same row or column, add by one
				//otherwise diagonal and sqrt of 2
				var newDistance = enddistances[r][c] + (( m-r ===0 || n-c ===0) ? 1 :Math.sqrt(2));
				if (newDistance < enddistances[m][n]){
					enddistances[m][n] = newDistance;
					endprev[m][n] = [r, c];
					cellsToAnimate.push( [[m, n], "searching"] );
				}
				
				var newCost = enddistances[r][c] + (weight *heuristics(type,m,n,'e'));
				if (newCost < endcosts[m][n]){
					endcosts[m][n] = newCost;
					endHeap.push([newCost, [m, n]]);
				}
		   }
		
			
			
		}
		
	   // If a intersecting node was found, illuminate the two paths and calculate its length
	   if(intersecting_node !== -1){
		pathFound =true;
		console.log("intersecting node "+intersecting_node);
	  
	  var sum =0;
	  var r = intersecting_node[0];
	  var c = intersecting_node[1];
	  cellsToAnimate.push( [[r, c], "success"] );
	  
	  while (startprev[r][c] != null){
		 var a = r, b = c;
		 var prevCell = startprev[r][c];
		 r = prevCell[0];
		 c = prevCell[1];
		
		var dx = a-r, dy = b-c;
		sum += Math.sqrt(dx*dx + dy*dy);
		 cellsToAnimate.push( [[r, c], "success"] );
		}
	
		r = intersecting_node[0];
		c = intersecting_node[1];
		cellsToAnimate.push( [[r, c], "success"] );
	 
	 
	   while (endprev[r][c] != null){
		 a = r, b = c;
		 console.log("t_prev console" + endprev[r][c]);
		 var prevCell = endprev[r][c];
		 r = prevCell[0];
		 c = prevCell[1];
		 var dx = a-r, dy = b-c;
		 sum += Math.sqrt(dx*dx + dy*dy);
		 cellsToAnimate.push( [[r, c], "success"] );
		}
	length = sum.toFixed(2);
	break;
	}

  
    }
    
	return pathFound;
}

// function to implement DIJKSTRA
function dijkstra() {

	var pathFound = false;

	var myHeap = new minHeap();  //generate a new min heap for search

	var prev = actualVisited();  // to store the prev node for each visited node
	var distances = createDistances(); // to store the distance of each node from the end node
	var visited = actualVisited();  // keep track of all visited nodes


	//set the cost of start node as zero and push in the heap
	distances[ startCell[0] ][ startCell[1] ] = 0;
	myHeap.push([0, [startCell[0], startCell[1]]]);
	cellsToAnimate.push([[startCell[0], startCell[1]], "searching"]);

	while (!myHeap.isEmpty()){
			// pop the position of node which has the minimum distance
			var cell = myHeap.getMin();

			var i = cell[1][0];
			var j = cell[1][1];

			if (visited[i][j] === null){

			visited[i][j] = true;     // mark the node as visited 
			cellsToAnimate.push([[i, j], "visited"]);

			if (i == endCell[0] && j == endCell[1]){   // if current node is end node then break out
				pathFound = true;
				break;
			}

			//traverse through the neighbours of the current node
			var neighbours = getNeighbours(i, j, diagonalMovement);
			for (var k = 0; k < neighbours.length; k++){
				var m = neighbours[k][0];
				var n = neighbours[k][1]; 
				if (visited[m][n] == null){

				//    update the neighbour node's distance with new values 
				//   according to distance from current node and push in heap	
					var newDistance = distances[i][j] + (( m-i ===0 || n-j ===0) ? 1 :Math.sqrt(2));
					
					if (newDistance < distances[m][n]){
						distances[m][n] = newDistance;
						prev[m][n] = [i, j];
						myHeap.push([newDistance, [m, n]]);
						cellsToAnimate.push( [[m, n], "searching"] );
					}
				}
			
			}
		}
    

   }
	
   // If a path was found, illuminate it and calculate its length
      if (pathFound) {
		var sum=0;
		var i = endCell[0];
		var j = endCell[1];
		cellsToAnimate.push( [endCell, "success"] );
		while (prev[i][j] != null){
			var a = i,b=j; 
			var prevCell = prev[i][j];
			
			i = prevCell[0];
			j = prevCell[1];
			var dx = a-i,dy = b-j;
			sum+= Math.sqrt(dx*dx +dy*dy);
			cellsToAnimate.push( [[i, j], "success"] );
		}
		length =sum.toFixed(2) ;
	}
	return pathFound;
}



// function to implement Bidirectional DIJKSTRA
function Bidijkstra() {
	
	var pathFound = false;
	
	
	var startHeap = new minHeap();          //generate a new min heap for search from start
	var startprev = actualVisited();        // to store the prev node for each node visited from forward search
    var startdistances = createDistances(); // to store the distances of each node from the start node
	
	
	var endHeap = new minHeap();     //generate a new min heap for search from end
	var endprev = actualVisited();   // to store the prev node for each node visited from backward search
    var enddistances = createDistances();  // to store the distances of each node from the end node
	
    var visited = actualVisited();  // to keep track of visited nodes(s from forward search & e from backward search)
	var intersecting_node = -1;
	
	// set the distances and costs for start cell and end cell as zero and visited as s nd e respectively 
	//push start node in start heap and end node in end heap
	startdistances[ startCell[0] ][ startCell[1] ] = 0;
    startHeap.push([0, [startCell[0], startCell[1]]]);
    cellsToAnimate.push([[startCell[0], startCell[1]], "searching"]);
   
    enddistances[ endCell[0] ][ endCell[1] ] = 0;
	endHeap.push([0, [endCell[0], endCell[1]]]);
    cellsToAnimate.push([[endCell[0], endCell[1]], "searching"]);

    while (!startHeap.isEmpty() && !endHeap.isEmpty()){
      
        // pop the position of start node which has the minimum cost 
		var s_cell = startHeap.getMin();
	
		var i = s_cell[1][0];
		var j = s_cell[1][1];

		if (visited[i][j] == null){ 
			
			visited[i][j] = 's';      // mark the node as 's' (for visited from forward search)  
			cellsToAnimate.push([[i, j], "visited"]);
			
			
			// traverse through all valid neigbours of the current node
			var start_neighbours = getNeighbours(i, j, diagonalMovement);
			for (var k = 0; k < start_neighbours.length; k++){
	
	
				var m = start_neighbours[k][0];
				var n = start_neighbours[k][1];
				if (visited[m][n] ==='s'){   
					 continue;
					 }else
				if(visited[m][n]==='e'){    //if visited already visited from the backward search, then set the value of intersecting node and break out
					intersecting_node = [m,n];
					startprev[m][n] = [i,j];
					break;
				}
				
				// update the neighbour node's distance with new values according to distance from current node and push in start heap
				var newDistance = startdistances[i][j]+  (( m-i ===0 || n-j ===0) ? 1 :Math.sqrt(2));
				if (newDistance < startdistances[m][n]){
					startdistances[m][n] = newDistance;
					startprev[m][n] = [i, j];
					console.log("startprev" + startprev[m][n]);
					cellsToAnimate.push( [[m, n], "searching"] );
					startHeap.push([newDistance, [m, n]] );

				}
				
			}	
			
		}
		
        
        // pop the position of end node which has the minimum cost
        var e_cell = endHeap.getMin();
		 var r = e_cell[1][0];
		 var c = e_cell[1][1];
		if (visited[r][c] == null){ 

			visited[r][c] = 'e';      // mark the node as 's' (for visited from forward search)
			cellsToAnimate.push([[r, c], "visited"]);
		
			// traverse through all valid neigbours of the current node
			var end_neighbours = getNeighbours(r, c, diagonalMovement);
			for (var k = 0; k < end_neighbours.length; k++){
				
				var m = end_neighbours[k][0];
				var n = end_neighbours[k][1];
				if (visited[m][n] ==='e'){
					continue;
					}else
				if(visited[m][n]==='s'){   //if visited already visited from the forward search, then set the value of intersecting node and break out
					intersecting_node = [m,n];
					endprev[m][n] = [r,c];
					break;
				}
				
				// update the neighbour node's cost with new values according to distance from current node and push in end heap
				var newDistance = enddistances[r][c] + (( m-r ===0 || n-c ===0) ? 1 :Math.sqrt(2));
				if (newDistance < enddistances[m][n]){
					enddistances[m][n] = newDistance;
					endprev[m][n] = [r, c];
					cellsToAnimate.push( [[m, n], "searching"] );
					endHeap.push([newDistance, [m,n]] );
				}
				
		   }
		
			
			
		}
		
	   // If a intersecting node was found, illuminate the two paths and calculate its length
	    if(intersecting_node !== -1){
		
		pathFound =true;
			
		
		var sum =0;
		var r = intersecting_node[0];
		var c = intersecting_node[1];
		cellsToAnimate.push( [[r, c], "success"] );
		
		while (startprev[r][c] != null){
				var a = r, b = c;
				console.log(" s prev console" + startprev[r][c]);
				var prevCell = startprev[r][c];
				r = prevCell[0];
				c = prevCell[1];
				
				var dx = a-r, dy = b-c;
				sum += Math.sqrt(dx*dx + dy*dy);
				cellsToAnimate.push( [[r, c], "success"] );
			}
		
			r = intersecting_node[0];
			c = intersecting_node[1];
			cellsToAnimate.push( [[r, c], "success"] );
		
		while (endprev[r][c] != null){
				a = r, b = c;
				console.log("t_prev console" + endprev[r][c]);
				var prevCell = endprev[r][c];
				r = prevCell[0];
				c = prevCell[1];
				var dx = a-r, dy = b-c;
				sum += Math.sqrt(dx*dx + dy*dy);
				cellsToAnimate.push( [[r, c], "success"] );
			}

		length = sum.toFixed(2);
		break;
	}

  
    }
    
 return pathFound;
}

// function to implement GREEDY BEST FIRST SEARCH
function greedyBestFirstSearch() {
	var pathFound = false;

	//generate a new min heap for search
	var myHeap = new minHeap();
	var prev = actualVisited();    // to store the prev node for each visited node
	var costs = createDistances();   // to store the cost for each node from the end node
	var visited = actualVisited(); // to store all the visited nodes
	
	//set the cost of start node as zero and push in the heap
	costs[ startCell[0] ][ startCell[1] ] = 0;
	myHeap.push([0, [startCell[0], startCell[1]]]);
	cellsToAnimate.push([[startCell[0], startCell[1]], "searching"]);
	
	while (!myHeap.isEmpty()){
		 // pop the position of node which has the minimum cost 
		var cell = myHeap.getMin();
		var i = cell[1][0];
		var j = cell[1][1];
		if (visited[i][j]){ continue; }

		visited[i][j] = true;    // mark the node as visited 
		cellsToAnimate.push([[i, j], "visited"]);

		if (i == endCell[0] && j == endCell[1]){  // if current node is end node then break out
			pathFound = true;
			break;
		}
	 
	 //traverse through the neighbours of the current node
		var neighbours = getNeighbours(i, j, diagonalMovement);
		for (var k = 0; k < neighbours.length; k++){
			
			var m = neighbours[k][0];
			var n = neighbours[k][1];
			
			if (visited[m][n]){ continue; }
			
			// calculate the new cost of current neighbour according to heuristics and update the cost and push in heap accordingly
			var newCost = ( weight *heuristics(type,m,n,'s'));
			
			if (newCost < costs[m][n]){
				prev[m][n] = [i, j];
				costs[m][n] = newCost;
				myHeap.push([newCost, [m, n]]);
				cellsToAnimate.push([[m, n], "searching"]);
			}
		}
	}

	// If a path was found, illuminate it and calculate its length
	if (pathFound) {
		var sum=0;
		var i = endCell[0];
		var j = endCell[1];
		cellsToAnimate.push( [endCell, "success"] );
		while (prev[i][j] != null){
			var a = i,b=j; 
			var prevCell = prev[i][j];
			
			i = prevCell[0];
			j = prevCell[1];
			var dx = a-i,dy = b-j;
			sum+= Math.sqrt(dx*dx +dy*dy);
			cellsToAnimate.push( [[i, j], "success"] );
		}
		length =sum.toFixed(2) ;
	}
	return pathFound;
}

// function to implement BIDIRECTIONAL GREEDY BEST FIRST SEARCH
function BigreedyBestFirstSearch(){
	
	var pathFound = false;
	
	//generate a new min heap for search from start
    var startHeap = new minHeap();
	var startprev = actualVisited();
	var startcosts = createDistances();
	
	//generate a new min heap for search from end
	var endHeap = new minHeap();
	var endprev = actualVisited();
    var endcosts = createDistances();

    var visited = actualVisited();
	var intersecting_node = -1;
	
    // set the cost for start cell and end cell =0 

    startcosts[ startCell[0] ][ startCell[1] ] = 0;
    startHeap.push([0, [startCell[0], startCell[1]]]);
    cellsToAnimate.push([[startCell[0], startCell[1]], "searching"]);
   
    endcosts[ endCell[0] ][ endCell[1] ] = 0;
	endHeap.push([0, [endCell[0], endCell[1]]]);
  	cellsToAnimate.push([[endCell[0], endCell[1]], "searching"]);

    while (!startHeap.isEmpty() && !endHeap.isEmpty()){
       
        // pop the position of start node which has the minimum cost 
		var s_cell = startHeap.getMin();
		
		var i = s_cell[1][0];
		var j = s_cell[1][1];

		if (visited[i][j] == null){ 
			
			visited[i][j] = 's';     // mark the node as 's' (for visited from start)  
			cellsToAnimate.push([[i, j], "visited"]);
 
			// traverse through all valid neigbours of the current node
			var start_neighbours = getNeighbours(i, j, diagonalMovement);
			for (var k = 0; k < start_neighbours.length; k++){
				
				var m = start_neighbours[k][0];
				var n = start_neighbours[k][1];
				if (visited[m][n] ==='s'){
					 continue;
					 }else
				if(visited[m][n]==='e'){    //if visited already visited from the end, then set the value of intersecting node and break out
					intersecting_node = [m,n];
					startprev[m][n] = [i,j];
					break;
				}
				// update the neighbour node's cost with new values according to heuristics and push in start heap
				var newCost = (weight *heuristics(type,m,n,'s'));
				if (newCost < startcosts[m][n]){
					startcosts[m][n] = newCost;
					startprev[m][n] = [i, j];
					startHeap.push([newCost, [m, n]]);
					cellsToAnimate.push( [[m, n], "searching"] );
				}
			}	
			
		}
		
        
        // pop the position of end node which has the minimum cost
         var e_cell = endHeap.getMin();
		 var r = e_cell[1][0];
		 var c = e_cell[1][1];
		if (visited[r][c] == null){ 
			visited[r][c] = 'e';    // mark the node as 'e' (for visited from end)  
			cellsToAnimate.push([[r, c], "visited"]);
			if (r == startCell[0] && c == startCell[1]){
				pathFound = true;
				break;
			}
			// traverse through all valid neigbours of the current node
			var end_neighbours = getNeighbours(r, c, diagonalMovement);
			for (var k = 0; k < end_neighbours.length; k++){
				
				var m = end_neighbours[k][0];
				var n = end_neighbours[k][1];
				if (visited[m][n] ==='e'){   
					continue;
					}else
				if(visited[m][n]==='s'){    //if visited already visited from the start, then set the value of intersecting node and break out
					intersecting_node = [m,n];
					endprev[m][n] = [r,c];
					break;
				}
			
				// update the neighbour node,s cost with new values according to heuristics and push in end heap
				var newCost = (weight *heuristics(type,m,n,'e'));
				if (newCost < endcosts[m][n]){
					endcosts[m][n] = newCost;
					endprev[m][n] = [r, c];
					endHeap.push([newCost, [m, n]]);
					cellsToAnimate.push( [[m, n], "searching"] );
				}
		   }
		
			
			
		}
		
	   // If a intersecting node was found, illuminate the two paths and calculate the length of the final path
	 if(intersecting_node !== -1){
		
		pathFound =true;
		
		
		
		var sum =0;
		var r = intersecting_node[0];
		var c = intersecting_node[1];
		cellsToAnimate.push( [[r, c], "success"] );
		
		while (startprev[r][c] != null){
				var a = r, b = c;
				
				var prevCell = startprev[r][c];
				r = prevCell[0];
				c = prevCell[1];
			
				var dx = a-r, dy = b-c;
				sum += Math.sqrt(dx*dx + dy*dy);
				cellsToAnimate.push( [[r, c], "success"] );
			}
		
			r = intersecting_node[0];
			c = intersecting_node[1];
			cellsToAnimate.push( [[r, c], "success"] );
		
		while (endprev[r][c] != null){
				a = r, b = c;
				
				var prevCell = endprev[r][c];
				r = prevCell[0];
				c = prevCell[1];
				var dx = a-r, dy = b-c;
				sum += Math.sqrt(dx*dx + dy*dy);
				cellsToAnimate.push( [[r, c], "success"] );
			}
		length = sum.toFixed(2);
		break;
	}

  
    }
	return pathFound;
}

function Heuristics(type,x1,y1,x2,y2){
	
		var dx = Math.abs(x2 - x1);
	    var dy = Math.abs(y2 - y1);
	
	
  if(type === "manhattan"){
      return (dx + dy);
  }
  if(type === "euclidean"){
      return (Math.sqrt(dx * dx + dy*dy));
  }
  if(type === "octile"){
	var F = Math.SQRT2 - 1;
	console.log("octile distance" + (dx < dy) ? F * dx + dy : F * dy + dx);
	return (dx < dy) ? F * dx + dy : F * dy + dx;
	
  }
  if(type === "chebyshev"){
	 return ( Math.max(dx, dy));
  }
  
}

//Function to implement DEPTH FIRST SEARCH (Recursive)
function DFS(i, j, visited){
	
	//if end cell found, animate as success and return true
	if (i == endCell[0] && j == endCell[1]){
		cellsToAnimate.push( [[i, j], "success"] );
		return true;
	}

	//mark visited nodes as true and animate search
	visited[i][j] = true;
	cellsToAnimate.push( [[i, j], "searching"] );

	//Get neighbours of the cell
	var neighbors = getNeighbours(i, j,diagonalMovement);
	for(var k = 0; k < neighbors.length; k++){
		var m = neighbors[k][0];
		var n = neighbors[k][1];

		//If node hasnot been visited, call DFS again on it 
		if ( visited[m][n] == null){
			var pathFound = DFS(m, n, visited);
			//when path found animate as success
			if ( pathFound ){
				cellsToAnimate.push( [[i, j], "success"] );
				return true;
			} 
		}
	}
	// animate as visited
	cellsToAnimate.push( [[i, j], "visited"] );
	return false;
}


// function to implement JUMP POINT SEARCH
function jumpPointSearch() {
	var pathFound = false;
	var myHeap = new minHeap();
	var prev = actualVisited();
	var distances = createDistances();
	var costs = createDistances();
	var visited = actualVisited();
	var walls = iswall();
	console.log(walls);
	distances[ startCell[0] ][ startCell[1] ] = 0;
	costs[ startCell[0] ][ startCell[1] ] = 0;
	myHeap.push([0, [startCell[0], startCell[1]]]);
	cellsToAnimate.push([[startCell[0], startCell[1]], "searching"]);
	while (!myHeap.isEmpty()){
		var cell = myHeap.getMin();
		var i = cell[1][0];
		var j = cell[1][1];
		if (visited[i][j] != null){ continue; }
		visited[i][j] = true;
		cellsToAnimate.push([[i, j], "visited"]);
		if (i == endCell[0] && j == endCell[1]){
			pathFound = true;
			break;
		}
		var neighbors = pruneNeighbors(i, j, visited, walls);
		console.log(neighbors);
		for (var k = 0; k < neighbors.length; k++){
			var m = neighbors[k][0];
			var n = neighbors[k][1];
			if (visited[m][n] != null){ continue; }
			var newDistance = distances[i][j] + Heuristics( type,m,n,i,j );
			if (newDistance < distances[m][n]){
				distances[m][n] = newDistance;
				prev[m][n] = [i, j];
				cellsToAnimate.push( [[m, n], "searching"] );
			}
			var newCost = distances[i][j] + Heuristics( type,m,n,endCell[0],endCell[1] ); 
			if (newCost < costs[m][n]){
				costs[m][n] = newCost;
				myHeap.push([newCost, [m, n]]);
			}
		}
	}
	
	if (pathFound) {
		var i = endCell[0];
		var j = endCell[1];
		cellsToAnimate.push( [endCell, "success"] );
		while (prev[i][j] != null){
			var prevCell = prev[i][j];
			x = prevCell[0];
			y = prevCell[1];
			// Loop through and illuminate each cell in between [i, j] and [x, y]
			// Horizontal
			if ((i - x) == 0){
				// Move right
				if (j < y){
					for (var k = j; k < y; k++){
						cellsToAnimate.push( [[i, k], "success"] );
					}
				// Move left
				} else {
					for (var k = j; k > y; k--){
						cellsToAnimate.push( [[i, k], "success"] );
					}
				}
			// Vertical
			} else {
				// Move down
				if (i < x){
					for (var k = i; k < x; k++){
						cellsToAnimate.push( [[k, j], "success"] );
					}
				// Move up
				} else {
					for (var k = i; k > x; k--){
						cellsToAnimate.push( [[k, j], "success"] );
					}
				}
			}
			i = prevCell[0];
			j = prevCell[1];
			cellsToAnimate.push( [[i, j], "success"] );
		}
	}
	return pathFound;
}


function pruneNeighbors(i, j, visited, walls){
	var neighbors = [];
	var stored = {};
	// Scan horizontally
	for (var num = 0; num < 2; num++){
		if (!num){
			var direction = "right";
			var increment = 1;
		} else {
			var direction = "left";
			var increment = -1;
		}
		for (var c = j + increment; (c < totalCols) && (c >= 0); c += increment){
			var xy = i + "-" + c;
			if (visited[i][c]){	break; }
			//Check if same row or column as end cell
			if ((endCell[0] == i || endCell[1] == c) && !stored[xy]){
				neighbors.push([i, c]);
				stored[xy] = true;
				continue;
			}
			// Check if dead end
			var deadEnd = !(xy in stored) && ((direction == "left" && (c > 0) && walls[i][c - 1]) || (direction == "right" && c < (totalCols - 1) && walls[i][c + 1]) || (c == totalCols - 1) || (c == 0));  
			if (deadEnd){
				neighbors.push([i, c]);
				stored[xy] = true;
				break;
			}
			//Check for forced neighbors
			var validForcedNeighbor = (direction == "right" && c < (totalCols - 1) && (!walls[i][c + 1])) || (direction == "left" && (c > 0) && (!walls[i][c - 1]));
			if (validForcedNeighbor){
				checkForcedNeighbor(i, c, direction, neighbors, walls, stored);
			}
		}
	}
	// Scan vertically
	for (var num = 0; num < 2; num++){
		if (!num){
			var direction = "down";
			var increment = 1;
		} else {
			var direction = "up";
			var increment = -1;
		}
		for (var r = i + increment; (r < totalRows) && (r >= 0); r += increment){
			var xy = r + "-" + j;
			if (visited[r][j]){	break; }
			if ((endCell[0] == r || endCell[1] == j) && !stored[xy]){
				neighbors.push([r, j]);
				stored[xy] = true;
				continue;
			}
			// Check if dead end
			var deadEnd = !(xy in stored) && ((direction == "up" && (r > 0) && walls[r - 1][j]) || (direction == "down" && r < (totalRows - 1) && walls[r + 1][j]) || (r == totalRows - 1) || (r == 0));  
			if (deadEnd){
				neighbors.push([r, j]);
				stored[xy] = true;
				break;
			}
			//Check for forced neighbors
			var validForcedNeighbor = (direction == "down" && (r < (totalRows - 1)) && (!walls[r + 1][j])) || (direction == "up" && (r > 0) && (!walls[r - 1][j]));
			if (validForcedNeighbor){
				checkForcedNeighbor(r, j, direction, neighbors, walls, stored);
			}
		}
	}
	return neighbors;
}

function checkForcedNeighbor(i, j, direction, neighbors, walls, stored){
	//console.log(JSON.stringify(walls));
	if (direction == "right"){
		var isForcedNeighbor = ((i > 0) && walls[i - 1][j] && (!walls[i - 1][j + 1])) || ((i < (totalRows - 1)) &&  walls[i + 1][j] && (!walls[i + 1][j + 1]));
		var neighbor = [i, j + 1];
	} else if (direction == "left"){
		var isForcedNeighbor = ((i > 0) && walls[i - 1][j] && !walls[i - 1][j - 1]) || ((i < (totalRows - 1)) && walls[i + 1][j] && !walls[i + 1][j - 1]);
		var neighbor = [i, j - 1];
	} else if (direction == "up"){
		var isForcedNeighbor = ((j < (totalCols - 1)) && walls[i][j + 1] && !walls[i - 1][j + 1]) || ((j > 0) && walls[i][j - 1] && !walls[i - 1][j - 1]);
		var neighbor = [i - 1, j];
	} else {
		var isForcedNeighbor = ((j < (totalCols - 1)) && walls[i][j + 1] && !walls[i + 1][j + 1]) || ((j > 0) && walls[i][j - 1] && !walls[i + 1][j - 1]);
		var neighbor = [i + 1, j];
	}
	var xy = neighbor[0] + "-" + neighbor[1];
	if (isForcedNeighbor && !stored[xy]){
		//console.log("Neighbor " + JSON.stringify(neighbor) + " is forced! Adding to neighbors and stored.")
		neighbors.push(neighbor);
		stored[xy] = true;
	} else {
		//console.log("Is not a forced neighbor..");
	}
	//return;
}



// Random  Maze Generator
async function randomMaze(){
	inProgress = true;
	Board(keepWalls = false);
	var visited = actualVisited();
	var walls = makeWalls();
	var cells = [ startCell, endCell ];
	walls [ startCell[0] ][ startCell[1] ] = false;
	walls [ endCell[0] ][ endCell[1] ] = false;
	visited[ startCell[0] ][ startCell[1] ] = true;
	visited[ endCell[0] ][ endCell[1] ] = true;
	//traverses through the cells and makes random cells wall 
	while ( cells.length > 0 ){
		var random = Math.floor(Math.random() * cells.length);
		var randomCell = cells[random];
		cells[random] = cells[cells.length - 1];
		cells.pop();
		var neighbors = getNeighbours(randomCell[0], randomCell[1]);
		if (neighborsThatAreWalls(neighbors, walls) < 2){ continue; }
		walls[ randomCell[0] ][ randomCell[1] ] = false;
		for (var k = 0; k < neighbors.length; k++){
			var i = neighbors[k][0];
			var j = neighbors[k][1];
			if (visited[i][j]){ continue; }
			visited[i][j] = true;
			cells.push([i, j]);
		}
	}
	//Animate cells
	var cells = $("#tableContainer").find("td");
	for (var i = 0; i < totalRows; i++){
		for (var j = 0; j < totalCols; j++){
			if (i == 0 || i == (totalRows - 1) || j == 0 || j == (totalCols - 1) || walls[i][j]){ 
				cellsToAnimate.push([ [i, j], "wall"]); 
			}
		}
	}
	await animateCells();
	inProgress = false;
	return;
}

function makeWalls(){
	var walls = [];
	for (var i = 0; i < totalRows; i++){
		var row = [];
		for (var j = 0; j < totalCols; j++){
			row.push(true);
		}
		walls.push(row);
	}
	return walls;
}

function neighborsThatAreWalls( neighbors, walls ){
	var neighboringWalls = 0;
	for (var k = 0; k < neighbors.length; k++){
		var i = neighbors[k][0];
		var j = neighbors[k][1];
		if (walls[i][j]) { neighboringWalls++; }
	}
	return neighboringWalls;
}

//functions used for animation
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
	
	return new Promise(resolve => resolve(true));
}

// function to chnage the animation speed 
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
			delay = 1;
		}
	}
	console.log("Delay = " + delay);
	return delay;
}
