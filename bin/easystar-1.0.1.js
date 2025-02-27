var EasyStar;
/******/(()=>{// webpackBootstrap
/******/var __webpack_modules__={
/***/824:
/***/(module,__unused_webpack_exports,__webpack_require__)=>{
/* eslint-disable no-param-reassign */
var Heap=__webpack_require__(416),Instance=__webpack_require__(296),Node=__webpack_require__(543),Heuristics=__webpack_require__(272),_require=__webpack_require__(528),calculateDirection=_require.calculateDirection,STOP=_require.STOP,TOP=_require.TOP,TOP_RIGHT=_require.TOP_RIGHT,RIGHT=_require.RIGHT,BOTTOM_RIGHT=_require.BOTTOM_RIGHT,BOTTOM=_require.BOTTOM,BOTTOM_LEFT=_require.BOTTOM_LEFT,LEFT=_require.LEFT,TOP_LEFT=_require.TOP_LEFT,compressPath=_require.compressPath,smoothenPath=_require.smoothenPath,expandPath=_require.expandPath,interpolate=_require.interpolate,nextInstanceId=1;module.exports={EasyStar:function(){var collisionGrid,X,Y,iterationsSoFar,acceptableTiles,DIAGONAL_COST=Math.SQRT2,syncEnabled=!1,pointsToAvoid={},costMap={},pointsToCost={},directionalConditions={},allowCornerCutting=!0,instances={},instanceQueue=[],iterationsPerCalculation=Number.MAX_VALUE,diagonalsEnabled=!1,torusEnabled=!1,turnPenalty=0,heuristicsFactor=1,orthogonalHeuristic=Heuristics.manhattan,diagonalHeuristic=Heuristics.octile,directionCosts=[[1,1,1],[1,0,1],[1,1,1]];
/**
   * Sets the collision grid that EasyStar uses.
   *
   * @param {Array|Number} tiles An array of numbers that represent
   * which tiles in your grid should be considered
   * acceptable, or "walkable".
   * */
this.setAcceptableTiles=function(tiles){tiles instanceof Array?
// Array
acceptableTiles=tiles:!Number.isNaN(parseFloat(tiles))&&Number.isFinite(tiles)&&(
// Number
acceptableTiles=[tiles])},
/**
   * Enables sync mode for this EasyStar instance..
   * if you're into that sort of thing.
   * */
this.enableSync=function(){syncEnabled=!0},
/**
   * Disables sync mode for this EasyStar instance.
   * */
this.disableSync=function(){syncEnabled=!1},
/**
   * Enable diagonal pathfinding.
   */
this.enableDiagonals=function(){diagonalsEnabled=!0},
/**
   * Disable diagonal pathfinding.
   */
this.disableDiagonals=function(){diagonalsEnabled=!1},
/**
   * If enabled, map will be treated as a torus (wrapped map)
   */
this.enableTorus=function(){torusEnabled=!0},
/**
   * If enabled, map will be treated as a torus (wrapped map)
   */
this.disableTorus=function(){torusEnabled=!1},
/**
   * Sets the collision grid that EasyStar uses.
   *
   * @param {Array} grid The collision grid that this EasyStar instance will read from.
   * This should be a 2D Array of Numbers.
   * */
this.setGrid=function(grid){collisionGrid=grid,X=grid[0].length,Y=grid.length;
// Setup cost map
for(var y=0;y<Y;y++)for(var x=0;x<X;x++)costMap[collisionGrid[y][x]]||(costMap[collisionGrid[y][x]]=1)},
/**
   * Sets the tile cost for a particular tile type.
   *
   * @param {Number} tileType The tile type to set the cost for.
   * @param {Number} cost The multiplicative cost associated with the given tile.
   * */
this.setTileCost=function(tileType,cost){costMap[tileType]=cost},
/**
   * Sets the additional cost for a particular point.
   * Overrides the cost from setTileCost.
   *
   * @param {Number} x The x value of the point to cost.
   * @param {Number} y The y value of the point to cost.
   * @param {Number} cost The multiplicative cost associated with the given point.
   * */
this.setAdditionalPointCost=function(x,y,cost){void 0===pointsToCost[y]&&(pointsToCost[y]={}),pointsToCost[y][x]=cost},
/**
   * Remove the additional cost for a particular point.
   *
   * @param {Number} x The x value of the point to stop costing.
   * @param {Number} y The y value of the point to stop costing.
   * */
this.removeAdditionalPointCost=function(x,y){void 0!==pointsToCost[y]&&delete pointsToCost[y][x]},
/**
   * Remove all additional point costs.
   * */
this.removeAllAdditionalPointCosts=function(){pointsToCost={}},
/**
   * Sets a directional condition on a tile
   *
   * @param {Number} x The x value of the point.
   * @param {Number} y The y value of the point.
   * @param {Array.<String>} allowedDirections A list of all the allowed directions that can access
   * the tile.
   * */
this.setDirectionalCondition=function(x,y,allowedDirections){void 0===directionalConditions[y]&&(directionalConditions[y]={}),directionalConditions[y][x]=allowedDirections.map((function(c){return 0|c})).reduce((function(p,c){return p|c}),0)},
/**
   * Remove all directional conditions
   * */
this.removeAllDirectionalConditions=function(){directionalConditions={}},
/**
   * Sets the number of search iterations per calculation.
   * A lower number provides a slower result, but more practical if you
   * have a large tile-map and don't want to block your thread while
   * finding a path.
   *
   * @param {Number} iterations The number of searches to prefrom per calculate() call.
   * */
this.setIterationsPerCalculation=function(iterations){iterationsPerCalculation=iterations},
/**
   * Set heuristic function for calculating node distance
   * @param {Function} orthogonal Function for calculating the orthogonal node distance.
   * @param {Function} diagonal  Function for calculating the diagonal node distance.
   */
this.setHeuristics=function(orthogonal,diagonal){orthogonalHeuristic=orthogonal||Heuristics.manhattan,diagonalHeuristic=diagonal||Heuristics.euclidean},
/**
   * Set costs for different directions
   * @param {Array<Array<number>>} costs Two dimensional array with direction costs. Example:
   * [1.0, 1.0, 1.0],
   * [1.0,   0, 1.0],
   * [1.0, 1.0, 1.0],
   */
this.setDirectionCosts=function(costs){directionCosts=costs||directionCosts},
/**
   * Avoid a particular point on the grid,
   * regardless of whether it is an acceptable tile.
   *
   * @param {Number} x The x value of the point to avoid.
   * @param {Number} y The y value of the point to avoid.
   * */
this.avoidAdditionalPoint=function(x,y){void 0===pointsToAvoid[y]&&(pointsToAvoid[y]={}),pointsToAvoid[y][x]=1},
/**
   * Stop avoiding a particular point on the grid.
   *
   * @param {Number} x The x value of the point to stop avoiding.
   * @param {Number} y The y value of the point to stop avoiding.
   * */
this.stopAvoidingAdditionalPoint=function(x,y){void 0!==pointsToAvoid[y]&&delete pointsToAvoid[y][x]},
/**
   * Enables corner cutting in diagonal movement.
   * */
this.enableCornerCutting=function(){allowCornerCutting=!0},
/**
   * Disables corner cutting in diagonal movement.
   * */
this.disableCornerCutting=function(){allowCornerCutting=!1},
/**
   * Stop avoiding all additional points on the grid.
   * */
this.stopAvoidingAllAdditionalPoints=function(){pointsToAvoid={}},
/**
   * Sets the multiplier determining the importance of the manhattan heuristics
   * @param {Number} factor
   * */
this.setHeuristicsFactor=function(factor){heuristicsFactor=factor},
/**
   * Sets the added cost for making a turn
   * Higer value means less turns
   * @param {Number} penalty
   * */
this.setTurnPenalty=function(penalty){turnPenalty=penalty};
/**
   * Wrap x coordinate if torus enabled
   * @param {Number} x
   */
var normalizeX=function(x){return torusEnabled?(x+X)%X:x},normalizeY=function(y){return torusEnabled?(y+Y)%Y:y},isTileWalkable=function(collisionGrid,acceptableTiles,x,y,sourceNode){var directionalCondition=directionalConditions[y]&&directionalConditions[y][x];if(void 0!==directionalCondition)
// eslint-disable-next-line no-bitwise
return(calculateDirection(X,Y,sourceNode.x-x,sourceNode.y-y,torusEnabled)&directionalCondition)>0;var nX=normalizeX(x),nY=normalizeY(y);return-1!==acceptableTiles.indexOf(collisionGrid[nY][nX])},getTileCost=function(x,y){var nX=normalizeX(x),nY=normalizeY(y);return pointsToCost[nY]&&pointsToCost[nY][nX]||costMap[collisionGrid[nY][nX]]},getDirectionCost=function(dx,dy){return directionCosts[1+dy][1+dx]},coordinateToNode=function(instance,x,y,parent,cost){if(void 0!==instance.nodeHash[y]){if(void 0!==instance.nodeHash[y][x])return instance.nodeHash[y][x]}else instance.nodeHash[y]={};var x1,y1,x2,y2,dx,dy,costSoFar,simpleDistanceToTarget=(x1=x,y1=y,x2=instance.endX,y2=instance.endY,dx=Math.abs(x1-x2),dy=Math.abs(y1-y2),
// Torus version
torusEnabled&&(dx=Math.min(dx,x1-x2+X,x2-x1+X),dy=Math.min(dy,y1-y2+Y,y2-y1+Y)),diagonalsEnabled?heuristicsFactor*diagonalHeuristic(dx,dy):heuristicsFactor*orthogonalHeuristic(dx,dy)),directionFromParent=STOP,turnPenaltyCost=0;null!==parent?(directionFromParent=calculateDirection(X,Y,x-parent.x,y-parent.y,torusEnabled),parent.directionFromParent!==directionFromParent&&(turnPenaltyCost=turnPenalty),costSoFar=parent.costSoFar+cost+turnPenaltyCost):costSoFar=0;var node=new Node(parent,x,y,costSoFar,simpleDistanceToTarget,directionFromParent);return instance.nodeHash[y][x]=node,node},checkAdjacentNode=function(instance,searchNode,x,y,cost){var adjacentCoordinateX=normalizeX(searchNode.x+x),adjacentCoordinateY=normalizeY(searchNode.y+y);if((void 0===pointsToAvoid[adjacentCoordinateY]||void 0===pointsToAvoid[adjacentCoordinateY][adjacentCoordinateX])&&isTileWalkable(collisionGrid,acceptableTiles,adjacentCoordinateX,adjacentCoordinateY,searchNode)){var node=coordinateToNode(instance,adjacentCoordinateX,adjacentCoordinateY,searchNode,cost);void 0===node.list?(node.list=1,instance.openList.push(node)):searchNode.costSoFar+cost<node.costSoFar&&(node.costSoFar=searchNode.costSoFar+cost,node.parent=searchNode,instance.openList.updateItem(node))}};
/**
   * Wrap y coordinate if torus enabled
   * @param {Number} y
   */
/**
   * Find a path.
   *
   * @param {Number} _startX The X position of the starting point.
   * @param {Number} _startY The Y position of the starting point.
   * @param {Number} _endX The X position of the ending point.
   * @param {Number} _endY The Y position of the ending point.
   * @param {Function} callback A function that is called when your path
   * is found, or no path is found.
   * @return {Number} A numeric, non-zero value which identifies the created instance. This value can be passed to cancelPath to cancel the path calculation.
   *
   * */
this.findPath=function(_startX,_startY,_endX,_endY,callback){var startX=normalizeX(_startX),startY=normalizeY(_startY),endX=normalizeX(_endX),endY=normalizeY(_endY),callbackWrapper=function(result){syncEnabled?callback(result):setTimeout((function(){callback(result)}))};
// No acceptable tiles were set
if(void 0===acceptableTiles)throw new Error("You can't set a path without first calling setAcceptableTiles() on EasyStar.");
// No grid was set
if(void 0===collisionGrid)throw new Error("You can't set a path without first calling setGrid() on EasyStar.");
// Start or endpoint outside of scope.
if(startX<0||startY<0||endX<0||endY<0||startX>X-1||startY>Y-1||endX>X-1||endY>Y-1)throw new Error("Your start or end point is outside the scope of your grid.");
// Start and end are the same tile.
if(startX!==endX||startY!==endY){for(
// End point is not an acceptable tile.
var endTile=collisionGrid[endY][endX],isAcceptable=!1,i=0;i<acceptableTiles.length;i++)if(endTile===acceptableTiles[i]){isAcceptable=!0;break}if(!1!==isAcceptable){
// Create the instance
var instance=new Instance;instance.openList=new Heap((function(nodeA,nodeB){return nodeA.bestGuessDistance()-nodeB.bestGuessDistance()})),instance.isDoneCalculating=!1,instance.nodeHash={},instance.startX=startX,instance.startY=startY,instance.endX=endX,instance.endY=endY,instance.callback=callbackWrapper,instance.openList.push(coordinateToNode(instance,instance.startX,instance.startY,null,1));var instanceId=nextInstanceId++;return instances[instanceId]=instance,instanceQueue.push(instanceId),instanceId}callbackWrapper(null)}else callbackWrapper([{x:startX,y:startY}])},
/**
   * Cancel a path calculation.
   *
   * @param {Number} instanceId The instance ID of the path being calculated
   * @return {Boolean} True if an instance was found and cancelled.
   *
   * */
this.cancelPath=function(instanceId){return instanceId in instances&&(delete instances[instanceId],!0)},
/**
   * This method steps through the A* Algorithm in an attempt to
   * find your path(s). It will search 4-8 tiles (depending on diagonals) for every calculation.
   * You can change the number of calculations done in a call by using
   * easystar.setIteratonsPerCalculation().
   * */
this.calculate=function(){if(0!==instanceQueue.length&&void 0!==collisionGrid&&void 0!==acceptableTiles)for(iterationsSoFar=0;iterationsSoFar<iterationsPerCalculation;iterationsSoFar++){if(0===instanceQueue.length)return;syncEnabled&&(
// If this is a sync instance, we want to make sure that it calculates synchronously.
iterationsSoFar=0);var instanceId=instanceQueue[0],instance=instances[instanceId];if(void 0!==instance)
// Couldn't find a path.
if(0!==instance.openList.size()){var searchNode=instance.openList.pop();
// Handles the case where we have found the destination
if(instance.endX!==searchNode.x||instance.endY!==searchNode.y){if(searchNode.list=0,searchNode.y>0||torusEnabled){var directionCost=getDirectionCost(0,-1);checkAdjacentNode(instance,searchNode,0,-1,1*directionCost*getTileCost(searchNode.x,searchNode.y-1))}if(searchNode.x<X-1||torusEnabled){var _directionCost=getDirectionCost(1,0);checkAdjacentNode(instance,searchNode,1,0,1*_directionCost*getTileCost(searchNode.x+1,searchNode.y))}if(searchNode.y<Y-1||torusEnabled){var _directionCost2=getDirectionCost(0,1);checkAdjacentNode(instance,searchNode,0,1,1*_directionCost2*getTileCost(searchNode.x,searchNode.y+1))}if(searchNode.x>0||torusEnabled){var _directionCost3=getDirectionCost(-1,0);checkAdjacentNode(instance,searchNode,-1,0,1*_directionCost3*getTileCost(searchNode.x-1,searchNode.y))}if(diagonalsEnabled){if((searchNode.x>0&&searchNode.y>0||torusEnabled)&&(allowCornerCutting||isTileWalkable(collisionGrid,acceptableTiles,searchNode.x,searchNode.y-1,searchNode)&&isTileWalkable(collisionGrid,acceptableTiles,searchNode.x-1,searchNode.y,searchNode))){var _directionCost4=getDirectionCost(-1,-1);checkAdjacentNode(instance,searchNode,-1,-1,DIAGONAL_COST*_directionCost4*getTileCost(searchNode.x-1,searchNode.y-1))}if((searchNode.x<X-1&&searchNode.y<Y-1||torusEnabled)&&(allowCornerCutting||isTileWalkable(collisionGrid,acceptableTiles,searchNode.x,searchNode.y+1,searchNode)&&isTileWalkable(collisionGrid,acceptableTiles,searchNode.x+1,searchNode.y,searchNode))){var _directionCost5=getDirectionCost(1,1);checkAdjacentNode(instance,searchNode,1,1,DIAGONAL_COST*_directionCost5*getTileCost(searchNode.x+1,searchNode.y+1))}if((searchNode.x<X-1&&searchNode.y>0||torusEnabled)&&(allowCornerCutting||isTileWalkable(collisionGrid,acceptableTiles,searchNode.x,searchNode.y-1,searchNode)&&isTileWalkable(collisionGrid,acceptableTiles,searchNode.x+1,searchNode.y,searchNode))){var _directionCost6=getDirectionCost(1,-1);checkAdjacentNode(instance,searchNode,1,-1,DIAGONAL_COST*_directionCost6*getTileCost(searchNode.x+1,searchNode.y-1))}if((searchNode.x>0&&searchNode.y<Y-1||torusEnabled)&&(allowCornerCutting||isTileWalkable(collisionGrid,acceptableTiles,searchNode.x,searchNode.y+1,searchNode)&&isTileWalkable(collisionGrid,acceptableTiles,searchNode.x-1,searchNode.y,searchNode))){var _directionCost7=getDirectionCost(-1,1);checkAdjacentNode(instance,searchNode,-1,1,DIAGONAL_COST*_directionCost7*getTileCost(searchNode.x-1,searchNode.y+1))}}}else{var path=[];path.push({x:searchNode.x,y:searchNode.y});for(var parent=searchNode.parent;null!=parent;)path.push({x:parent.x,y:parent.y}),parent=parent.parent;path.reverse(),instance.callback(path),delete instances[instanceId],instanceQueue.shift()}}else instance.callback(null),delete instances[instanceId],instanceQueue.shift();else
// This instance was cancelled
instanceQueue.shift()}}},STOP,TOP,TOP_RIGHT,RIGHT,BOTTOM_RIGHT,BOTTOM,BOTTOM_LEFT,LEFT,TOP_LEFT,Heuristics,calculateDirection,compressPath,smoothenPath,expandPath,interpolate}}
/***/,
/***/272:
/***/module=>{
/**
 * @description A collection of heuristic functions.
 */
module.exports={
/**
   * Manhattan distance.
   * @param {number} dx - Difference in x.
   * @param {number} dy - Difference in y.
   * @return {number} dx + dy
   */
manhattan:function(dx,dy){return dx+dy},
/**
   * Euclidean distance.
   * @param {number} dx - Difference in x.
   * @param {number} dy - Difference in y.
   * @return {number} sqrt(dx * dx + dy * dy)
   */
euclidean:function(dx,dy){return Math.sqrt(dx*dx+dy*dy)},
/**
   * Octile distance.
   * @param {number} dx - Difference in x.
   * @param {number} dy - Difference in y.
   * @return {number} sqrt(dx * dx + dy * dy) for grids
   */
octile:function(dx,dy){var F=Math.SQRT2-1;return dx<dy?F*dx+dy:F*dy+dx},
/**
   * Chebyshev distance.
   * @param {number} dx - Difference in x.
   * @param {number} dy - Difference in y.
   * @return {number} max(dx, dy)
   */
chebyshev:function(dx,dy){return Math.max(dx,dy)}};
/***/},
/***/296:
/***/module=>{
/**
 * Represents a single instance of EasyStar.
 * A path that is in the queue to eventually be found.
 */
module.exports=function(){this.pointsToAvoid={},this.startX=void 0,this.callback=void 0,this.startY=void 0,this.endX=void 0,this.endY=void 0,this.nodeHash={},this.openList=void 0};
/***/},
/***/543:
/***/module=>{
/**
 * A simple Node that represents a single tile on the grid.
 * @param {Object} parent The parent node.
 * @param {Number} x The x position on the grid.
 * @param {Number} y The y position on the grid.
 * @param {Number} costSoFar How far this node is in moves*cost from the start.
 * @param {Number} simpleDistanceToTarget Manhatten distance to the end point.
 * @param {String} directionFromParent
 * */
function Node(parent,x,y,costSoFar,simpleDistanceToTarget,directionFromParent){this.parent=parent,this.x=x,this.y=y,this.costSoFar=costSoFar,this.simpleDistanceToTarget=simpleDistanceToTarget,this.directionFromParent=directionFromParent}
/**
 * @return {Number} Best guess distance of a cost using this node.
 * */Node.prototype.bestGuessDistance=function(){return this.costSoFar+this.simpleDistanceToTarget},module.exports=Node}
/***/,
/***/528:
/***/module=>{function _toConsumableArray(arr){return function(arr){if(Array.isArray(arr))return _arrayLikeToArray(arr)}(arr)||function(iter){if("undefined"!=typeof Symbol&&null!=iter[Symbol.iterator]||null!=iter["@@iterator"])return Array.from(iter)}(arr)||function(o,minLen){if(!o)return;if("string"==typeof o)return _arrayLikeToArray(o,minLen);var n=Object.prototype.toString.call(o).slice(8,-1);"Object"===n&&o.constructor&&(n=o.constructor.name);if("Map"===n||"Set"===n)return Array.from(o);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return _arrayLikeToArray(o,minLen)}(arr)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function _arrayLikeToArray(arr,len){(null==len||len>arr.length)&&(len=arr.length);for(var i=0,arr2=new Array(len);i<len;i++)arr2[i]=arr[i];return arr2}
/**
 * Given the start and end coordinates, return all the coordinates lying
 * on the line formed by these coordinates, based on Bresenham's algorithm.
 * http://en.wikipedia.org/wiki/Bresenham's_line_algorithm#Simplification
 * @param {number} x0 Start x coordinate
 * @param {number} y0 Start y coordinate
 * @param {number} x1 End x coordinate
 * @param {number} y1 End y coordinate
 * @return {Array<{x: number, y: number}>} The coordinates on the line
 */
function interpolate(x0,y0,x1,y1){var err,e2,x=x0,y=y0,abs=Math.abs,line=[],dx=abs(x1-x),dy=abs(y1-y),sx=x<x1?1:-1,sy=y<y1?1:-1;for(err=dx-dy;line.push({x,y}),x!==x1||y!==y1;)(e2=2*err)>-dy&&(err-=dy,x+=sx),e2<dx&&(err+=dx,y+=sy);return line}
/**
 * Given a compressed path, return a new path that has all the segments
 * in it interpolated.
 * @param {Array<{x: number, y: number}>} path The path
 * @return {Array<{x: number, y: number}>}>} expanded path
 */module.exports={STOP:0,TOP:1,TOP_RIGHT:2,RIGHT:4,BOTTOM_RIGHT:8,BOTTOM:16,BOTTOM_LEFT:32,LEFT:64,TOP_LEFT:128,calculateDirection:
/**
 * -1, -1 | 0, -1  | 1, -1
 * -1,  0 | SOURCE | 1,  0
 * -1,  1 | 0,  1  | 1,  1
 @param {number} X width of map
 @param {number} Y heogth of map
 @param {number} deltaX diff on x-axis
 @param {number} deltaY diff on y-axis
 @param {boolean} torusEnabled if enabled, map will be treated as a torus (wrapped map)
 @return {number} Direction
 */
function(X,Y,deltaX,deltaY,torusEnabled){var test=function(coord,limit,diff){return coord===diff||torusEnabled&&(1-limit)*coord===diff},testX=function(x){return test(x,X,deltaX)},testY=function(y){return test(y,Y,deltaY)};return testX(0)&&testY(-1)?1:testX(1)&&testY(-1)?2:testX(1)&&testY(0)?4:testX(1)&&testY(1)?8:testX(0)&&testY(1)?16:testX(-1)&&testY(1)?32:testX(-1)&&testY(0)?64:testX(-1)&&testY(-1)?128:0===deltaX&&0===deltaY?0:0===deltaX?deltaY>0?16:1:0===deltaY?deltaX>0?4:64:deltaY>0?deltaX>0?8:32:deltaX>0?2:128},interpolate,expandPath:function(path){var coord0,coord1,interpolated,interpolatedLen,i,j,expanded=[],len=path.length;if(len<2)return expanded;for(i=0;i<len-1;++i)for(coord0=path[i],coord1=path[i+1],interpolatedLen=(interpolated=interpolate(coord0.x,coord0.y,coord1.x,coord1.y)).length,j=0;j<interpolatedLen-1;++j)expanded.push(interpolated[j]);return expanded.push(path[len-1]),expanded}
/**
 * Smoothen the give path.
 * The original path will not be modified; a new path will be returned.
 * @param {Array<Array<number>>} grid
 * @param {Array<{x: number, y: number}>} path The path
 * @param {Array<number>} walkable Walkable ids
 * @param {boolean} diagonalsEnabled Is diagonal movements enabled
 */
// TODO enableDiagonals
,smoothenPath:function(grid,path,walkable,diagonalsEnabled){for(var newPath=_toConsumableArray(path),i=1;i<newPath.length-1;i++)for(var _newPath=newPath[i-1],x1=_newPath.x,y1=_newPath.y,_newPath$i=newPath[i],x2=_newPath$i.x,y2=_newPath$i.y,dx=x2-x1,dy=y2-y1,testCoord={x:x2+dx,y:y2+dy},j=i+2;j<newPath.length;j++){var current=newPath[j],curDx=testCoord.x-current.x,curDy=testCoord.y-current.y;if(!(testCoord.x!==current.x&&testCoord.y!==current.y&&Math.abs(curDx)!==Math.abs(curDy)||Math.sign(dx*dy)*Math.sign(curDx*curDy)==-1||0===Math.sign(dx*dy)&&0===Math.sign(curDx*curDy))){var line=interpolate(testCoord.x,testCoord.y,current.x,current.y);if(line.length===j-i&&
line.every((function(point){return walkable.includes(grid[point.y][point.x])}))){newPath.splice.apply(newPath,[i+1,line.length].concat(_toConsumableArray(line)));break}}}return newPath}
/**
 * Compress a path, remove redundant nodes without altering the shape
 * The original path is not modified
 * @param {Array<{x: number, y: number}>} path The path
 * @return {Array<{x: number, y: number}>} The compressed path
 */,compressPath:function(path){
// nothing to compress
if(path.length<3)return path;var lx,ly,ldx,ldy,sq,i,compressed=[],sx=path[0].x,sy=path[0].y,px=path[1].x,py=path[1].y,dx=px-sx,dy=py-sy;for(
// normalize the direction
dx/=sq=Math.sqrt(dx*dx+dy*dy),dy/=sq,
// start the new path
compressed.push({x:sx,y:sy}),i=2;i<path.length;i++)
// store the last point
lx=px,ly=py,
// store the last direction
ldx=dx,ldy=dy,
// next direction
dx=(
// next point
px=path[i].x)-lx,dy=(py=path[i].y)-ly,dy/=
// normalize
sq=Math.sqrt(dx*dx+dy*dy),
// if the direction has changed, store the point
(dx/=sq)===ldx&&dy===ldy||compressed.push({x:lx,y:ly});
// store the last point
return compressed.push({x:px,y:py}),compressed}}}
/***/,
/***/416:
/***/(module,__unused_webpack_exports,__webpack_require__)=>{module.exports=__webpack_require__(328);
/***/},
/***/328:
/***/function(module,exports){var __WEBPACK_AMD_DEFINE_FACTORY__,__WEBPACK_AMD_DEFINE_ARRAY__,__WEBPACK_AMD_DEFINE_RESULT__;// Generated by CoffeeScript 1.8.0
(function(){var Heap,defaultCmp,floor,heapify,heappop,heappush,heappushpop,heapreplace,insort,min,nlargest,nsmallest,updateItem,_siftdown,_siftup;floor=Math.floor,min=Math.min,
/*
  Default comparison function to be used
   */
defaultCmp=function(x,y){return x<y?-1:x>y?1:0},
/*
  Insert item x in list a, and keep it sorted assuming a is sorted.
  
  If x is already in a, insert it to the right of the rightmost x.
  
  Optional args lo (default 0) and hi (default a.length) bound the slice
  of a to be searched.
   */
insort=function(a,x,lo,hi,cmp){var mid;if(null==lo&&(lo=0),null==cmp&&(cmp=defaultCmp),lo<0)throw new Error("lo must be non-negative");for(null==hi&&(hi=a.length);lo<hi;)cmp(x,a[mid=floor((lo+hi)/2)])<0?hi=mid:lo=mid+1;return[].splice.apply(a,[lo,lo-lo].concat(x)),x},
/*
  Push item onto heap, maintaining the heap invariant.
   */
heappush=function(array,item,cmp){return null==cmp&&(cmp=defaultCmp),array.push(item),_siftdown(array,0,array.length-1,cmp)},
/*
  Pop the smallest item off the heap, maintaining the heap invariant.
   */
heappop=function(array,cmp){var lastelt,returnitem;return null==cmp&&(cmp=defaultCmp),lastelt=array.pop(),array.length?(returnitem=array[0],array[0]=lastelt,_siftup(array,0,cmp)):returnitem=lastelt,returnitem},
/*
  Pop and return the current smallest value, and add the new item.
  
  This is more efficient than heappop() followed by heappush(), and can be
  more appropriate when using a fixed size heap. Note that the value
  returned may be larger than item! That constrains reasonable use of
  this routine unless written as part of a conditional replacement:
      if item > array[0]
        item = heapreplace(array, item)
   */
heapreplace=function(array,item,cmp){var returnitem;return null==cmp&&(cmp=defaultCmp),returnitem=array[0],array[0]=item,_siftup(array,0,cmp),returnitem},
/*
  Fast version of a heappush followed by a heappop.
   */
heappushpop=function(array,item,cmp){var _ref;return null==cmp&&(cmp=defaultCmp),array.length&&cmp(array[0],item)<0&&(item=(_ref=[array[0],item])[0],array[0]=_ref[1],_siftup(array,0,cmp)),item},
/*
  Transform list into a heap, in-place, in O(array.length) time.
   */
heapify=function(array,cmp){var i,_i,_len,_ref1,_results,_results1;for(null==cmp&&(cmp=defaultCmp),_ref1=function(){_results1=[];for(var _j=0,_ref=floor(array.length/2);0<=_ref?_j<_ref:_j>_ref;0<=_ref?_j++:_j--)_results1.push(_j);return _results1}.apply(this).reverse(),_results=[],_i=0,_len=_ref1.length;_i<_len;_i++)i=_ref1[_i],_results.push(_siftup(array,i,cmp));return _results},
/*
  Update the position of the given item in the heap.
  This function should be called every time the item is being modified.
   */
updateItem=function(array,item,cmp){var pos;if(null==cmp&&(cmp=defaultCmp),-1!==(pos=array.indexOf(item)))return _siftdown(array,0,pos,cmp),_siftup(array,pos,cmp)},
/*
  Find the n largest elements in a dataset.
   */
nlargest=function(array,n,cmp){var elem,result,_i,_len,_ref;if(null==cmp&&(cmp=defaultCmp),!(result=array.slice(0,n)).length)return result;for(heapify(result,cmp),_i=0,_len=(_ref=array.slice(n)).length;_i<_len;_i++)elem=_ref[_i],heappushpop(result,elem,cmp);return result.sort(cmp).reverse()},
/*
  Find the n smallest elements in a dataset.
   */
nsmallest=function(array,n,cmp){var elem,los,result,_i,_j,_len,_ref,_ref1,_results;if(null==cmp&&(cmp=defaultCmp),10*n<=array.length){if(!(result=array.slice(0,n).sort(cmp)).length)return result;for(los=result[result.length-1],_i=0,_len=(_ref=array.slice(n)).length;_i<_len;_i++)cmp(elem=_ref[_i],los)<0&&(insort(result,elem,0,null,cmp),result.pop(),los=result[result.length-1]);return result}for(heapify(array,cmp),_results=[],_j=0,_ref1=min(n,array.length);0<=_ref1?_j<_ref1:_j>_ref1;0<=_ref1?++_j:--_j)_results.push(heappop(array,cmp));return _results},_siftdown=function(array,startpos,pos,cmp){var newitem,parent,parentpos;for(null==cmp&&(cmp=defaultCmp),newitem=array[pos];pos>startpos&&cmp(newitem,parent=array[parentpos=pos-1>>1])<0;)array[pos]=parent,pos=parentpos;return array[pos]=newitem},_siftup=function(array,pos,cmp){var childpos,endpos,newitem,rightpos,startpos;for(null==cmp&&(cmp=defaultCmp),endpos=array.length,startpos=pos,newitem=array[pos],childpos=2*pos+1;childpos<endpos;)(rightpos=childpos+1)<endpos&&!(cmp(array[childpos],array[rightpos])<0)&&(childpos=rightpos),array[pos]=array[childpos],childpos=2*(pos=childpos)+1;return array[pos]=newitem,_siftdown(array,startpos,pos,cmp)},Heap=function(){function Heap(cmp){this.cmp=null!=cmp?cmp:defaultCmp,this.nodes=[]}return Heap.push=heappush,Heap.pop=heappop,Heap.replace=heapreplace,Heap.pushpop=heappushpop,Heap.heapify=heapify,Heap.updateItem=updateItem,Heap.nlargest=nlargest,Heap.nsmallest=nsmallest,Heap.prototype.push=function(x){return heappush(this.nodes,x,this.cmp)},Heap.prototype.pop=function(){return heappop(this.nodes,this.cmp)},Heap.prototype.peek=function(){return this.nodes[0]},Heap.prototype.contains=function(x){return-1!==this.nodes.indexOf(x)},Heap.prototype.replace=function(x){return heapreplace(this.nodes,x,this.cmp)},Heap.prototype.pushpop=function(x){return heappushpop(this.nodes,x,this.cmp)},Heap.prototype.heapify=function(){return heapify(this.nodes,this.cmp)},Heap.prototype.updateItem=function(x){return updateItem(this.nodes,x,this.cmp)},Heap.prototype.clear=function(){return this.nodes=[]},Heap.prototype.empty=function(){return 0===this.nodes.length},Heap.prototype.size=function(){return this.nodes.length},Heap.prototype.clone=function(){var heap;return(heap=new Heap).nodes=this.nodes.slice(0),heap},Heap.prototype.toArray=function(){return this.nodes.slice(0)},Heap.prototype.insert=Heap.prototype.push,Heap.prototype.top=Heap.prototype.peek,Heap.prototype.front=Heap.prototype.peek,Heap.prototype.has=Heap.prototype.contains,Heap.prototype.copy=Heap.prototype.clone,Heap}(),__WEBPACK_AMD_DEFINE_ARRAY__=[],void 0===(__WEBPACK_AMD_DEFINE_RESULT__="function"==typeof(__WEBPACK_AMD_DEFINE_FACTORY__=function(){return Heap})?__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports,__WEBPACK_AMD_DEFINE_ARRAY__):__WEBPACK_AMD_DEFINE_FACTORY__)||(module.exports=__WEBPACK_AMD_DEFINE_RESULT__)}).call(this)}
/******/},__webpack_module_cache__={};
/************************************************************************/
/******/ // The module cache
/******/
/******/
/************************************************************************/
/******/
/******/ // startup
/******/ // Load entry module and return exports
/******/ // This entry module is referenced by other modules so it can't be inlined
/******/var __webpack_exports__=
/******/
/******/ // The require function
/******/function __webpack_require__(moduleId){
/******/ // Check if module is in cache
/******/var cachedModule=__webpack_module_cache__[moduleId];
/******/if(void 0!==cachedModule)
/******/return cachedModule.exports;
/******/
/******/ // Create a new module (and put it into the cache)
/******/var module=__webpack_module_cache__[moduleId]={
/******/ // no module.id needed
/******/ // no module.loaded needed
/******/exports:{}
/******/};
/******/
/******/ // Execute the module function
/******/
/******/
/******/ // Return the exports of the module
/******/return __webpack_modules__[moduleId].call(module.exports,module,module.exports,__webpack_require__),module.exports;
/******/}(824);
/******/EasyStar=__webpack_exports__})
/******/
/******/();