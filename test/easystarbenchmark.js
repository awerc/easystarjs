const {EasyStar} = require('../src/easystar');

let easyStar;

function onPathFound() {}
function setup10x10maze() {
  easyStar = new EasyStar();
  const map = [
    [1, 1, 1, 1, 1, 0, 1, 0, 1, 1],
    [0, 0, 0, 0, 1, 0, 1, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [0, 0, 0, 1, 0, 1, 0, 1, 1, 1],
    [0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
  ];

  easyStar.setGrid(map);
  easyStar.setAcceptableTiles([1]);
  easyStar.enableSync();
}
function setup10x10field() {
  easyStar = new EasyStar();
  const map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  easyStar.setGrid(map);
  easyStar.setAcceptableTiles([1]);
  easyStar.enableSync();
}
function setup1000x1000field() {
  easyStar = new EasyStar();
  const map = [];
  for (let y = 0; y < 1000; y++) {
    const row = [];
    for (let x = 0; x < 1000; x++) {
      row.push(1);
    }
    map.push(row);
  }

  easyStar.setGrid(map);
  easyStar.setAcceptableTiles([1]);
  easyStar.enableSync();
}

suite('js', () => {
  benchmark('10x10 maze no diagonals', {
    fn() {
      easyStar.findPath(0, 0, 9, 0, onPathFound);
      easyStar.calculate();
    },
    setup() {
      setup10x10maze();
      easyStar.disableDiagonals();
      easyStar.disableCornerCutting();
    },
  });
  benchmark('10x10 maze diagonals but no corner-cutting', {
    fn() {
      easyStar.findPath(0, 0, 9, 0, onPathFound);
      easyStar.calculate();
    },
    setup() {
      setup10x10maze();
      easyStar.enableDiagonals();
      easyStar.disableCornerCutting();
    },
  });
  benchmark('10x10 maze diagonals and corner-cutting', {
    fn() {
      easyStar.findPath(0, 0, 9, 0, onPathFound);
      easyStar.calculate();
    },
    setup() {
      setup10x10maze();
      easyStar.enableDiagonals();
      easyStar.enableCornerCutting();
    },
  });
  benchmark('10x10 field no diagonals', {
    fn() {
      easyStar.findPath(0, 0, 9, 9, onPathFound);
      easyStar.calculate();
    },
    setup() {
      setup10x10field();
      easyStar.disableDiagonals();
      easyStar.disableCornerCutting();
    },
  });
  benchmark('10x10 field diagonals but no corner-cutting', {
    fn() {
      easyStar.findPath(0, 0, 9, 9, onPathFound);
      easyStar.calculate();
    },
    setup() {
      setup10x10field();
      easyStar.enableDiagonals();
      easyStar.disableCornerCutting();
    },
  });
  benchmark('10x10 field diagonals and corner-cutting', {
    fn() {
      easyStar.findPath(0, 0, 9, 9, onPathFound);
      easyStar.calculate();
    },
    setup() {
      setup10x10field();
      easyStar.enableDiagonals();
      easyStar.enableCornerCutting();
    },
  });
  benchmark('1000x1000 field no diagonals', {
    fn() {
      easyStar.findPath(0, 0, 999, 999, onPathFound);
      easyStar.calculate();
    },
    setup() {
      setup1000x1000field();
      easyStar.disableDiagonals();
      easyStar.disableCornerCutting();
    },
  });
  benchmark('1000x1000 field diagonals but no corner-cut', {
    fn() {
      easyStar.findPath(0, 0, 999, 999, onPathFound);
      easyStar.calculate();
    },
    setup() {
      setup1000x1000field();
      easyStar.enableDiagonals();
      easyStar.disableCornerCutting();
    },
  });
  benchmark('1000x1000 field diagonals and corner-cut', {
    fn() {
      easyStar.findPath(0, 0, 999, 999, onPathFound);
      easyStar.calculate();
    },
    setup() {
      setup1000x1000field();
      easyStar.enableDiagonals();
      easyStar.enableCornerCutting();
    },
  });
});
