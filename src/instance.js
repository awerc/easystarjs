/**
 * Represents a single instance of EasyStar.
 * A path that is in the queue to eventually be found.
 */
module.exports = function instance() {
  this.pointsToAvoid = {};
  this.startX = undefined;
  this.callback = undefined;
  this.startY = undefined;
  this.endX = undefined;
  this.endY = undefined;
  this.nodeHash = {};
  this.openList = undefined;
};
