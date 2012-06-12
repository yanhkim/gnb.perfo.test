(function(g, d) {

// add class, remove class
(function() {
    var modern = {
        addClass: function(c) {
            return this.classList.add(c);
        },
        removeClass: function(c) {
            return this.classList.remove(c);
        },
        hasClass: function(c) {
            return this.classList.contains(c);
        }
    }, older = {
        addClass: function(c) {
            if (this.className === '') {
                this.className = c;
            } else if (!this.hasClass(c)) {
                this.className += ' ' + c;
            }
        },
        removeClass: function(c) {
            this.className = this.className.split(/\s+/).filter(function(a) { return a !== c; }).join(' ');
        },
        hasClass: function(c) {
            return this.className.split(/\s+/).indexOf(c) >= 0;
        }
    };

    var methods = d.body.classList ? modern : older;
    for (var i in methods) {
        HTMLElement.prototype[i] = methods[i];
    }
})();

function slide(opts) {
    var ltr = opts.direction === 'ltr' ? true : false;

    if (ltr) {
        opts.vanish.addClass('hide-to-right');
        opts.appear.removeClass('hide-to-left');
    } else {
        opts.vanish.addClass('hide-to-left');
        opts.appear.removeClass('hide-to-right');
    }
}

var $ = function(i) { return d.getElementById(i); },
    tmpl = function(template, data) {
        var t = TEMPLATES[template];
        if (!t || !data)
            return;

        return t.render(data);
    },
    loading = false,
    masterScroll, detailScroll;

function loadFeeds() {
    if (loading)
        return;

    loading = true;

    myapi.flickrfeeds(function(items) {
        var html = '';
        items.forEach(function(item) {
            item.url = '#/detail/' + item.id;
            html += tmpl('feed', item);
        });

        // to make loooooong list :$
        html = html + html;
        html = html + html;
        html = html + html;

        $('listview').innerHTML = html;

        // TODO iscroll setup
        masterScroll = new iScroll(d.querySelector('#page-master .scroller'), {
            onAnimationStart: function() {
                fpschecker.start();
            },
            onAnimation: function() {
                var fps = fpschecker.tick();
                if (!fps) {
                    return;
                }   
                $('fps').textContent = Math.floor(fps * 100) / 100;
            },
            onAnimationEnd: function() {
                fpschecker.end();
            }
        });
    });
}

// starting point :D
loadFeeds();

tappable('#page-master #listview li.feed>a', {
    activeClassDelay: 80,
    inactiveClassDelay: 100,
    onTap: function(e, target) {
        location.hash = target.hash;
    }
});

tappable('a.header-back-button', {
    noScroll: true,
    onTap: function(e, target) {
        location.hash = target.hash;
    }
});

var currentView = null,
    routes = {
    '/': function() {
        if (currentView === 'master') {
            return false;
        }

        slide({
            appear: $('page-master'),
            vanish: $('page-detail'),
            direction: 'ltr'
        });

        // initial call ad hoc
        if (currentView === null) {
            g.setTimeout(function() {
                [].slice.call(d.querySelectorAll('.page')).forEach(function(page) {
                    page.addClass('transition');
                });
            }, 100);
        }
        if (currentView === 'detail') {
            detailScroll && detailScroll.destroy();
            detailScroll = null;
        }
        currentView = 'master';
    },
    '/detail/(\\d+)': function(id) {
        if (currentView === 'detail') {
            return false;
        }

        var detail = $('page-detail').querySelector('section');
        detail.innerHTML = tmpl('detail', myapi.flickritem(id));

        detailScroll = new iScroll(detail);
        detail.querySelector('img').onload = function() {
            detailScroll.refresh();
        };

        slide({
            appear: $('page-detail'),
            vanish: $('page-master'),
            direction: 'rtl'
        });

        currentView = 'detail';
    }
};

Router(routes).configure({
    notfound: function() {
        location.hash = '/';
    }
}).init('/');


})(this, document);
