var totalRows = 20;
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
var length = 0;
var bidirectional=true;   // implement a func to set this variable true when that option is clicked
var type ="octile"; //create a func to set the type according to the selected option
var weight = 1;  // update this value according to the weight entered by the user
var diagonalMovement = "Never";
var allowadiagonal = true;

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

$( "#diagonal .dropdown-item").click(function(){
	if ( inProgress ){ update("wait"); return; }
	diagonalMovement = $(this).text();
	UpdateDiagonalMovement();
	console.log("DiagonalMovement has been changd to: " + diagonalMovement);
});


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

// Counts length of successful path
// ************** CHECK IF EUCLIDEAN DIST IS CORRECT OR NOT  *********
 

// to set the var allowadiagonal true when that button is clicked
 //function allowDiagonal(){}
function countLength(){
	return length;
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

// function UpdateDiagonal(){
// 	if (diagonalMovement == "Never"){
// 		diagonalMovement == "Never";
// 	} else if (diagonalMovement== "Always"){
// 		diagonalMovement == "Always";
// 	} else if (diagonalMovement== "When No Obstacle"){
// 		diagonalMovement == "OnlyWhenNoObstacles";
// 	} else if (diagonalMovement== "When Atmost One Obstacle"){
// 		diagonalMovement== "IfAtmostOneObstacle";
// 	}
// 	return;
// }
// UpdateDiagonal();


function executeAlgo(){
	if (algorithm == "Depth-First Search (DFS)"){
		//var visited = createVisited();
		var pathFound = DFS(startCell[0], startCell[1], visited);
	} else
	if (algorithm == "Breadth-First Search (BFS)"){
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


// to make actual visited

function actualVisited(){
	var visited = [];
    var cells = $("#tableContainer").find("td");
   
	for (var i = 0; i < totalRows; i++){
		var row = [];
		for (var j = 0; j < totalCols; j++){  
				row.push(null);        // false changed to null
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

function getNeighbours(i, j, diagonalMovement){
	var neighbours = [];
	var cells = $("#tableContainer").find("td");
	var s0 = null;
	var s1 = null;
	var s2 = null; 
	var s3 = null;
	var d0 = null;
	var d1 = null;
	var d2 = null;
	var d3 = null;

	if ( i > 0 && (i < totalRows -1 )&& !cellIsAWall(i-1,j,cells) ){ 
		//neighbours.push( [i - 1, j] );
		s0=true;
	} //top
	if ( j < (totalCols - 1) && j>0  && !cellIsAWall(i,j+1,cells)){
		 //neighbours.push( [i, j + 1] );
		 s1 = true;
		} //right
	if (i>0 && i < (totalRows - 1)   && !cellIsAWall(i+1,j,cells)){
		 //neighbours.push( [i + 1, j] );
		s2 = true;
		} //bottom
	if ( j > 0 && (j < totalCols-1)  && !cellIsAWall(i,j-1,cells) ){
		 //neighbours.push( [i, j - 1] );
		s3= true;
		} //left

	
	if (diagonalMovement === "OnlyWhenNoObstacles") {
		d0 = s3 && s0;
		d1 = s0 && s1;
		d2 = s1 && s2;
		d3 = s2 && s3;
	} else if (diagonalMovement === "IfAtMostOneObstacle") {
		d0 = s3 || s0;
		d1 = s0 || s1;
		d2 = s1 || s2;
		d3 = s2 || s3;
	} else if (diagonalMovement === "Never") {
		d0 =false;
		d1 = false;
		d2 = false;
		d3 = false;
	} else if (diagonalMovement === "Always") {
		d0 = true;
		d1 = true;
		d2 = true;
		d3 = true;
		
	} else {
		// throw new Error('Incorrect value of diagonalMovement');
		console.log("ERROR in  diagonal movement");
	}

	// ↖
	if (d0 && !cellIsAWall(i - 1, j - 1, cells)) {
		neighbours.push([i- 1,j - 1]);
	}
	if(s0){
		neighbours.push( [i - 1, j] );
	}

	// ↗
	if (d1 && !cellIsAWall(i - 1, j + 1, cells)) {
		neighbours.push([i - 1, j + 1]);
	}

	if(s1){
		neighbours.push( [i, j + 1] );
	}
	// ↘
	if (d2 && !cellIsAWall(i + 1, j + 1, cells)) {
		neighbours.push([i + 1, j + 1]);
	}
	if(s2){
		neighbours.push( [i + 1, j] );
	}
	// ↙
	if (d3 && !cellIsAWall(i + 1, j - 1, cells)) {
		neighbours.push([i + 1, j - 1]);
	}
	if(s3){
		neighbours.push( [i, j - 1] );
	}
	console.log(neighbours);
	return neighbours;
};


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

function heuristics(type,i,j,pos){
	if(pos== 'e'){
		var dx = Math.abs(startCell[0] - i);
	    var dy = Math.abs(startCell[1] - j);
	}
	else if(pos == 's'){
		var dx = Math.abs(endCell[0] - i);
		var dy = Math.abs(endCell[1] - j);
	}
	
  if(type === "manhattan"){
      return (dx + dy);
  }
  if(type === "euclidean"){
      return (Math.sqrt(dx * dx + dy*dy));
  }
  if(type === "octile"){
	var F = Math.SQRT2 - 1;
	return (dx < dy) ? F * dx + dy : F * dy + dx;
  }
  if(type === "chebyshev"){
	 return ( Math.max(dx, dy));
  }
  
}

function BFS(){
	var pathFound = false;
	var myQueue = new Array();
	var prev = createPrev();
	var visited = actualVisited();
	//var arrstorewall = storewalls();
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
		var neighbours = getNeighbours(r, c,diagonalMovement);
		console.log(neighbours);
		for (var k = 0; k < neighbours.length; k++){
			var m = neighbours[k][0];
			var n = neighbours[k][1];
			//if ( visited[m][n] ) { continue ;}
			if ( visited[m][n]!==null) { continue ;}
			visited[m][n] = true;
			prev[m][n] = [r, c];
			cellsToAnimate.push( [neighbours[k], "searching"] );
			myQueue.unshift(neighbours[k]);
		}
	}
	// // Make any nodes still in the queue "visited"
	// while ( myQueue.length > 0){
	// 	var cell = myQueue.pop();
	// 	var r = cell[0];
	// 	var c = cell[1];
	// 	cellsToAnimate.push( [cell, "visited"] );
	// }
	// If a path was found, illuminate it
	if (pathFound) {
		var sum=0;
		var r = endCell[0];
		var c = endCell[1];
		cellsToAnimate.push( [endCell, "success"] );
		while (prev[r][c] != null){
			var a = r,b=c; 
			var prevCell = prev[r][c];
			
			r = prevCell[0];
			c = prevCell[1];
			var dx = a-r,dy = b-c;
			sum+= Math.sqrt(dx*dx +dy*dy);
			cellsToAnimate.push( [[r,c], "success"] );
		}
		length =sum.toFixed(2) ;
	}
	return pathFound;
}

function biBFS(){
    var pathFound = false;
    var s_queue = new Array();  // queue for search
    var t_queue = new Array();
 
    var s_prev = createPrev(); //for parent
    var t_prev = createPrev();
 
    var visited = actualVisited(); // to keep track of visited nodes
   
    var intersecting_node = -1; // initialising
 
    s_queue.unshift( startCell ); // begin from start and end
    t_queue.unshift( endCell ); 
    cellsToAnimate.push(startCell, "searching");  // animation
    cellsToAnimate.push(endCell, "searching");
 
    visited[ startCell[0] ][ startCell[1] ] = 's'; //visited made true
    visited[ endCell[0] ][ endCell[1] ] = 't';
    var intersecting_node =-1;
        while ( s_queue.length > 0 && t_queue.length > 0 ){
		    console.log("loop1");
			
			var s_cell = s_queue.pop();
			var t_cell = t_queue.pop();
			var s_r = s_cell[0];
			var t_r = t_cell[0];
			var s_c = s_cell[1];
			var t_c = t_cell[1];
			cellsToAnimate.push( [s_cell, "visited"] );
			cellsToAnimate.push( [t_cell, "visited"] );
        
 
				// Put neighboring cells in queue
				var s_neighbours = getNeighbours(s_r,s_c,diagonalMovement);
				var t_neighbours = getNeighbours(t_r,t_c,diagonalMovement);
			
			 // neighbours for end or target node
             for (var p = 0; p < t_neighbours.length ; p++){
				console.log("2 neigh loop")
				var m2 = t_neighbours[p][0];
				var n2 = t_neighbours[p][1];
				if (visited[m2][n2] === 't' ) {
					console.log("continue for t");
					 continue ;
				   }else
				if(visited[m2][n2] === null){
					   visited[m2][n2] = 't';
					   t_prev[m2][n2] = [t_r, t_c];
					   console.log("parent of [" + m2 + n2 + "] is" + t_r + t_c); 
					   cellsToAnimate.push( [t_neighbours[p], "searching"] );
					   t_queue.unshift(t_neighbours[p]);
				}else{
					 intersecting_node = [m2,n2];
					 t_prev[m2][n2] = [t_r, t_c];
					 console.log("t_prev of IN"+t_prev[intersecting_node[0]][intersecting_node[1]]);
                       break;
				  }
			   
			   }
            // neighbours of start node
             for (var k = 0; k < s_neighbours.length ; k++){
                 console.log("first for loop");
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
        
         // check for intersecting node
          
		 if(intersecting_node !== -1){
			pathFound =true;
			console.log("intersecting node "+intersecting_node);
		  
		  var sum =0;
		  var r = intersecting_node[0];
		  var c = intersecting_node[1];
		  cellsToAnimate.push( [[r, c], "success"] );
		  
		  while (s_prev[r][c] != null){
			 var a = r, b = c;
			 console.log(" s prev console" + s_prev[r][c]);
			 var prevCell = s_prev[r][c];
			 r = prevCell[0];
			 c = prevCell[1];
			
			var dx = a-r, dy = b-c;
			sum += Math.sqrt(dx*dx + dy*dy);
			 cellsToAnimate.push( [[r, c], "success"] );
			}
		
			r = intersecting_node[0];
			c = intersecting_node[1];
			cellsToAnimate.push( [[r, c], "success"] );
		 
		  if(t_prev[r][c]===null){
			 console.log("t_prev for intersecting node is null");
		   }
		 
		   while (t_prev[r][c] != null){
			 a = r, b = c;
			 console.log("t_prev console" + t_prev[r][c]);
			 var prevCell = t_prev[r][c];
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


function AStar() {
	if (!diagonalMovement) {
		if (!allowDiagonal) {
			diagonalMovement = "Never";
		} else {
			if (dontCrossCorners) {
				diagonalMovement = "OnlyWhenNoObstacles";
			} else {
				diagonalMovement = "IfAtMostOneObstacle";
			}
		}
	}
	
	var pathFound = false;
	var myHeap = new minHeap();
	var prev = createPrev();
	var distances = createDistances();
	var costs = createDistances();
	var visited = actualVisited();

	distances[ startCell[0] ][ startCell[1] ] = 0;
	costs[ startCell[0] ][ startCell[1] ] = 0;
	myHeap.push([0, [startCell[0], startCell[1]]]);
	cellsToAnimate.push([[startCell[0], startCell[1]], "searching"]);
	while (!myHeap.isEmpty()){
		var cell = myHeap.getMin();
		console.log("cell is " + cell);
		var i = cell[1][0];
		var j = cell[1][1];
		// if (visited[i][j]!==null){ continue; }
		if(visited[i][j]===null){
			visited[i][j] = true;
			cellsToAnimate.push([[i, j], "visited"]);
			if (i == endCell[0] && j == endCell[1]){
				pathFound = true;
				break;
			}
			var neighbours = getNeighbours(i, j, diagonalMovement);
			for (var k = 0; k < neighbours.length; k++){
				var m = neighbours[k][0];
				var n = neighbours[k][1];
				console.log("m,n" + m + "," +n); 
				//console.log("visited" + visited[m][n]);
				if (visited[m][n]===null){
					var newDistance = distances[i][j] + (( m-i ===0 || n-j ===0) ? 1 :Math.sqrt(2));
					console.log("distance" + newDistance);
					if (newDistance < distances[m][n]){
						distances[m][n] = newDistance;
						prev[m][n] = [i, j];
						cellsToAnimate.push( [[m, n], "searching"] );
					}
					// manhattan dist used
					var newCost = distances[i][j] + (weight *heuristics(type,m,n,'s'));
					if (newCost < costs[m][n]){
						costs[m][n] = newCost;
						myHeap.push([newCost, [m, n]]);
					}
				}
		}
	}
}

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

function BiAStar() {
	if (!diagonalMovement) {
		if (!allowDiagonal) {
			diagonalMovement = "Never";
		} else {
			if (dontCrossCorners) {
				diagonalMovement = "OnlyWhenNoObstacles";
			} else {
				diagonalMovement = "IfAtMostOneObstacle";
			}
		}
	}
	
	var pathFound = false;
    
    var startHeap = new minHeap();
	var startprev = createPrev();
    var startdistances = createDistances();
	var startcosts = createDistances();
	var endHeap = new minHeap();
	var endprev = createPrev();
    var enddistances = createDistances();
	var endcosts = createDistances();
    var visited = actualVisited();
    var intersecting_node = -1;
    // set the distances nd costs for start cell and end cell =0 and visited as s nd e respectively

    startdistances[ startCell[0] ][ startCell[1] ] = 0;
    startcosts[ startCell[0] ][ startCell[1] ] = 0;
    startHeap.push([0, [startCell[0], startCell[1]]]);
    // visited[startCell[0]][startCell[1]] = 's';
	cellsToAnimate.push([[startCell[0], startCell[1]], "searching"]);
   
    enddistances[ endCell[0] ][ endCell[1] ] = 0;
	endcosts[ endCell[0] ][ endCell[1] ] = 0;
	endHeap.push([0, [endCell[0], endCell[1]]]);
    // visited[endCell[0]][endCell[1]] = 'e';
	cellsToAnimate.push([[endCell[0], endCell[1]], "searching"]);

    while (!startHeap.isEmpty() && !endHeap.isEmpty()){
        console.log("loop1");
        // pop the position of start node which has the minimum cost 
		var s_cell = startHeap.getMin();
		console.log("s_cell is: " + s_cell);
		var i = s_cell[1][0];
		var j = s_cell[1][1];
		if (visited[i][j] == null){ 
			
			visited[i][j] = 's';
			cellsToAnimate.push([[i, j], "visited"]);
			// if (i == endCell[0] && j == endCell[1]){
			// 	pathFound = true;
			// 	break;
			// }
			var start_neighbours = getNeighbours(i, j, diagonalMovement);
			for (var k = 0; k < start_neighbours.length; k++){
				console.log("loop2");
	
				var m = start_neighbours[k][0];
				var n = start_neighbours[k][1];
				if (visited[m][n] ==='s'){
					 continue;
					 }else
				if(visited[m][n]==='e'){
					intersecting_node = [m,n];
					startprev[m][n] = [i,j];
					break;
				}
				// visited[m][n]='s';
				var newDistance = startdistances[i][j]+  (( m-i ===0 || n-j ===0) ? 1 :Math.sqrt(2));
				if (newDistance < startdistances[m][n]){
					startdistances[m][n] = newDistance;
					startprev[m][n] = [i, j];
					cellsToAnimate.push( [[m, n], "searching"] );
				}
				// manhattan dist used
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
				console.log("loop3");
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
				// visited[m][n]='s';
				var newDistance = enddistances[r][c] + (( m-r ===0 || n-c ===0) ? 1 :Math.sqrt(2));
				if (newDistance < enddistances[m][n]){
					enddistances[m][n] = newDistance;
					endprev[m][n] = [r, c];
					cellsToAnimate.push( [[m, n], "searching"] );
				}
				// manhattan dist used
				var newCost = enddistances[r][c] + (weight *heuristics(type,m,n,'e'));
				if (newCost < endcosts[m][n]){
					endcosts[m][n] = newCost;
					endHeap.push([newCost, [m, n]]);
				}
		   }
		
			
			
		}
		
	   // If a intersecting node was found, illuminate the two paths
	   if(intersecting_node !== -1){
		pathFound =true;
		console.log("intersecting node "+intersecting_node);
	  
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
	 
	  if(endprev[r][c]===null){
		 console.log("t_prev for intersecting node is null");
	   }
	 
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


function dijkstra() {
	if (!diagonalMovement) {
		if (!allowDiagonal) {
			diagonalMovement = "Never";
		} else {
			if (dontCrossCorners) {
				diagonalMovement = "OnlyWhenNoObstacles";
			} else {
				diagonalMovement = "IfAtMostOneObstacle";
			}
		}
	}
	var pathFound = false;
	var myHeap = new minHeap();
	var prev = createPrev();
	var distances = createDistances();
	var visited = actualVisited();
	distances[ startCell[0] ][ startCell[1] ] = 0;
	myHeap.push([0, [startCell[0], startCell[1]]]);
	cellsToAnimate.push([[startCell[0], startCell[1]], "searching"]);
	while (!myHeap.isEmpty()){
		var cell = myHeap.getMin();
		//console.log("Min was just popped from the heap! Heap is now: " + JSON.stringify(myHeap.heap));
		var i = cell[1][0];
		var j = cell[1][1];
		if (visited[i][j] === null){
		visited[i][j] = true;
		cellsToAnimate.push([[i, j], "visited"]);
		if (i == endCell[0] && j == endCell[1]){
			pathFound = true;
			break;
		}
		var neighbours = getNeighbours(i, j, diagonalMovement);
		for (var k = 0; k < neighbours.length; k++){
			var m = neighbours[k][0];
			var n = neighbours[k][1];
			if (visited[m][n] === null){
			var newDistance = distances[i][j] + (( m-i ===0 || n-j ===0) ? 1 :Math.sqrt(2));
			if (newDistance < distances[m][n]){
				distances[m][n] = newDistance;
				prev[m][n] = [i, j];
				myHeap.push([newDistance, [m, n]]);
				//console.log("New cell was added to the heap! It has distance = " + newDistance + ". Heap = " + JSON.stringify(myHeap.heap));
				cellsToAnimate.push( [[m, n], "searching"] );
			}
		}
	}
	}
	}


	// Path animation
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

function Bidijkstra(){
	
	var pathFound = false;
    
    var startHeap = new minHeap();
	var startprev = createPrev();
    var startdistances = createDistances();
	
	var endHeap = new minHeap();
	var endprev = createPrev();
    var enddistances = createDistances();

    var visited = actualVisited();
    var intersecting_node = -1;
    // set the distances nd costs for start cell and end cell =0 and visited as s nd e respectively

    startdistances[ startCell[0] ][ startCell[1] ] = 0;
    startHeap.push([0, [startCell[0], startCell[1]]]);
    cellsToAnimate.push([[startCell[0], startCell[1]], "searching"]);
   
    enddistances[ endCell[0] ][ endCell[1] ] = 0;
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
			
			visited[i][j] = 's';
			cellsToAnimate.push([[i, j], "visited"]);
			// if (i == endCell[0] && j == endCell[1]){
			// 	pathFound = true;
			// 	break;
			// }
			var start_neighbours = getNeighbours(i, j, diagonalMovement);
			for (var k = 0; k < start_neighbours.length; k++){
				console.log("loop2");
	
				var m = start_neighbours[k][0];
				var n = start_neighbours[k][1];
				if (visited[m][n] ==='s'){
					 continue;
					 }else
				if(visited[m][n]==='e'){
					intersecting_node = [m,n];
					startprev[m][n] = [i,j];
					break;
				}
				// visited[m][n]='s';
				var newDistance = startdistances[i][j] + (( m-i ===0 || n-j ===0) ? 1 :Math.sqrt(2));//check for root2 
				if (newDistance < startdistances[m][n]){
					startdistances[m][n] = newDistance;
					startprev[m][n] = [i, j];
					startHeap.push([newDistance, [m, n]]);
					cellsToAnimate.push( [[m, n], "searching"] );
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
				console.log("loop3");
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
				// visited[m][n]='s';
				var newDistance = enddistances[r][c] + (( m-r ===0 || n-c ===0) ? 1 :Math.sqrt(2));//check for root2 
				if (newDistance < enddistances[m][n]){
					enddistances[m][n] = newDistance;
					endprev[m][n] = [r, c];
					endHeap.push([newDistance, [m, n]]);
					cellsToAnimate.push( [[m, n], "searching"] );
				}
		   }
		
			
			
		}
		
	   // If a intersecting node was found, illuminate the two paths
	   if(intersecting_node !== -1){
		pathFound =true;
		console.log("intersecting node "+intersecting_node);
	  
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
	 
	  if(endprev[r][c]===null){
		 console.log("t_prev for intersecting node is null");
	   }
	 
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
    	
		// Make any nodes still in the heap "visited"
		// while ( !myHeap.isEmpty() ){
		// 	var cell = myHeap.getMin();
		// 	var i = cell[1][0];
		// 	var j = cell[1][1];
		// 	if (visited[i][j] !==null){ continue; }
		// 	visited[i][j] = true;
		// 	cellsToAnimate.push( [[i, j], "visited"] );
		// }

  
    }
    


    
	return pathFound;
}

function greedyBestFirstSearch() {
	var pathFound = false;
	var myHeap = new minHeap();
	var prev = createPrev();
	var costs = createDistances();
	var visited = actualVisited();
	costs[ startCell[0] ][ startCell[1] ] = 0;
	myHeap.push([0, [startCell[0], startCell[1]]]);
	cellsToAnimate.push([[startCell[0], startCell[1]], "searching"]);
	while (!myHeap.isEmpty()){
		var cell = myHeap.getMin();
		var i = cell[1][0];
		var j = cell[1][1];
		if (visited[i][j]){ continue; }
		visited[i][j] = true;
		cellsToAnimate.push([[i, j], "visited"]);
		if (i == endCell[0] && j == endCell[1]){
			pathFound = true;
			break;
		}
		var neighbours = getNeighbours(i, j, diagonalMovement);
		for (var k = 0; k < neighbours.length; k++){
			var m = neighbours[k][0];
			var n = neighbours[k][1];
			if (visited[m][n]){ continue; }
			var newCost = ( weight *heuristics(type,m,n,'s'));
			if (newCost < costs[m][n]){
				prev[m][n] = [i, j];
				costs[m][n] = newCost;
				myHeap.push([newCost, [m, n]]);
				cellsToAnimate.push([[m, n], "searching"]);
			}
		}
	}

	// If a path was found, illuminate it
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

function BigreedyBestFirstSearch(){
	
	var pathFound = false;
    
    var startHeap = new minHeap();
	var startprev = createPrev();
    var startcosts = createDistances();
	
	var endHeap = new minHeap();
	var endprev = createPrev();
    var endcosts = createDistances();

    var visited = actualVisited();
    var intersecting_node = -1;
    // set the distances nd costs for start cell and end cell =0 and visited as s nd e respectively

    startcosts[ startCell[0] ][ startCell[1] ] = 0;
    startHeap.push([0, [startCell[0], startCell[1]]]);
    cellsToAnimate.push([[startCell[0], startCell[1]], "searching"]);
   
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
			
			visited[i][j] = 's';
			cellsToAnimate.push([[i, j], "visited"]);

			var start_neighbours = getNeighbours(i, j, diagonalMovement);
			for (var k = 0; k < start_neighbours.length; k++){
				console.log("loop2");
	
				var m = start_neighbours[k][0];
				var n = start_neighbours[k][1];
				if (visited[m][n] ==='s'){
					 continue;
					 }else
				if(visited[m][n]==='e'){
					intersecting_node = [m,n];
					startprev[m][n] = [i,j];
					break;
				}
				// visited[m][n]='s';
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
			visited[r][c] = 'e';
			cellsToAnimate.push([[r, c], "visited"]);
			if (r == startCell[0] && c == startCell[1]){
				pathFound = true;
				break;
			}
			var end_neighbours = getNeighbours(r, c, diagonalMovement);
			for (var k = 0; k < end_neighbours.length; k++){
				console.log("loop3");
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
				// visited[m][n]='s';
				var newCost = (weight *heuristics(type,m,n,'e'));
				if (newCost < endcosts[m][n]){
					endcosts[m][n] = newCost;
					endprev[m][n] = [r, c];
					endHeap.push([newCost, [m, n]]);
					cellsToAnimate.push( [[m, n], "searching"] );
				}
		   }
		
			
			
		}
		
	   // If a intersecting node was found, illuminate the two paths
	   if(intersecting_node !== -1){
		pathFound =true;
		console.log("intersecting node "+intersecting_node);
	  
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
	 
	  if(endprev[r][c]===null){
		 console.log("t_prev for intersecting node is null");
	   }
	 
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
