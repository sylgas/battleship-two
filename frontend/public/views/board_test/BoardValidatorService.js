angular.module('application.services').
    service('BoardValidatorService', function() {
        this.configuration = {
            sizes: [1,2,3,4],
            amount: [4,3,2,1]
        };

        this.validate = function(rects, callback) {
            var res = this.getShipSizes(rects, callback);

            for (var i = 0; i < this.configuration.sizes.length; i++) {
                var index = this.configuration.sizes[i]-1;
                if(res[index] !== this.configuration.amount[index]) {
                    document.getElementById("readyToPlay").disabled = true;
                    return res;
                }
            }

            if(res[this.configuration.sizes.length] !== 0) {
                document.getElementById("readyToPlay").disabled = true;
            } else {
                document.getElementById("readyToPlay").disabled = false;
            }
            return res;
        }

        this.getShipSizes = function(rects, callback) {
            var i = 0;
            var j = 0;
            var current_ships = Array.apply(null, {length: this.configuration.sizes.length+1}).map(function () { return 0; });
            while(i < 10) {
                while (j < 10) {
                    var size = getShipSize(i, j, callback);
                    if(this.configuration.sizes.indexOf(size) > -1) {
                        current_ships[size-1] += 1;
                    } else if(size > 0) {
                        current_ships[this.configuration.sizes.length] += 1;
                    }
                    j += 1;
                }
                i += 1;
                j = 0;
            }
            return current_ships;
        };

        var getShipSize = function(i, j, callback) {
            var size = 0;
            if(callback(i, j) && !callback(i, j+1) && !callback(i+1, j)) {
                var offset = 1;
                while(callback(i-offset, j)) {
                    offset++;
                }
                size = offset;
                offset = 1;
                while(callback(i, j-offset)) {
                    offset++;
                }
                size = (size >= offset ? size : offset);
            }
            return size;
        };

    });