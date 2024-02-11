/**
 * Given the start and end coordinates, return all the coordinates lying
 * on the line formed by these coordinates, based on Bresenham's algorithm.
 * http://en.wikipedia.org/wiki/Bresenham's_line_algorithm#Simplification
 * @param {number} x0 Start x coordinate
 * @param {number} y0 Start y coordinate
 * @param {number} x1 End x coordinate
 * @param {number} y1 End y coordinate
 * @return {Array<Array<number>>} The coordinates on the line
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
exports.interpolate = interpolate;

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
exports.expandPath = expandPath;

/**
 * Smoothen the give path.
 * The original path will not be modified; a new path will be returned.
 * @param {Array<Array<number>>} grid
 * @param {Array<{x: number, y: number}>} path The path
 * @param {Array<number>} walkable Walkable ids
 */
function smoothenPath(grid, path, walkable) {
  const len = path.length;
  const x0 = path[0].x; // path start x
  const y0 = path[0].y; // path start y
  const x1 = path[len - 1].x; // path end x
  const y1 = path[len - 1].y; // path end y
  let sx;
  let sy; // current start coordinate
  let ex;
  let ey; // current end coordinate
  let i;
  let j;
  let coord;
  let line;
  let testCoord;
  let blocked;
  let lastValidCoord;

  sx = x0;
  sy = y0;
  const newPath = [{x: sx, y: sy}];

  for (i = 2; i < len; ++i) {
    coord = path[i];
    ex = coord.x;
    ey = coord.y;
    line = interpolate(sx, sy, ex, ey);

    blocked = false;
    for (j = 1; j < line.length; ++j) {
      testCoord = line[j];

      if (walkable.indexOf(grid[testCoord.x][testCoord.y]) === -1) {
        blocked = true;
        break;
      }
    }
    if (blocked) {
      lastValidCoord = path[i - 1];
      newPath.push(lastValidCoord);
      sx = lastValidCoord.x;
      sy = lastValidCoord.y;
    }
  }
  newPath.push({x: x1, y: y1});

  return newPath;
}
exports.smoothenPath = smoothenPath;

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

exports.compressPath = compressPath;
