/* eslint-disable no-param-reassign */
/**
 *   EasyStar.js
 *   github.com/prettymuchbryce/EasyStarJS
 *   Licensed under the MIT license.
 *
 *   Implementation By Bryce Neal (@prettymuchbryce)
 * */

const EasyStar = {};
const Heap = require('heap');
const Instance = require('./instance');
const Node = require('./node');
const Heuristics = require('./heuristics');
const {compressPath, smoothenPath, expandPath, interpolate} = require('./util');

const CLOSED_LIST = 0;
const OPEN_LIST = 1;

module.exports = EasyStar;

let nextInstanceId = 1;

EasyStar.js = function js() {
  const STRAIGHT_COST = 1.0;
  const DIAGONAL_COST = Math.SQRT2;
  let syncEnabled = false;
  let pointsToAvoid = {};
  let collisionGrid;
  let X; // width
  let Y; // height
  const costMap = {};
  let pointsToCost = {};
  let directionalConditions = {};
  let allowCornerCutting = true;
  let iterationsSoFar;
  const instances = {};
  const instanceQueue = [];
  let iterationsPerCalculation = Number.MAX_VALUE;
  let acceptableTiles;
  let diagonalsEnabled = false;
  let torusEnabled = false;
  let turnPenalty = 0;
  let heuristicsFactor = 1;
  let orthogonalHeuristic = Heuristics.manhattan;
  let diagonalHeuristic = Heuristics.octile;
  let directionCosts = [
    [1.0, 1.0, 1.0],
    [1.0, 0, 1.0],
    [1.0, 1.0, 1.0],
  ];

  /**
   * Sets the collision grid that EasyStar uses.
   *
   * @param {Array|Number} tiles An array of numbers that represent
   * which tiles in your grid should be considered
   * acceptable, or "walkable".
   * */
  this.setAcceptableTiles = function setAcceptableTiles(tiles) {
    if (tiles instanceof Array) {
      // Array
      acceptableTiles = tiles;
    } else if (!Number.isNaN(parseFloat(tiles)) && Number.isFinite(tiles)) {
      // Number
      acceptableTiles = [tiles];
    }
  };

  /**
   * Enables sync mode for this EasyStar instance..
   * if you're into that sort of thing.
   * */
  this.enableSync = function enableSync() {
    syncEnabled = true;
  };

  /**
   * Disables sync mode for this EasyStar instance.
   * */
  this.disableSync = function disableSync() {
    syncEnabled = false;
  };

  /**
   * Enable diagonal pathfinding.
   */
  this.enableDiagonals = function enableDiagonals() {
    diagonalsEnabled = true;
  };

  /**
   * Disable diagonal pathfinding.
   */
  this.disableDiagonals = function disableDiagonals() {
    diagonalsEnabled = false;
  };

  /**
   * If enabled, map will be treated as a torus (wrapped map)
   */
  this.enableTorus = function enableTorus() {
    torusEnabled = true;
  };

  /**
   * If enabled, map will be treated as a torus (wrapped map)
   */
  this.disableTorus = function disableTorus() {
    torusEnabled = false;
  };

  /**
   * Sets the collision grid that EasyStar uses.
   *
   * @param {Array} grid The collision grid that this EasyStar instance will read from.
   * This should be a 2D Array of Numbers.
   * */
  this.setGrid = function setGrid(grid) {
    collisionGrid = grid;
    X = grid[0].length;
    Y = grid.length;

    // Setup cost map
    for (let y = 0; y < Y; y++) {
      for (let x = 0; x < X; x++) {
        if (!costMap[collisionGrid[y][x]]) {
          costMap[collisionGrid[y][x]] = 1;
        }
      }
    }
  };

  /**
   * Sets the tile cost for a particular tile type.
   *
   * @param {Number} tileType The tile type to set the cost for.
   * @param {Number} cost The multiplicative cost associated with the given tile.
   * */
  this.setTileCost = function setTileCost(tileType, cost) {
    costMap[tileType] = cost;
  };

  /**
   * Sets the additional cost for a particular point.
   * Overrides the cost from setTileCost.
   *
   * @param {Number} x The x value of the point to cost.
   * @param {Number} y The y value of the point to cost.
   * @param {Number} cost The multiplicative cost associated with the given point.
   * */
  this.setAdditionalPointCost = function setAdditionalPointCost(x, y, cost) {
    if (pointsToCost[y] === undefined) {
      pointsToCost[y] = {};
    }
    pointsToCost[y][x] = cost;
  };

  /**
   * Remove the additional cost for a particular point.
   *
   * @param {Number} x The x value of the point to stop costing.
   * @param {Number} y The y value of the point to stop costing.
   * */
  this.removeAdditionalPointCost = function removeAdditionalPointCost(x, y) {
    if (pointsToCost[y] !== undefined) {
      delete pointsToCost[y][x];
    }
  };

  /**
   * Remove all additional point costs.
   * */
  this.removeAllAdditionalPointCosts = function removeAllAdditionalPointCosts() {
    pointsToCost = {};
  };

  /**
   * Sets a directional condition on a tile
   *
   * @param {Number} x The x value of the point.
   * @param {Number} y The y value of the point.
   * @param {Array.<String>} allowedDirections A list of all the allowed directions that can access
   * the tile.
   * */
  this.setDirectionalCondition = function setDirectionalCondition(x, y, allowedDirections) {
    if (directionalConditions[y] === undefined) {
      directionalConditions[y] = {};
    }
    directionalConditions[y][x] = allowedDirections
      // eslint-disable-next-line no-bitwise
      .map(c => c | 0) // force integer
      // eslint-disable-next-line no-bitwise
      .reduce((p, c) => p | c, 0);
  };

  /**
   * Remove all directional conditions
   * */
  this.removeAllDirectionalConditions = function removeAllDirectionalConditions() {
    directionalConditions = {};
  };

  /**
   * Sets the number of search iterations per calculation.
   * A lower number provides a slower result, but more practical if you
   * have a large tile-map and don't want to block your thread while
   * finding a path.
   *
   * @param {Number} iterations The number of searches to prefrom per calculate() call.
   * */
  this.setIterationsPerCalculation = function setIterationsPerCalculation(iterations) {
    iterationsPerCalculation = iterations;
  };

  /**
   * Set heuristic function for calculating node distance
   * @param {Function} orthogonal Function for calculating the orthogonal node distance.
   * @param {Function} diagonal  Function for calculating the diagonal node distance.
   */
  this.setHeuristics = function setHeuristics(orthogonal, diagonal) {
    orthogonalHeuristic = orthogonal || Heuristics.manhattan;
    diagonalHeuristic = diagonal || Heuristics.euclidean;
  };

  /**
   * Set costs for different directions
   * @param {Array<Array<number>>} costs Two dimensional array with direction costs. Example:
   * [1.0, 1.0, 1.0],
   * [1.0,   0, 1.0],
   * [1.0, 1.0, 1.0],
   */
  this.setDirectionCosts = function setDirectionCosts(costs) {
    directionCosts = costs || directionCosts;
  };

  /**
   * Avoid a particular point on the grid,
   * regardless of whether it is an acceptable tile.
   *
   * @param {Number} x The x value of the point to avoid.
   * @param {Number} y The y value of the point to avoid.
   * */
  this.avoidAdditionalPoint = function avoidAdditionalPoint(x, y) {
    if (pointsToAvoid[y] === undefined) {
      pointsToAvoid[y] = {};
    }
    pointsToAvoid[y][x] = 1;
  };

  /**
   * Stop avoiding a particular point on the grid.
   *
   * @param {Number} x The x value of the point to stop avoiding.
   * @param {Number} y The y value of the point to stop avoiding.
   * */
  this.stopAvoidingAdditionalPoint = function stopAvoidingAdditionalPoint(x, y) {
    if (pointsToAvoid[y] !== undefined) {
      delete pointsToAvoid[y][x];
    }
  };

  /**
   * Enables corner cutting in diagonal movement.
   * */
  this.enableCornerCutting = function enableCornerCutting() {
    allowCornerCutting = true;
  };

  /**
   * Disables corner cutting in diagonal movement.
   * */
  this.disableCornerCutting = function disableCornerCutting() {
    allowCornerCutting = false;
  };

  /**
   * Stop avoiding all additional points on the grid.
   * */
  this.stopAvoidingAllAdditionalPoints = function stopAvoidingAllAdditionalPoints() {
    pointsToAvoid = {};
  };

  /**
   * Sets the multiplier determining the importance of the manhattan heuristics
   * @param {Number} factor
   * */
  this.setHeuristicsFactor = function setHeuristicsFactor(factor) {
    heuristicsFactor = factor;
  };

  /**
   * Sets the added cost for making a turn
   * Higer value means less turns
   * @param {Number} penalty
   * */
  this.setTurnPenalty = function setTurnPenalty(penalty) {
    turnPenalty = penalty;
  };

  /**
   * Wrap x coordinate if torus enabled
   * @param {Number} x
   */
  const normalizeX = function normalizeX(x) {
    if (torusEnabled) return (x + X) % X;

    return x;
  };

  /**
   * Wrap y coordinate if torus enabled
   * @param {Number} y
   */
  const normalizeY = function normalizeY(y) {
    if (torusEnabled) return (y + Y) % Y;

    return y;
  };

  /**
   * -1, -1 | 0, -1  | 1, -1
   * -1,  0 | SOURCE | 1,  0
   * -1,  1 | 0,  1  | 1,  1
   */
  const calculateDirection = function calculateDirection(diffX, diffY) {
    const test = (coord, limit, diff) => coord === diff || (torusEnabled && (-limit + 1) * coord === diff);
    const testX = x => test(x, X, diffX);
    const testY = y => test(y, Y, diffY);

    if (testX(0) && testY(-1)) return EasyStar.TOP;
    if (testX(1) && testY(-1)) return EasyStar.TOP_RIGHT;
    if (testX(1) && testY(0)) return EasyStar.RIGHT;
    if (testX(1) && testY(1)) return EasyStar.BOTTOM_RIGHT;
    if (testX(0) && testY(1)) return EasyStar.BOTTOM;
    if (testX(-1) && testY(1)) return EasyStar.BOTTOM_LEFT;
    if (testX(-1) && testY(0)) return EasyStar.LEFT;
    if (testX(-1) && testY(-1)) return EasyStar.TOP_LEFT;

    throw new Error(`These differences are not valid: ${diffX}, ${diffY}`);
  };

  // Helpers
  // eslint-disable-next-line no-shadow
  const isTileWalkable = function isTileWalkable(collisionGrid, acceptableTiles, x, y, sourceNode) {
    const directionalCondition = directionalConditions[y] && directionalConditions[y][x];
    if (directionalCondition !== undefined) {
      const direction = calculateDirection(sourceNode.x - x, sourceNode.y - y);
      // eslint-disable-next-line no-bitwise
      return (direction & directionalCondition) > 0;
    }

    const nX = normalizeX(x);
    const nY = normalizeY(y);
    return acceptableTiles.indexOf(collisionGrid[nY][nX]) !== -1;
  };

  const getTileCost = function getTileCost(x, y) {
    const nX = normalizeX(x);
    const nY = normalizeY(y);
    return (pointsToCost[nY] && pointsToCost[nY][nX]) || costMap[collisionGrid[nY][nX]];
  };

  const getDirectionCost = function getDirectionCost(dx, dy) {
    return directionCosts[1 + dy][1 + dx];
  };

  const getDistance = function getDistance(x1, y1, x2, y2) {
    // Classic version
    let dx = Math.abs(x1 - x2);
    let dy = Math.abs(y1 - y2);

    // Torus version
    if (torusEnabled) {
      dx = Math.min(dx, x1 - x2 + X, x2 - x1 + X);
      dy = Math.min(dy, y1 - y2 + Y, y2 - y1 + Y);
    }

    if (diagonalsEnabled) {
      // Octile distance
      return heuristicsFactor * diagonalHeuristic(dx, dy);
    }
    // Manhattan distance
    return heuristicsFactor * orthogonalHeuristic(dx, dy);
  };

  const coordinateToNode = function coordinateToNode(instance, x, y, parent, cost) {
    if (instance.nodeHash[y] !== undefined) {
      if (instance.nodeHash[y][x] !== undefined) {
        return instance.nodeHash[y][x];
      }
    } else {
      instance.nodeHash[y] = {};
    }
    const simpleDistanceToTarget = getDistance(x, y, instance.endX, instance.endY);
    let costSoFar;
    let directionFromParent = 'NONE';
    let turnPenaltyCost = 0;
    if (parent !== null) {
      directionFromParent = calculateDirection(x - parent.x, y - parent.y);
      if (parent.directionFromParent !== directionFromParent) {
        turnPenaltyCost = turnPenalty;
      }
      costSoFar = parent.costSoFar + cost + turnPenaltyCost;
    } else {
      costSoFar = 0;
    }
    const node = new Node(parent, x, y, costSoFar, simpleDistanceToTarget, directionFromParent);
    instance.nodeHash[y][x] = node;
    return node;
  };

  // Private methods follow
  const checkAdjacentNode = function checkAdjacentNode(instance, searchNode, x, y, cost) {
    const adjacentCoordinateX = normalizeX(searchNode.x + x);
    const adjacentCoordinateY = normalizeY(searchNode.y + y);

    if (
      (pointsToAvoid[adjacentCoordinateY] === undefined ||
        pointsToAvoid[adjacentCoordinateY][adjacentCoordinateX] === undefined) &&
      isTileWalkable(collisionGrid, acceptableTiles, adjacentCoordinateX, adjacentCoordinateY, searchNode)
    ) {
      const node = coordinateToNode(instance, adjacentCoordinateX, adjacentCoordinateY, searchNode, cost);

      if (node.list === undefined) {
        node.list = OPEN_LIST;
        instance.openList.push(node);
      } else if (searchNode.costSoFar + cost < node.costSoFar) {
        node.costSoFar = searchNode.costSoFar + cost;
        node.parent = searchNode;
        instance.openList.updateItem(node);
      }
    }
  };

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
  this.findPath = function findPath(_startX, _startY, _endX, _endY, callback) {
    const startX = normalizeX(_startX);
    const startY = normalizeY(_startY);
    const endX = normalizeX(_endX);
    const endY = normalizeY(_endY);

    // Wraps the callback for sync vs async logic
    const callbackWrapper = function callbackWrapper(result) {
      if (syncEnabled) {
        callback(result);
      } else {
        setTimeout(function setTimeout() {
          callback(result);
        });
      }
    };

    // No acceptable tiles were set
    if (acceptableTiles === undefined) {
      throw new Error("You can't set a path without first calling setAcceptableTiles() on EasyStar.");
    }
    // No grid was set
    if (collisionGrid === undefined) {
      throw new Error("You can't set a path without first calling setGrid() on EasyStar.");
    }

    // Start or endpoint outside of scope.
    if (
      startX < 0 ||
      startY < 0 ||
      endX < 0 ||
      endY < 0 ||
      startX > X - 1 ||
      startY > Y - 1 ||
      endX > X - 1 ||
      endY > Y - 1
    ) {
      throw new Error('Your start or end point is outside the scope of your grid.');
    }

    // Start and end are the same tile.
    if (startX === endX && startY === endY) {
      callbackWrapper([]);
      return undefined;
    }

    // End point is not an acceptable tile.
    const endTile = collisionGrid[endY][endX];
    let isAcceptable = false;
    for (let i = 0; i < acceptableTiles.length; i++) {
      if (endTile === acceptableTiles[i]) {
        isAcceptable = true;
        break;
      }
    }

    if (isAcceptable === false) {
      callbackWrapper(null);
      return undefined;
    }

    // Create the instance
    const instance = new Instance();
    instance.openList = new Heap(function openList(nodeA, nodeB) {
      return nodeA.bestGuessDistance() - nodeB.bestGuessDistance();
    });
    instance.isDoneCalculating = false;
    instance.nodeHash = {};
    instance.startX = startX;
    instance.startY = startY;
    instance.endX = endX;
    instance.endY = endY;
    instance.callback = callbackWrapper;

    instance.openList.push(coordinateToNode(instance, instance.startX, instance.startY, null, STRAIGHT_COST));

    const instanceId = nextInstanceId++;
    instances[instanceId] = instance;
    instanceQueue.push(instanceId);
    return instanceId;
  };

  /**
   * Cancel a path calculation.
   *
   * @param {Number} instanceId The instance ID of the path being calculated
   * @return {Boolean} True if an instance was found and cancelled.
   *
   * */
  this.cancelPath = function cancelPath(instanceId) {
    if (instanceId in instances) {
      delete instances[instanceId];
      // No need to remove it from instanceQueue
      return true;
    }
    return false;
  };

  /**
   * This method steps through the A* Algorithm in an attempt to
   * find your path(s). It will search 4-8 tiles (depending on diagonals) for every calculation.
   * You can change the number of calculations done in a call by using
   * easystar.setIteratonsPerCalculation().
   * */
  this.calculate = function calculate() {
    if (instanceQueue.length === 0 || collisionGrid === undefined || acceptableTiles === undefined) {
      return;
    }
    for (iterationsSoFar = 0; iterationsSoFar < iterationsPerCalculation; iterationsSoFar++) {
      if (instanceQueue.length === 0) {
        return;
      }

      if (syncEnabled) {
        // If this is a sync instance, we want to make sure that it calculates synchronously.
        iterationsSoFar = 0;
      }

      const instanceId = instanceQueue[0];
      const instance = instances[instanceId];
      if (typeof instance === 'undefined') {
        // This instance was cancelled
        instanceQueue.shift();
        continue;
      }

      // Couldn't find a path.
      if (instance.openList.size() === 0) {
        instance.callback(null);
        delete instances[instanceId];
        instanceQueue.shift();
        continue;
      }

      const searchNode = instance.openList.pop();

      // Handles the case where we have found the destination
      if (instance.endX === searchNode.x && instance.endY === searchNode.y) {
        const path = [];
        path.push({x: searchNode.x, y: searchNode.y});
        let parent = searchNode.parent;
        while (parent != null) {
          path.push({x: parent.x, y: parent.y});
          parent = parent.parent;
        }
        path.reverse();
        instance.callback(path);
        delete instances[instanceId];
        instanceQueue.shift();
        continue;
      }

      searchNode.list = CLOSED_LIST;

      if (searchNode.y > 0 || torusEnabled) {
        const directionCost = getDirectionCost(0, -1);
        checkAdjacentNode(
          instance,
          searchNode,
          0,
          -1,
          STRAIGHT_COST * directionCost * getTileCost(searchNode.x, searchNode.y - 1),
        );
      }
      if (searchNode.x < X - 1 || torusEnabled) {
        const directionCost = getDirectionCost(1, 0);
        checkAdjacentNode(
          instance,
          searchNode,
          1,
          0,
          STRAIGHT_COST * directionCost * getTileCost(searchNode.x + 1, searchNode.y),
        );
      }
      if (searchNode.y < Y - 1 || torusEnabled) {
        const directionCost = getDirectionCost(0, 1);
        checkAdjacentNode(
          instance,
          searchNode,
          0,
          1,
          STRAIGHT_COST * directionCost * getTileCost(searchNode.x, searchNode.y + 1),
        );
      }
      if (searchNode.x > 0 || torusEnabled) {
        const directionCost = getDirectionCost(-1, 0);
        checkAdjacentNode(
          instance,
          searchNode,
          -1,
          0,
          STRAIGHT_COST * directionCost * getTileCost(searchNode.x - 1, searchNode.y),
        );
      }
      if (diagonalsEnabled) {
        if ((searchNode.x > 0 && searchNode.y > 0) || torusEnabled) {
          if (
            allowCornerCutting ||
            (isTileWalkable(collisionGrid, acceptableTiles, searchNode.x, searchNode.y - 1, searchNode) &&
              isTileWalkable(collisionGrid, acceptableTiles, searchNode.x - 1, searchNode.y, searchNode))
          ) {
            const directionCost = getDirectionCost(-1, -1);
            checkAdjacentNode(
              instance,
              searchNode,
              -1,
              -1,
              DIAGONAL_COST * directionCost * getTileCost(searchNode.x - 1, searchNode.y - 1),
            );
          }
        }
        if ((searchNode.x < X - 1 && searchNode.y < Y - 1) || torusEnabled) {
          if (
            allowCornerCutting ||
            (isTileWalkable(collisionGrid, acceptableTiles, searchNode.x, searchNode.y + 1, searchNode) &&
              isTileWalkable(collisionGrid, acceptableTiles, searchNode.x + 1, searchNode.y, searchNode))
          ) {
            const directionCost = getDirectionCost(1, 1);
            checkAdjacentNode(
              instance,
              searchNode,
              1,
              1,
              DIAGONAL_COST * directionCost * getTileCost(searchNode.x + 1, searchNode.y + 1),
            );
          }
        }
        if ((searchNode.x < X - 1 && searchNode.y > 0) || torusEnabled) {
          if (
            allowCornerCutting ||
            (isTileWalkable(collisionGrid, acceptableTiles, searchNode.x, searchNode.y - 1, searchNode) &&
              isTileWalkable(collisionGrid, acceptableTiles, searchNode.x + 1, searchNode.y, searchNode))
          ) {
            const directionCost = getDirectionCost(1, -1);
            checkAdjacentNode(
              instance,
              searchNode,
              1,
              -1,
              DIAGONAL_COST * directionCost * getTileCost(searchNode.x + 1, searchNode.y - 1),
            );
          }
        }
        if ((searchNode.x > 0 && searchNode.y < Y - 1) || torusEnabled) {
          if (
            allowCornerCutting ||
            (isTileWalkable(collisionGrid, acceptableTiles, searchNode.x, searchNode.y + 1, searchNode) &&
              isTileWalkable(collisionGrid, acceptableTiles, searchNode.x - 1, searchNode.y, searchNode))
          ) {
            const directionCost = getDirectionCost(-1, 1);
            checkAdjacentNode(
              instance,
              searchNode,
              -1,
              1,
              DIAGONAL_COST * directionCost * getTileCost(searchNode.x - 1, searchNode.y + 1),
            );
          }
        }
      }
    }
  };
};

EasyStar.TOP = 1;
EasyStar.TOP_RIGHT = 2;
EasyStar.RIGHT = 4;
EasyStar.BOTTOM_RIGHT = 8;
EasyStar.BOTTOM = 16;
EasyStar.BOTTOM_LEFT = 32;
EasyStar.LEFT = 64;
EasyStar.TOP_LEFT = 128;

EasyStar.Heuristics = Heuristics;

EasyStar.compressPath = compressPath;
EasyStar.smoothenPath = smoothenPath;
EasyStar.expandPath = expandPath;
EasyStar.interpolate = interpolate;
