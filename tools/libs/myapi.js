(function(g) {

'use strict';

var feed_uri = 'flickr.rss';

var parse = g.ax ? ax.util.parseXML : function(s) {
    return new DOMParser().parseFromString(s, 'text/xml');
};

var xhr = function(url, cb) {
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

var cache;

function flickrfeeds(done) {
    xhr(feed_uri, function(data) {
        var doc = parse(data),
            items = [].slice.call(doc.querySelectorAll('item'));

        cache = items.map(function(item) {
            item = new Item(item);
            return {
                link: item.content('link'),
                title: item.content('title'),
                thumbnail: item.attr('thumbnail', 'url'),
                id: item.content('guid').split('/').pop(),
                image: item.attr('content', 'url'),
                width: item.attr('content', 'width'),
                height: item.attr('content', 'height'),
                credit: item.content('credit'),
                // dummy text...
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean tempus lectus ut mauris pretium in aliquam tortor cursus.'
            };
        });

        done(cache);
    });
}

function flickritem(id) {
    var item = cache.filter(function(item) { return item.id === id; })[0];

    return {
       image: item.image,
       alt: item.title,
       p1: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam porta lobortis nisi, in imperdiet magna porta sit amet. Nunc porta volutpat nulla, quis tincidunt libero pulvinar vitae. Sed lobortis, erat vestibulum fermentum dictum, tellus ligula eleifend nibh, ac dapibus dui dolor in nisl. Aliquam erat volutpat. Praesent ultrices dolor ipsum, varius accumsan massa. Phasellus volutpat consectetur justo lobortis vehicula. Donec et dolor velit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Pellentesque imperdiet sagittis dolor eget hendrerit. Vivamus non est et urna placerat varius nec sed elit. Sed suscipit malesuada mattis. Donec risus ligula, consequat suscipit rutrum eget, eleifend ultrices ante. Quisque elementum, eros non porta ullamcorper, purus lorem fringilla velit, in fermentum ante mi fringilla enim.',
       p2: 'Aenean convallis, nisi quis facilisis posuere, sem tellus fringilla purus, facilisis convallis mi dolor sit amet mauris. Sed pulvinar vestibulum augue non ornare. Vestibulum laoreet ligula ut mi tincidunt cursus. Quisque dignissim condimentum neque non malesuada. Nullam faucibus risus quis mauris congue tincidunt. Vestibulum in urna at urna imperdiet adipiscing nec ut diam. Aliquam nunc libero, consectetur et convallis vel, feugiat id libero. Suspendisse nec ipsum sit amet nunc feugiat sagittis. Ut sagittis tortor eu justo pharetra porttitor. Cras pulvinar facilisis pellentesque. Morbi adipiscing, lorem sit amet tempor convallis, dolor leo vulputate leo, in porta nisl mauris eu odio. Praesent sit amet gravida nibh. Pellentesque aliquet tristique est, et condimentum tellus tempus rhoncus. In aliquam pretium nisi bibendum interdum.'
    };
}

g.myapi = {
    flickrfeeds: flickrfeeds,
    flickritem: flickritem
};

})(this);
