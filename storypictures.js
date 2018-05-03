/*                                              _____      ___
 * ███████╗████████╗ ██████╗ ██████╗ ██╗   ██╗ |_   _|    | _ \
 * ██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗╚██╗ ██╔╝   | |  ___ |   /
 * ███████╗   ██║   ██║   ██║██████╔╝ ╚████╔╝    |_| / __||_|_\
 * ╚════██║   ██║   ██║   ██║██╔══██╗  ╚██╔╝        | (_ |
 * ███████║   ██║   ╚██████╔╝██║  ██║   ██║          \___|
 * ╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝   ╚═╝     TheGreatRambler
 * ██████╗ ██╗ ██████╗████████╗██╗   ██╗██████╗ ███████╗███████╗
 * ██╔══██╗██║██╔════╝╚══██╔══╝██║   ██║██╔══██╗██╔════╝██╔════╝
 * ██████╔╝██║██║        ██║   ██║   ██║██████╔╝█████╗  ███████╗
 * ██╔═══╝ ██║██║        ██║   ██║   ██║██╔══██╗██╔══╝  ╚════██║
 * ██║     ██║╚██████╗   ██║   ╚██████╔╝██║  ██║███████╗███████║
 * ╚═╝     ╚═╝ ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝
 * -------------------------------------------------------------
 * Brought to you by the programming virtuoso TheGreatRambler
 * Copyright 2018 MIT
 */

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['ROT'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('ROT'));
    } else {
        root.storypictures = factory(root.ROT);
    }
}(typeof self !== 'undefined' ? self : this, function(ROT) {
    function storypictures(data) {
        var canvas;
        var context;
        if (data.img instanceof HTMLImageElement) {
            canvas = document.createElement('canvas');
            canvas.width = data.img.width;
            canvas.height = data.img.height;
            context = canvas.getContext('2d');
            context.drawImage(data.img, 0, 0);
        } else if (data.img instanceof CanvasRenderingContext2D) {
            canvas = data.img.canvas;
            context = data.img;
        } else {
            throw new TypeError("Image must context or image element");
        }
        
        // used to remove linebreaks
        data.story = data.story.replace(/(?:\r\n|\r|\n)/g, "");

        if (!data.tileOpen) {
            data.tileOpen = function(red, green, blue, alpha) {
                var luma = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
                if (luma < 40) {
                    return false;
                } else {
                    return true;
                }
            };
        }


        var startscale = 1;
        var dataattempt1 = getVariousData(startscale);
        var scaleattempt1 = Math.sqrt(data.story.length / (dataattempt1.spotsopen * 2)) * startscale;
        var dataattempt2 = getVariousData(scaleattempt1);
        var scaleattempt2 = Math.sqrt(data.story.length / (dataattempt2.spotsopen * 2)) * scaleattempt1;
        var datafinal = getVariousData(scaleattempt2);
        var returncontext = startdrawing(datafinal, data.story);
        
        return returncontext;

        function checkEndian() {
            var b = new ArrayBuffer(4);
            var a = new Uint32Array(b);
            var c = new Uint8Array(b);
            a[0] = 0xdeadbeef;
            if (c[0] == 0xef) return true;
            if (c[0] == 0xde) return false;
        }

        function getVariousData(scalefactor) {
            var dataarray = [];
            var numofopenspots = 0;

            var tempCtx = document.createElement('canvas').getContext('2d');

            tempCtx.canvas.width = Math.round(canvas.width * scalefactor);
            tempCtx.canvas.height = Math.round(canvas.height * scalefactor);

            tempCtx.drawImage(canvas, 0, 0, tempCtx.canvas.width, tempCtx.canvas.height);

            data32 = new Uint32Array(tempCtx.getImageData(0, 0, tempCtx.canvas.width, tempCtx.canvas.height).data.buffer);

            var littleEndian = checkEndian();
            for (i = 0; i < data32.length; i++) {
                var x = i % tempCtx.canvas.width;
                var y = (i / tempCtx.canvas.width) | 0;
                var indextoplace = szudzik(x, y);
                var red;
                var green;
                var blue;
                var alpha;

                if (littleEndian) {
                    red = data32[i] & 0x000000FF;
                    green = data32[i] >> 8 & 0x000000FF;
                    blue = data32[i] >> 16 & 0x000000FF;
                    alpha = data32[i] >> 24 & 0x000000FF;
                } else {
                    red = data32[i] >> 24 & 0x000000FF;
                    green = data32[i] >> 16 & 0x000000FF;
                    blue = data32[i] >> 8 & 0x000000FF;
                    alpha = data32[i] & 0x000000FF;
                }

                if (data.tileOpen(red, green, blue, alpha)) {
                    numofopenspots++;
                    if (data.color) {
                        dataarray[indextoplace] = "rgb(" + red + "," + green + "," + blue + ");";
                    } else {
                        dataarray[indextoplace] = true;
                    }
                }
            }

            return {
                pixels: dataarray,
                spotsopen: numofopenspots,
                width: tempCtx.canvas.width,
                height: tempCtx.canvas.height,
            };
        }

        function szudzik(xx, yy) {
            var number = (xx >= yy) ? (xx * xx + xx + yy) : (yy * yy + xx);
            return number;
        }
        
        function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}
        
        function joinmultiarray(array) {
            var memarray = [];
            array.forEach(function(value) {
                memarray.push(value.join(""));
            });
            return memarray.join("\n");
        }

        function startdrawing(thedata, texttouse) {
            var display = new ROT.Display({
                width: thedata.width * 2,
                height: thedata.height,
                forceSquareRatio: false,
                fontSize: 12,
                bg: "#FFFFFF",
                fg: "#000000"
            });
            var currentindexoftext = 0;
            var storyisarray = (texttouse.constructor === Array);
            var outputtext = createArray(thedata.width * 2, thedata.height);
            function drawthething(xxx, yyy, color) {
                if (storyisarray) {
                    if (Object.prototype.toString.call(texttouse[currentindexoftext]) === '[object Object]') {
                        if (texttouse[currentindexoftext].c) {
                            display.draw(xxx, yyy, texttouse[currentindexoftext].n, texttouse[currentindexoftext].c);
                            outputtext[xxx][yyy] = texttouse[currentindexoftext].n;
                        } else {
                            display.draw(xxx, yyy, texttouse[currentindexoftext]);
                            outputtext[xxx][yyy] = texttouse[currentindexoftext];
                        }
                    } else {
                        if (color) {
                            display.draw(xxx, yyy, texttouse[currentindexoftext], color);
                            outputtext[xxx][yyy] = texttouse[currentindexoftext];
                        } else {
                            display.draw(xxx, yyy, texttouse[currentindexoftext]);
                            outputtext[xxx][yyy] = texttouse[currentindexoftext];
                        }
                    }
                } else {
                    if (color) {
                        display.draw(xxx, yyy, texttouse.charAt(currentindexoftext), color);
                        outputtext[xxx][yyy] = texttouse.charAt(currentindexoftext);
                    } else {
                        display.draw(xxx, yyy, texttouse.charAt(currentindexoftext));
                        outputtext[xxx][yyy] = texttouse.charAt(currentindexoftext);
                    }
                }
                currentindexoftext++;
            }
            for (var y = 0; y < thedata.height; y++) {
                for (var x = 0; x < thedata.width; x++) {
                    var use = thedata.pixels[szudzik(x, y)];
                    if (use) {
                        if (data.color) {
                            drawthething(x * 2, y, use);
                            drawthething(x * 2 + 1, y, use);
                        } else {
                            drawthething(x * 2, y);
                            drawthething(x * 2 + 1, y);
                        }
                    }
                }
            }

            return {
                context: display._context,
                text: joinmultiarray(outputtext)
            };
        }
    }
    return storypictures;
}));
