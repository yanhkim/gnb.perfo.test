(function(g) {
    'use strict';

    var _count = 0,
        _elapse = 0,
        _start = 0,
        _samples = [];

    function init() {
        _count = _elapse = 0;
        _start = Date.now();
        _samples = [];
    }

    function fps() {
        if (_elapse > 300) {
            var cur = _count / (_elapse / 1000);
            _samples.push(cur);
            return {
                cur: cur,
                max: Math.max.apply(null, _samples),
                min: Math.min.apply(null, _samples),
                avg: _samples.reduce(function(a, b) { return a + b }) / _samples.length
            };
        }
    }

    g.fpschecker = {
        start: function() {
            init();
            return this;
        },
        end: function() {
            return fps();
        },
        tick: function() {
            var now = Date.now();

            _count++;
            _elapse = now - _start;
            //console.log(_elapse, _count);

            return fps();
        }
    };
})(this);
