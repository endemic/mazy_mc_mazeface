/*jslint this: true, browser: true, for: true */
/*global Arcadia, window */

(function (root) {
    'use strict';

    var Maze;

    Maze = function (options) {
        Arcadia.Shape.apply(this, arguments);

        this.mazeData = [];
        this.mazeSize = options.mazeSize || 20;
        var start = this.mazeSize + 2;

        while (this.mazeData.length < Math.pow(this.mazeSize, 2)) {
            this.mazeData.push(Maze.WALL);
        }

        // Carve maze here
        // Choose random start point within border
        // Make that index value 0
        // Randomly choose to move in one of 4 directions, as long as the new index meets criteria:
        // 1. only has one open block next to it

        function carve(index, data) {
            if (!index) {
                return;
            }

            var size = Math.sqrt(data.length);

            var top = index - size;
            var bottom = index + size;

            // Handle top/bottom going out of range
            if (top < 0) {
                top = undefined;
            }

            if (bottom > data.length) {
                bottom = undefined;
            }

            var left = index - 1;
            var right = index + 1;

            // Handle left/right going out of range
            if (Math.floor(left / size) !== Math.floor(index / size)) {
                left = undefined;
            }

            if (Math.floor(right / size) !== Math.floor(index / size)) {
                right = undefined;
            }

            var directions = [top, bottom, left, right];

            // Check if this cell is valid to carve
            var valid = true;
            var openNeighbors = 0;
            directions.forEach(function (index) {
                // This condition would occur if the algorithm tried to pass thru a border
                if (data[index] === undefined) {
                    valid = false;
                }

                if (data[index] === 0) {
                    openNeighbors += 1;
                }
            });

            // If not, die
            if (!valid || openNeighbors > 1) {
                return;
            }

            // If so, carve, then move on
            data[index] = Maze.EMPTY;

            // randomly decide which direction to move first
            directions.sort(function (a, b) {
                return Math.random() > 0.5 ? 1 : -1;
            }).forEach(function (index) {
                carve(index, data);
            });
        }

        // TODO: don't hard-code the starting spot
        // or do, see if I care
        carve(start, this.mazeData);

        // Find the finish spot -- try the opposite side of the puzzle
        // This is a stupid algorithm
        function createFinish(index, data) {
            if (data[index] === Maze.EMPTY) {
                data[index] = Maze.FINISH;
                return;
            }

            var next = index - 1;
            createFinish(next, data);
        }

        var finish = this.mazeData.length - this.mazeSize - 2;
        createFinish(finish, this.mazeData);

        var pixelSize = this.size.width / this.mazeSize;
        var originX = -this.size.width / 2;
        var originY = -this.size.height / 2;

        var x = start % this.mazeSize;
        var y = Math.floor(start / this.mazeSize);

        this.ball = new Arcadia.Shape({
            size: {width: pixelSize - 1, height: pixelSize - 1},
            color: 'lime',
            position: {
                x: originX + (x * pixelSize) + pixelSize / 2,
                y: originY + (y * pixelSize) + pixelSize / 2
            }
        });
        this.add(this.ball);
    };

    Maze.EMPTY = 0;
    Maze.WALL = 1;
    Maze.VISITED = 2;
    Maze.START = 8;
    Maze.FINISH = 9;

    Maze.prototype = new Arcadia.Shape();

    Maze.prototype.path = function (context) {
        var size = Math.sqrt(this.mazeData.length);
        var pixelSize = this.size.width / size * Arcadia.PIXEL_RATIO;

        var originX = -this.size.width / 2 * Arcadia.PIXEL_RATIO;
        var originY = -this.size.height / 2 * Arcadia.PIXEL_RATIO;

        this.mazeData.forEach(function (value, index) {
            if (value === Maze.EMPTY) {
                return;
            }

            var x = index % size;
            var y = Math.floor(index / size);

            // TODO: don't hard-code these colors
            var colors = {};
            colors[Maze.WALL] = 'red';
            colors[Maze.VISITED] = 'lightblue';
            colors[Maze.START] = 'purple';
            colors[Maze.FINISH] = 'green';

            context.fillStyle = colors[value];

            context.fillRect(originX + (x * pixelSize),
                             originY + (y * pixelSize),
                             pixelSize,
                             pixelSize);
        });
    };

    Maze.prototype.update = function (delta) {
        Arcadia.Shape.prototype.update.call(this, delta);

        var gravity = {
            y: Math.cos(this.rotation),
            x: Math.sin(this.rotation)
        };

        // TODO: move ball based on gravity here
        // move x + gravity; if collsion, revert to previous x position
        // move y + gravity; if collsion, revert to previous y position
        var previousPosition = {
            x: this.ball.position.x,
            y: this.ball.position.y
        };
        var collision = false;

        this.ball.position.x += gravity.x;
        this.mazeData.forEach(function (value, index) {
            if (collision || value !== Maze.WALL) {
                return;
            }

            var size = Math.sqrt(this.mazeData.length);
            var pixelSize = this.size.width / size;
            var originX = -this.size.width / 2;
            var originY = -this.size.height / 2;

            var x = index % size;
            var y = Math.floor(index / size);

            var other = {
                size: {width: pixelSize, height: pixelSize},
                position: {
                    x: originX + (x * pixelSize) + pixelSize / 2,
                    y: originY + (y * pixelSize) + pixelSize / 2
                }
            }
            if (this.ball.collidesWith(other)) {
                collision = true;

                if (value === Maze.FINISH) {
                    console.log('FINISH!!!!');
                }
            }
        }.bind(this));

        if (collision) {
            this.ball.position.x = previousPosition.x;
        }

        collision = false;

        this.ball.position.y += gravity.y;
        this.mazeData.forEach(function (value, index) {
            if (collision || value !== Maze.WALL) {
                return;
            }

            var pixelSize = this.size.width / this.mazeSize;
            var originX = -this.size.width / 2;
            var originY = -this.size.height / 2;

            var x = index % this.mazeSize;
            var y = Math.floor(index / this.mazeSize);

            var other = {
                size: {width: pixelSize, height: pixelSize},
                position: {
                    x: originX + (x * pixelSize) + pixelSize / 2,
                    y: originY + (y * pixelSize) + pixelSize / 2
                }
            }
            if (this.ball.collidesWith(other)) {
                collision = true;

                if (value === Maze.FINISH) {
                    console.log('FINISH!!!!');
                }
            }
        }.bind(this));

        if (collision) {
            this.ball.position.y = previousPosition.y;
        }

        // Add "visited" path
        var pixelSize = this.size.width / this.mazeSize;
        var x = Math.floor((this.ball.position.x + this.size.width / 2) / pixelSize);
        var y = Math.floor((this.ball.position.y + this.size.width / 2) / pixelSize);
        var index = y * this.mazeSize + x;

        if (this.mazeData[index] !== Maze.VISITED) {
            this.mazeData[index] = Maze.VISITED;
            this.dirty = true;
        }
    }

    root.Maze = Maze;
}(window));
