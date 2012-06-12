(function(g) {
    'use strict';

    function Unloadable(offset, el) {
        if (!(this instanceof Unloadable)) {
            return new Unloadable(offset, el);
        }
        this.offset = offset;
        this.el = el;
        this.originDisplay = el.style.display || '';
    }

    Unloadable.prototype = {
        offsetBottom: function(dy) {
            return this.offset.bottom + dy;
        },
        offsetTop: function(dy) {
            return this.offset.top + dy;
        },
        inside: function() {
            this.el.style.display = this.originDisplay;
        },
        outside: function() {
            this.el.style.display = 'none';
        },
        absolutePosition: function(top) {
            this.originPosition = this.el.style.position || '';
            this.originTop = this.el.style.top || '0px';

            this.el.style.position = 'absolute';
            this.el.style.top = (top || this.offset.top) + 'px';
        },
        revertPosition: function() {
            this.el.style.position = this.originPosition;
            this.el.style.top = this.originTop;
        }
    };

    function offset(el, base) {
        var top = el.offsetTop,
            bottom = top + el.offsetHeight;

        while (el = el.offsetParent) {
            if (el === base) {
                break;
            }

            top += el.offsetTop;
            bottom += el.offsetTop;
        }

        return { top: top, bottom: bottom };
    }

    var ratio = 0.7;

    function Unloader(wrapper, selector) {
        if (!(this instanceof Unloader)) {
            return new Unloader(wrapper, selector);
        }

        var height = wrapper.clientHeight;

        this.scroller = wrapper.firstElementChild;
        this.borderTop = -(ratio * height);
        this.borderBottom = height + (ratio * height);
        this.unloadables = [].slice.call(wrapper.querySelectorAll(selector)).map(function(el) {
            return new Unloadable(offset(el, wrapper), el);
        });
    }

    function setup(x, y) {
        var ceil = -1,
            floor = this.unloadables.length,
            borderTop = this.borderTop,
            borderBottom = this.borderBottom,
            CEILING = 0,
            FLOOR = 1,
            state = CEILING,
            scroller = this.scroller;

        this.unloadables.forEach(function(u, i, arr) {
            if (state === CEILING) {
                if (u.offsetBottom(y) < borderTop) {
                    ceil = i;
                    u.outside();
                } else {
                    state = FLOOR;
                    u.inside();
                }
            } else if (state === FLOOR) {
                if (u.offsetTop(y) > borderBottom) {
                    u.outside();
                    floor = Math.min(floor, i);
                } else {
                    u.inside();
                }
            }
            u.absolutePosition();

            if (arr.length - 1 === i) {
                scroller.style.height = u.offset.bottom + 'px';
            }
        });
        this.bx = x;
        this.by = y;
        this.ceil = ceil;
        this.floor = floor;
    }

    function reset() {
        this.unloadables.forEach(function(u) {
            u.revertPosition();
        });
    }

    function onmove(nx, ny) {
        if (this.by === ny) {
            return;
        }

        var dir = ny < this.by ? 'downward' : 'upward';

        if (dir === 'downward') {
            for (var i = this.ceil + 1; i < this.unloadables.length; i++) {
                var u = this.unloadables[i];
                if (u.offsetBottom(ny) < this.borderTop) {
                    u.outside();
                    this.ceil = i;
                } else {
                    break;
                }
            }
            for (var i = this.floor; i < this.unloadables.length; i++) {
                var u = this.unloadables[i];
                if (u.offsetTop(ny) < this.borderBottom) {
                    u.inside();
                    this.floor++;
                } else {
                    break;
                }
            }
        } else if (dir === 'upward') {
            for (var i = this.ceil; i >= 0; i--) {
                var u = this.unloadables[i];
                if (!u || u.offsetBottom(ny) < this.borderTop) {
                    break;
                } else {
                    u.inside();
                    this.ceil--;
                }
            }
            for (var i = this.floor - 1; i >= 0; i--) {
                var u = this.unloadables[i];
                if (u.offsetTop(ny) < this.borderBottom) {
                    break;
                } else {
                    u.outside();
                    this.floor--;
                }
            }
        }
        this.bx = nx;
        this.by = ny;
    }

    Unloader.prototype = {
        setup: setup,
        reset: reset,
        onmove: onmove
    };

    g.Unloader = Unloader;

})(this);
