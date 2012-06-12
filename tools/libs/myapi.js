(function(g) {

'use strict';

var feed_uri = 'http://api.flickr.com/services/feeds/photos_public.gne?format=rss_200';

var parse = g.ax ? ax.util.parseXML : function(s) {
    return new DOMParser().parseFromString(s, 'text/xml');
};

var xhr = (g.ax && g.ax.ext && g.ax.ext.net) ? g.ax.ext.net.get
    : function(url, cb) {
        var _xhr = new XMLHttpRequest();
        _xhr.onload = function() {
            cb(_xhr.responseText);
        };
        _xhr.open('GET', url);
        _xhr.send();
    };

function Item(_item) {
    this._item = _item;
}
Item.prototype.content = function(sel) {
    return this._item.querySelector(sel).textContent;
};
Item.prototype.attr = function(sel, attr) {
    return this._item.querySelector(sel).getAttribute(attr);
};

function flickrfeeds(done) {
    xhr(feed_uri, function(data) {
        var doc = parse(data),
            items = [].slice.call(doc.querySelectorAll('item'));

        done(items.map(function(item) {
            item = new Item(item);
            return {
                link: item.content('link'),
                title: item.content('title'),
                thumbnail: item.attr('thumbnail', 'url'),
                id: item.content('guid').split('/').pop(),
                credit: item.content('credit'),
                // dummy text...
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean tempus lectus ut mauris pretium in aliquam tortor cursus.'
            };
        }));
    });
}

function flickritem(id) {
    return 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean tempus lectus ut mauris pretium in aliquam tortor cursus.';
}

g.myapi = {
    flickrfeeds: flickrfeeds,
    flickritem: flickritem
};

})(this);
