(function(g) {
    'use strict';

    var _count = 0,
        _elapse = 0,
        _start = 0;

    function init() {
        _count = _elapse = 0;
        _start = Date.now();
    }

    function fps() {
        if (_elapse > 300) {
            return _count / (_elapse / 1000);
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
