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
}(typeof self !== 'undefined' ? self : this, function(b) {
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
            canvas = data.img.context;
            context = data.img;
        } else {
            throw new TypeError("Image must be canvas, context, or image element");
        }

        if (!data.solidityFunc) {
            data.solidityFunc = function(red, green, blue, alpha) {
                var luma = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
                if (luma < 40) {
                    return true;
                } else {
                    return false;
                }
            };
        }


        var startscale = 1;
        var dataattempt1 = getVariousData(startscale, data.solidityFunc);
        var scaleattempt1 = Math.sqrt(data.story.length / (dataattempt1.spotsopen * 2)) * startscale;
        var dataattempt2 = getVariousData(scaleattempt1, data.solidityFunc);
        var scaleattempt2 = Math.sqrt(data.story.length / (dataattempt2.spotsopen * 2)) * scaleattempt1;
        var datafinal = getVariousData(scaleattempt2, data.solidityFunc);
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

        function getVariousData(scalefactor, solidness) {
            var dataarray = [];
            var numofopenspots = 0;

            var tempCtx = document.createElement('canvas').getContext('2d');

            tempCtx.mozImageSmoothingEnabled = false;
            tempCtx.webkitImageSmoothingEnabled = false;
            tempCtx.msImageSmoothingEnabled = false;
            tempCtx.imageSmoothingEnabled = false;

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

                if (solidness(red, green, blue, alpha)) {
                    dataarray[indextoplace] = false;
                } else {
                    numofopenspots++;
                    dataarray[indextoplace] = true;
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

            for (var y = 0; y < thedata.height; y++) {
                for (var x = 0; x < thedata.width; x++) {
                    var use = thedata.pixels[szudzik(x, y)];
                    if (use) {
                        display.draw(x * 2, y, texttouse.charAt(currentindexoftext));
                        currentindexoftext++;
                        display.draw(x * 2 + 1, y, texttouse.charAt(currentindexoftext));
                        currentindexoftext++;
                    }
                }
            }

            return display._context;
        }
    }
    return storypictures;
}));
