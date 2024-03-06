const {EasyStar, TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, LEFT} = require('../src/easystar');

describe('js', () => {
  beforeEach(() => {});

  it('It should find a path successfully with corner cutting enabled.', done => {
    function onPathFound(path) {
      expect(path).not.toBeNull();
      expect(path.length).toEqual(5);
      expect(path[0].x).toEqual(0);
      expect(path[0].y).toEqual(0);
      expect(path[3].x).toEqual(3);
      expect(path[3].y).toEqual(3);
      done();
    }

    const easyStar = new EasyStar();
    easyStar.enableDiagonals();
    const map = [
      [1, 0, 0, 0, 0],
      [0, 1, 0, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 1, 0],
      [0, 0, 0, 0, 1],
    ];

    easyStar.setGrid(map);

    easyStar.enableCornerCutting();

    easyStar.setAcceptableTiles([1]);

    easyStar.findPath(0, 0, 4, 4, onPathFound);

    easyStar.calculate();
  });

  it('It should fail to find a path successfully with corner cutting disabled.', done => {
    function onPathFound(path) {
      expect(path).toBeNull();
      done();
    }
    const easyStar = new EasyStar();
    easyStar.enableDiagonals();
    const map = [
      [1, 0, 0, 0, 0],
      [0, 1, 0, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 1, 0],
      [0, 0, 0, 0, 1],
    ];

    easyStar.setGrid(map);

    easyStar.disableCornerCutting();

    easyStar.setAcceptableTiles([1]);

    easyStar.findPath(0, 0, 4, 4, onPathFound);

    easyStar.calculate();
  });

  it('It should find a path successfully.', done => {
    function onPathFound(path) {
      expect(path).not.toBeNull();
      expect(path.length).toEqual(5);
      expect(path[0].x).toEqual(1);
      expect(path[0].y).toEqual(2);
      expect(path[2].x).toEqual(2);
      expect(path[2].y).toEqual(3);
      done();
    }

    const easyStar = new EasyStar();
    const map = [
      [1, 1, 0, 1, 1],
      [1, 1, 0, 1, 1],
      [1, 1, 0, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
    ];

    easyStar.setGrid(map);

    easyStar.setAcceptableTiles([1]);

    easyStar.findPath(1, 2, 3, 2, onPathFound);

    easyStar.calculate();
  });

  it('It should be able to cancel a path.', done => {
    function onPathFound() {
      fail("path wasn't cancelled");
    }

    const easyStar = new EasyStar();
    const map = [
      [1, 1, 0, 1, 1],
      [1, 1, 0, 1, 1],
      [1, 1, 0, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
    ];

    easyStar.setGrid(map);

    easyStar.setAcceptableTiles([1]);

    const id = easyStar.findPath(1, 2, 3, 2, onPathFound);

    easyStar.cancelPath(id);

    easyStar.calculate();

    setTimeout(done, 0);
  });

  it('Paths should have different IDs.', () => {
    function onPathFound() {}

    const easyStar = new EasyStar();
    const map = [
      [1, 1, 0, 1, 1],
      [1, 1, 0, 1, 1],
      [1, 1, 0, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
    ];

    easyStar.setGrid(map);

    easyStar.setAcceptableTiles([1]);

    const id1 = easyStar.findPath(1, 2, 3, 2, onPathFound);
    const id2 = easyStar.findPath(3, 2, 1, 2, onPathFound);
    expect(id1).toBeGreaterThan(0);
    expect(id2).toBeGreaterThan(0);
    expect(id1).not.toEqual(id2);
  });

  it('It should be able to avoid a separate point successfully.', done => {
    function onPathFound(path) {
      expect(path).not.toBeNull();
      expect(path.length).toEqual(7);
      expect(path[0].x).toEqual(1);
      expect(path[0].y).toEqual(2);
      expect(path[2].x).toEqual(1);
      expect(path[2].y).toEqual(4);
      done();
    }

    const easyStar = new EasyStar();
    const map = [
      [1, 1, 0, 1, 1],
      [1, 1, 0, 1, 1],
      [1, 1, 0, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
    ];

    easyStar.setGrid(map);

    easyStar.avoidAdditionalPoint(2, 3);

    easyStar.setAcceptableTiles([1]);

    easyStar.findPath(1, 2, 3, 2, onPathFound);

    easyStar.calculate();
  });

  it('It should work with diagonals', done => {
    function onPathFound(path) {
      expect(path).not.toBeNull();
      expect(path.length).toEqual(5);
      expect(path[0].x).toEqual(0);
      expect(path[0].y).toEqual(0);
      expect(path[1].x).toEqual(1);
      expect(path[1].y).toEqual(1);
      expect(path[2].x).toEqual(2);
      expect(path[2].y).toEqual(2);
      expect(path[3].x).toEqual(3);
      expect(path[3].y).toEqual(3);
      expect(path[4].x).toEqual(4);
      expect(path[4].y).toEqual(4);
      done();
    }

    const easyStar = new EasyStar();
    easyStar.enableDiagonals();
    const map = [
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
    ];

    easyStar.setGrid(map);

    easyStar.setAcceptableTiles([1]);

    easyStar.findPath(0, 0, 4, 4, onPathFound);

    easyStar.calculate();
  });

  it('It should move in a straight line with diagonals', done => {
    function onPathFound(path) {
      expect(path).not.toBeNull();
      for (let i = 0; i < path.length; i++) {
        expect(path[i].y).toEqual(0);
      }
      done();
    }

    const easyStar = new EasyStar();
    easyStar.enableDiagonals();
    const map = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

    easyStar.setGrid(map);

    easyStar.enableDiagonals();

    easyStar.setAcceptableTiles([1]);

    easyStar.findPath(0, 0, 9, 0, onPathFound);

    easyStar.calculate();
  });

  it('It should return empty path when start and end are the same tile.', done => {
    function onPathFound(path) {
      expect(path).not.toBeNull();
      expect(path.length).toEqual(0);
      done();
    }

    const easyStar = new EasyStar();
    const map = [
      [1, 1, 0, 1, 1],
      [1, 1, 0, 1, 1],
      [1, 1, 0, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
    ];

    easyStar.setGrid(map);

    easyStar.setAcceptableTiles([1]);

    easyStar.findPath(1, 2, 1, 2, onPathFound);

    easyStar.calculate();
  });

  it('It should prefer straight paths when possible', done => {
    const easyStar = new EasyStar();
    easyStar.setAcceptableTiles([0]);
    easyStar.enableDiagonals();
    easyStar.setGrid([
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]);

    easyStar.findPath(0, 1, 2, 1, path => {
      expect(path).not.toBeNull();
      expect(path[1].x).toEqual(1);
      expect(path[1].y).toEqual(1);
      done();
    });

    easyStar.calculate();
  });

  it('It should prefer diagonal paths when they are faster', done => {
    const easyStar = new EasyStar();
    const grid = [];
    for (let i = 0; i < 20; i++) {
      grid[i] = [];
      for (let j = 0; j < 20; j++) {
        grid[i][j] = 0;
      }
    }
    easyStar.setGrid(grid);
    easyStar.setAcceptableTiles([0]);
    easyStar.enableDiagonals();

    easyStar.findPath(4, 4, 2, 2, path => {
      expect(path).not.toBeNull();
      expect(path.length).toEqual(3);
      expect(path[1].x).toEqual(3);
      expect(path[1].y).toEqual(3);
      done();
    });

    easyStar.calculate();
  });

  it('It should handle tiles with a directional condition', done => {
    const easyStar = new EasyStar();
    const grid = [
      [0, 1, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    easyStar.setGrid(grid);
    easyStar.enableDiagonals();
    easyStar.setAcceptableTiles([0]);
    easyStar.setDirectionalCondition(2, 1, [TOP]);
    easyStar.setDirectionalCondition(1, 2, [TOP_RIGHT]);
    easyStar.setDirectionalCondition(2, 2, [LEFT]);
    easyStar.setDirectionalCondition(1, 1, [BOTTOM_RIGHT]);
    easyStar.setDirectionalCondition(0, 1, [RIGHT]);
    easyStar.setDirectionalCondition(0, 0, [BOTTOM]);

    easyStar.findPath(2, 0, 0, 0, path => {
      expect(path).not.toBeNull();
      expect(path.length).toEqual(7);
      expect(path[3]).toEqual({x: 2, y: 2});
      done();
    });

    easyStar.calculate();
  });

  it('It should handle tiles with a directional condition and no corner cutting', done => {
    const easyStar = new EasyStar();
    easyStar.disableCornerCutting();
    const grid = [
      [0, 1, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    easyStar.setGrid(grid);
    easyStar.enableDiagonals();
    easyStar.setAcceptableTiles([0]);
    easyStar.setDirectionalCondition(2, 1, [TOP]);
    easyStar.setDirectionalCondition(1, 1, [RIGHT]);
    easyStar.setDirectionalCondition(0, 1, [RIGHT]);
    easyStar.setDirectionalCondition(0, 0, [BOTTOM]);

    easyStar.findPath(2, 0, 0, 0, path => {
      expect(path).not.toBeNull();
      expect(path.length).toEqual(5);
      expect(path[2]).toEqual({x: 1, y: 1});
      done();
    });

    easyStar.calculate();
  });
});
