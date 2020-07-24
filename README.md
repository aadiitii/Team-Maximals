# PathFinder
https://aadiitii.github.io/Team-Maximals/pathfinding_visualizer/

PathFinder helps the mars rover to get to the destination through the shortest path while avoiding obstacles. It uses different algorithms to find the path and shows how they work. The Pathfinder allows the user to set hindrance or generate a random maze for the rover to get through. It has options to restrict the movement of the rover, allow or not allow diagonal movement or crossing corners. Once the algorithm finds the shortest route, it is illuminated in yellow. 

The pathfinder has the option of six different algorithms, A*, Dijkstra, Greedy Best First Search, Breadth-First Search, Depth First Search, Jump Point Search, along with their bidirectional. The bidirectional algorithms find the path from both the directions to meet at an intersection. 

# Path Finding Algorithms

# A* Search Algorithm:
A* Search Algorithm is an Algorithm for Weighted Problems. Unlike other algorithms, this algorithm is aware of the position of the destination and so is able to calculate the cost (distance to destination) for each cell. Similar to Dijkstra's Algorithm, A* Search Algorithm uses a Priority Queue but uses the distance from the starting position + the distance to the destination as the heuristic.


# Dijkstra's Algorithm:
Dijkstra's Algorithm is an Algorithm for Weighted Problems,Initially all nodes have a distance of Infinity, but as nodes are explored, their cost is updated. The algorithm prioritises nodes which are unvisited and have a lower cost to explore, next. In doing so, you find the shortest path. Dijkstra's Algorithm uses a Priority Queue to keep track of the nodes to visit. A distance from 1 cell to another is 1.


# Greedy Best First Search:
Greedy best-first search is an informed algorithm that always selects the path which appears best at that moment. It is the combination of depth-first search and breadth-first search algorithms. It uses the heuristic function and search. At each step, it chooses the most promising node. In the best-first search algorithm, we expand the node which is closest to the goal node and the closest cost is estimated by heuristic function.


# Breadth-First Search: 
Breadth-First Search is an Algorithm for Unweighted Problems which explores all the neighbours at a certain depth before moving on to the children of those neighbours. It uses a Queue to keep track of the next nodes to visit.


# Depth First Search:
Depth First Search is an Algorithm for Unweighted Problems which explores a branch/path as far as possible before moving on to its neighbour. The algorithm starts at the root node (selecting some arbitrary node as the root node in the case of a graph) and explores as far as possible along each branch before backtracking.

# Jump Point Search: 
The JPS algorithm improves on the A* algorithm for uniform-cost grids by exploiting the regularity of the grid. It reduces symmetries in the search procedure by means of graph pruning, eliminating certain nodes in the grid based on assumptions that can be made about the current node's neighbours, as long as certain conditions relating to the grid are satisfied.
