const STOP = 0;
const TOP = 1;
const TOP_RIGHT = 2;
const RIGHT = 4;
const BOTTOM_RIGHT = 8;
const BOTTOM = 16;
const BOTTOM_LEFT = 32;
const LEFT = 64;
const TOP_LEFT = 128;

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

function calculateDirection(X, Y, deltaX, deltaY, torusEnabled) {
  const test = (coord, limit, diff) => coord === diff || (torusEnabled && (-limit + 1) * coord === diff);
  const testX = x => test(x, X, deltaX);
  const testY = y => test(y, Y, deltaY);

  if (testX(0) && testY(-1)) return TOP;
  if (testX(1) && testY(-1)) return TOP_RIGHT;
  if (testX(1) && testY(0)) return RIGHT;
  if (testX(1) && testY(1)) return BOTTOM_RIGHT;
  if (testX(0) && testY(1)) return BOTTOM;
  if (testX(-1) && testY(1)) return BOTTOM_LEFT;
  if (testX(-1) && testY(0)) return LEFT;
  if (testX(-1) && testY(-1)) return TOP_LEFT;

  if (deltaX === 0 && deltaY === 0) return STOP;
  if (deltaX === 0) return deltaY > 0 ? BOTTOM : TOP;
  if (deltaY === 0) return deltaX > 0 ? RIGHT : LEFT;
  if (deltaY > 0) return deltaX > 0 ? BOTTOM_RIGHT : BOTTOM_LEFT;
  return deltaX > 0 ? TOP_RIGHT : TOP_LEFT;
}

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
function interpolate(x0, y0, x1, y1) {
  let x = x0;
  let y = y0;
  const abs = Math.abs;
  const line = [];
  let err;
  let e2;

  const dx = abs(x1 - x);
  const dy = abs(y1 - y);

  const sx = x < x1 ? 1 : -1;
  const sy = y < y1 ? 1 : -1;

  err = dx - dy;

  while (true) {
    line.push({x, y});

    if (x === x1 && y === y1) {
      break;
    }

    e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }

  return line;
}

/**
 * Given a compressed path, return a new path that has all the segments
 * in it interpolated.
 * @param {Array<{x: number, y: number}>} path The path
 * @return {Array<{x: number, y: number}>}>} expanded path
 */
function expandPath(path) {
  const expanded = [];
  const len = path.length;
  let coord0;
  let coord1;
  let interpolated;
  let interpolatedLen;
  let i;
  let j;

  if (len < 2) {
    return expanded;
  }

  for (i = 0; i < len - 1; ++i) {
    coord0 = path[i];
    coord1 = path[i + 1];

    interpolated = interpolate(coord0.x, coord0.y, coord1.x, coord1.y);
    interpolatedLen = interpolated.length;
    for (j = 0; j < interpolatedLen - 1; ++j) {
      expanded.push(interpolated[j]);
    }
  }
  expanded.push(path[len - 1]);

  return expanded;
}

/**
 * Smoothen the give path.
 * The original path will not be modified; a new path will be returned.
 * @param {Array<Array<number>>} grid
 * @param {Array<{x: number, y: number}>} path The path
 * @param {Array<number>} walkable Walkable ids
 * @param {boolean} diagonalsEnabled Is diagonal movements enabled
 */

// TODO enableDiagonals
function smoothenPath(grid, path, walkable, diagonalsEnabled) {
  const newPath = [...path];

  for (let i = 1; i < newPath.length - 1; i++) {
    const {x: x1, y: y1} = newPath[i - 1];
    const {x: x2, y: y2} = newPath[i];
    const dx = x2 - x1;
    const dy = y2 - y1;

    const testCoord = {x: x2 + dx, y: y2 + dy};

    for (let j = i + 2; j < newPath.length; j++) {
      const current = newPath[j];

      const curDx = testCoord.x - current.x;
      const curDy = testCoord.y - current.y;

      if (
        (testCoord.x === current.x || testCoord.y === current.y || Math.abs(curDx) === Math.abs(curDy)) &&
        Math.sign(dx * dy) * Math.sign(curDx * curDy) !== -1 &&
        !(Math.sign(dx * dy) === 0 && Math.sign(curDx * curDy) === 0)
      ) {
        const line = interpolate(testCoord.x, testCoord.y, current.x, current.y);

        const isValidLine =
          line.length === j - i && //
          line.every(point => walkable.includes(grid[point.y][point.x]));

        if (isValidLine) {
          newPath.splice(i + 1, line.length, ...line);
          break;
        }
      }
    }
  }

  return newPath;
}

/**
 * Compress a path, remove redundant nodes without altering the shape
 * The original path is not modified
 * @param {Array<{x: number, y: number}>} path The path
 * @return {Array<{x: number, y: number}>} The compressed path
 */
function compressPath(path) {
  // nothing to compress
  if (path.length < 3) {
    return path;
  }

  const compressed = [];
  const sx = path[0].x; // start x
  const sy = path[0].y; // start y
  let px = path[1].x; // second point x
  let py = path[1].y; // second point y
  let dx = px - sx; // direction between the two points
  let dy = py - sy; // direction between the two points
  let lx;
  let ly;
  let ldx;
  let ldy;
  let sq;
  let i;

  // normalize the direction
  sq = Math.sqrt(dx * dx + dy * dy);
  dx /= sq;
  dy /= sq;

  // start the new path
  compressed.push({x: sx, y: sy});

  for (i = 2; i < path.length; i++) {
    // store the last point
    lx = px;
    ly = py;

    // store the last direction
    ldx = dx;
    ldy = dy;

    // next point
    px = path[i].x;
    py = path[i].y;

    // next direction
    dx = px - lx;
    dy = py - ly;

    // normalize
    sq = Math.sqrt(dx * dx + dy * dy);
    dx /= sq;
    dy /= sq;

    // if the direction has changed, store the point
    if (dx !== ldx || dy !== ldy) {
      compressed.push({x: lx, y: ly});
    }
  }

  // store the last point
  compressed.push({x: px, y: py});

  return compressed;
}

module.exports = {
  STOP,
  TOP,
  TOP_RIGHT,
  RIGHT,
  BOTTOM_RIGHT,
  BOTTOM,
  BOTTOM_LEFT,
  LEFT,
  TOP_LEFT,
  calculateDirection,
  interpolate,
  expandPath,
  smoothenPath,
  compressPath,
};
