export const STOP = 0;
export const TOP = 1;
export const TOP_RIGHT = 2;
export const RIGHT = 4;
export const BOTTOM_RIGHT = 8;
export const BOTTOM = 16;
export const BOTTOM_LEFT = 32;
export const LEFT = 64;
export const TOP_LEFT = 128;

export type Direction =
  | typeof STOP
  | typeof TOP
  | typeof TOP_RIGHT
  | typeof RIGHT
  | typeof BOTTOM_RIGHT
  | typeof BOTTOM
  | typeof BOTTOM_LEFT
  | typeof LEFT
  | typeof TOP_LEFT;

export const Heuristics: {
  manhattan: (dx: number, dy: number) => number;
  octile: (dx: number, dy: number) => number;
  chebyshev: (dx: number, dy: number) => number;
  euclidean: (dx: number, dy: number) => number;
};

export const calculateDirection: (
  X: number,
  Y: number,
  deltaX: number,
  deltaY: number,
  torusEnabled: boolean,
) => Direction;
export const interpolate: (x0: number, y0: number, x1: number, y1: number) => {x: number; y: number}[];
export const compressPath: (path: {x: number; y: number}[], maxCompressedLength: number) => {x: number; y: number}[];
export const expandPath: (path: {x: number; y: number}[]) => {x: number; y: number}[];
export const smoothenPath: (
  grid: number[][],
  path: {x: number; y: number}[],
  walkable: number[],
) => {x: number; y: number}[];

export class EasyStar {
  /**
   * Sets the collision grid that EasyStar uses.
   *
   * @param {Array|Number} tiles An array of numbers that represent
   * which tiles in your grid should be considered
   * acceptable, or "walkable".
   */
  setAcceptableTiles(tiles: number[] | number): void;

  /**
   * Enables sync mode for this EasyStar instance..
   * if you're into that sort of thing.
   */
  enableSync(): void;

  /**
   * Disables sync mode for this EasyStar instance.
   */
  disableSync(): void;

  /**
   * Enable diagonal pathfinding.
   */
  enableDiagonals(): void;

  /**
   * Disable diagonal pathfinding.
   */
  disableDiagonals(): void;

  /**
   * If enabled, map will be treated as a torus (wrapped map)
   */
  enableTorus(): void;

  /**
   * If enabled, map will be treated as a torus (wrapped map)
   */
  disableTorus(): void;

  /**
   * Sets the collision grid that EasyStar uses.
   *
   * @param {Array} grid The collision grid that this EasyStar instance will read from.
   * This should be a 2D Array of Numbers.
   */
  setGrid(grid: number[][]): void;

  /**
   * Sets the tile cost for a particular tile type.
   *
   * @param {Number} tileType The tile type to set the cost for.
   * @param {Number} cost The multiplicative cost associated with the given tile.
   */
  setTileCost(tileType: number, cost: number): void;

  /**
   * Sets the an additional cost for a particular point.
   * Overrides the cost from setTileCost.
   *
   * @param {Number} x The x value of the point to cost.
   * @param {Number} y The y value of the point to cost.
   * @param {Number} cost The multiplicative cost associated with the given point.
   */
  setAdditionalPointCost(x: number, y: number, cost: number): void;

  /**
   * Remove the additional cost for a particular point.
   *
   * @param {Number} x The x value of the point to stop costing.
   * @param {Number} y The y value of the point to stop costing.
   */
  removeAdditionalPointCost(x: number, y: number): void;

  /**
   * Remove all additional point costs.
   */
  removeAllAdditionalPointCosts(): void;

  /**
   * Sets the number of search iterations per calculation.
   * A lower number provides a slower result, but more practical if you
   * have a large tile-map and don't want to block your thread while
   * finding a path.
   *
   * @param {Number} iterations The number of searches to prefrom per calculate() call.
   */
  setIterationsPerCalculation(iterations: number): void;

  /**
   * Set heuristic functions for calculating node distance
   * @param {Function} orthogonal Function for calculating the orthogonal node distance.
   * @param {Function} diagonal  Function for calculating the diagonal node distance.
   */
  setHeuristics(orthogonal: (dx: number, dy: number) => number, diagonal: (dx: number, dy: number) => number): void;

  /**
   * Set costs for different directions
   * @param {Array<Array<number>>} costs Two dimensional array with direction costs. Example:
   * [1.0, 1.0, 1.0],
   * [1.0,   0, 1.0],
   * [1.0, 1.0, 1.0],
   */
  setDirectionCosts(costs: number[][]): void;

  /**
   * Avoid a particular point on the grid,
   * regardless of whether it is an acceptable tile.
   *
   * @param {Number} x The x value of the point to avoid.
   * @param {Number} y The y value of the point to avoid.
   */
  avoidAdditionalPoint(x: number, y: number): void;

  /**
   * Stop avoiding a particular point on the grid.
   *
   * @param {Number} x The x value of the point to stop avoiding.
   * @param {Number} y The y value of the point to stop avoiding.
   */
  stopAvoidingAdditionalPoint(x: number, y: number): void;

  /**
   * Enables corner cutting in diagonal movement.
   */
  enableCornerCutting(): void;

  /**
   * Disables corner cutting in diagonal movement.
   */
  disableCornerCutting(): void;

  /**
   * Stop avoiding all additional points on the grid.
   */
  stopAvoidingAllAdditionalPoints(): void;

  /**
   * Find a path.
   *
   * @param {Number} startX The X position of the starting point.
   * @param {Number} startY The Y position of the starting point.
   * @param {Number} endX The X position of the ending point.
   * @param {Number} endY The Y position of the ending point.
   * @param {Function} callback A function that is called when your path
   * is found, or no path is found.
   * @return {Number} A numeric, non-zero value which identifies the created instance. This value can be passed to cancelPath to cancel the path calculation.
   *
   */
  findPath(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    callback: (path: {x: number; y: number}[]) => void,
  ): number;

  /**
   * Cancel a path calculation.
   *
   * @param {Number} instanceId The instance ID of the path being calculated
   * @return {Boolean} True if an instance was found and cancelled.
   *
   **/
  cancelPath(instanceId: number): boolean;

  /**
   * This method steps through the A* Algorithm in an attempt to
   * find your path(s). It will search 4-8 tiles (depending on diagonals) for every calculation.
   * You can change the number of calculations done in a call by using
   * easystar.setIteratonsPerCalculation().
   */
  calculate(): void;

  /**
   * Sets a directional condition on a tile
   *
   * @param {Number} x The x value of the point.
   * @param {Number} y The y value of the point.
   * @param {Array.<String>} allowedDirections A list of all the allowed directions from which the tile is accessible.
   *
   * eg. easystar.setDirectionalCondition(1, 1, ['TOP']): You can only access the tile by walking down onto it,
   */
  setDirectionalCondition(x: number, y: number, allowedDirections: Direction[]): void;

  /**
   * Remove all directional conditions
   */
  removeAllDirectionalConditions(): void;

  /**
   * Sets the multiplier determining the importance of the manhattan heuristics
   * @param {Number} factor
   **/
  setHeuristicsFactor(factor: number): void;

  /**
   * Sets the added cost for making a turn
   * Higer value means less turns
   * @param {Number} factor
   **/
  setTurnPenalty(factor: number): void;
}
