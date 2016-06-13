/*jslint this, browser */
/*global window, Arcadia, sona, Maze*/

/**
 * TODO
 * [ ] Allow keyboard control
 * [ ] Add maze exit
 * [ ] Color the background once the "ball" has left an open square
 * [ ] Create a "level select" scene; allow changing size of maze
 */

(function (root) {
    'use strict';

    var GameScene = function (options) {
        Arcadia.Scene.apply(this, arguments);

        options = options || {};

        // Arcadia.cycleBackground();
        this.color = 'white';

        this.maze = new Maze({
            size: {width: 275, height: 275},
            color: 'red'
        });
        this.add(this.maze);
    };

    GameScene.prototype = new Arcadia.Scene();

    GameScene.prototype.update = function (delta) {
        Arcadia.Scene.prototype.update.call(this, delta);
    };

    GameScene.prototype.onPointStart = function (points) {
        Arcadia.Scene.prototype.onPointStart.call(this, points);

        var cursor = points[0];
        this.previousAngleInRadians = Math.atan2(this.maze.position.y - cursor.y, this.maze.position.x - cursor.x);
    };

    GameScene.prototype.onPointMove = function (points) {
        Arcadia.Scene.prototype.onPointMove.call(this, points);

        if (this.previousAngleInRadians) {
            var cursor = points[0];
            var angleInRadians = Math.atan2(this.maze.position.y - cursor.y, this.maze.position.x - cursor.x);
            var diff = this.previousAngleInRadians - angleInRadians;

            this.maze.rotation -= diff;

            this.previousAngleInRadians = angleInRadians;
        }
    };

    GameScene.prototype.onPointEnd = function (points) {
        Arcadia.Scene.prototype.onPointEnd.call(this, points);

        this.previousAngleInRadians = null;
    };

    root.GameScene = GameScene;
}(window));
