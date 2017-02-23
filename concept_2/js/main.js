/*
 *
 * mads - version 2.00.01
 * Copyright (c) 2015, Ninjoe
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * https://en.wikipedia.org/wiki/MIT_License
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 *
 */
var mads = function (options) {

    var _this = this;

    this.render = options.render;

    /* Body Tag */
    this.bodyTag = document.getElementsByTagName('body')[0];

    /* Head Tag */
    this.headTag = document.getElementsByTagName('head')[0];

    /* json */
    if (typeof json == 'undefined' && typeof rma != 'undefined') {
        this.json = rma.customize.json;
    } else if (typeof json != 'undefined') {
        this.json = json;
    } else {
        this.json = '';
    }

    /* fet */
    if (typeof fet == 'undefined' && typeof rma != 'undefined') {
        this.fet = typeof rma.fet == 'string' ? [rma.fet] : rma.fet;
    } else if (typeof fet != 'undefined') {
        this.fet = fet;
    } else {
        this.fet = [];
    }

    this.fetTracked = false;

    /* load json for assets */
    this.loadJs(this.json, function () {
        _this.data = json_data;

        _this.render.render();
    });

    /* Get Tracker */
    if (typeof custTracker == 'undefined' && typeof rma != 'undefined') {
        this.custTracker = rma.customize.custTracker;
    } else if (typeof custTracker != 'undefined') {
        this.custTracker = custTracker;
    } else {
        this.custTracker = [];
    }

    /* CT */
    if (typeof ct == 'undefined' && typeof rma != 'undefined') {
        this.ct = rma.ct;
    } else if (typeof ct != 'undefined') {
        this.ct = ct;
    } else {
        this.ct = [];
    }

    /* CTE */
    if (typeof cte == 'undefined' && typeof rma != 'undefined') {
        this.cte = rma.cte;
    } else if (typeof cte != 'undefined') {
        this.cte = cte;
    } else {
        this.cte = [];
    }

    /* tags */
    if (typeof tags == 'undefined' && typeof tags != 'undefined') {
        this.tags = this.tagsProcess(rma.tags);
    } else if (typeof tags != 'undefined') {
        this.tags = this.tagsProcess(tags);
    } else {
        this.tags = '';
    }

    /* Unique ID on each initialise */
    this.id = this.uniqId();

    /* Tracked tracker */
    this.tracked = [];
    /* each engagement type should be track for only once and also the first tracker only */
    this.trackedEngagementType = [];
    /* trackers which should not have engagement type */
    this.engagementTypeExlude = [];
    /* first engagement */
    this.firstEngagementTracked = false;

    /* RMA Widget - Content Area */
    this.contentTag = document.getElementById('rma-widget');

    /* URL Path */
    this.path = typeof rma != 'undefined' ? rma.customize.src : '';

    /* Solve {2} issues */
    for (var i = 0; i < this.custTracker.length; i++) {
        if (this.custTracker[i].indexOf('{2}') != -1) {
            this.custTracker[i] = this.custTracker[i].replace('{2}', '{{type}}');
        }
    }
};

/* Generate unique ID */
mads.prototype.uniqId = function () {

    return new Date().getTime();
};

mads.prototype.tagsProcess = function (tags) {

    var tagsStr = '';

    for (var obj in tags) {
        if (tags.hasOwnProperty(obj)) {
            tagsStr += '&' + obj + '=' + tags[obj];
        }
    }

    return tagsStr;
};

/* Link Opner */
mads.prototype.linkOpener = function (url) {

    if (typeof url != "undefined" && url != "") {

        if (typeof this.ct != 'undefined' && this.ct != '') {
            url = this.ct + encodeURIComponent(url);
        }

        if (typeof mraid !== 'undefined') {
            mraid.open(url);
        } else {
            window.open(url);
        }

        if (typeof this.cte != 'undefined' && this.cte != '') {
            this.imageTracker(this.cte);
        }
    }
};

/* tracker */
mads.prototype.tracker = function (tt, type, name, value) {

    /*
     * name is used to make sure that particular tracker is tracked for only once
     * there might have the same type in different location, so it will need the name to differentiate them
     */
    name = name || type;

    if (tt == 'E' && !this.fetTracked && this.fet) {
        for (var i = 0; i < this.fet.length; i++) {
            var t = document.createElement('img');
            t.src = this.fet[i];

            t.style.display = 'none';
            this.bodyTag.appendChild(t);
        }
        this.fetTracked = true;
    }

    if (typeof this.custTracker != 'undefined' && this.custTracker != '' && this.tracked.indexOf(name) == -1) {
        for (var i = 0; i < this.custTracker.length; i++) {
            var img = document.createElement('img');

            if (typeof value == 'undefined') {
                value = '';
            }

            /* Insert Macro */
            var src = this.custTracker[i].replace('{{rmatype}}', type);
            src = src.replace('{{rmavalue}}', value);

            /* Insert TT's macro */
            if (this.trackedEngagementType.indexOf(tt) != '-1' || this.engagementTypeExlude.indexOf(tt) != '-1') {
                src = src.replace('tt={{rmatt}}', '');
            } else {
                src = src.replace('{{rmatt}}', tt);
                this.trackedEngagementType.push(tt);
            }

            /* Append ty for first tracker only */
            if (!this.firstEngagementTracked && tt == 'E') {
                src = src + '&ty=E';
                this.firstEngagementTracked = true;
            }

            /* */
            img.src = src + this.tags + '&' + this.id;

            img.style.display = 'none';
            this.bodyTag.appendChild(img);

            this.tracked.push(name);
        }
    }
};

mads.prototype.imageTracker = function (url) {
    for (var i = 0; i < url.length; i++) {
        var t = document.createElement('img');
        t.src = url[i];

        t.style.display = 'none';
        this.bodyTag.appendChild(t);
    }
};

/* Load JS File */
mads.prototype.loadJs = function (js, callback) {
    var script = document.createElement('script');
    script.src = js;

    if (typeof callback != 'undefined') {
        script.onload = callback;
    }

    this.headTag.appendChild(script);
};

/* Load CSS File */
mads.prototype.loadCss = function (href) {
    var link = document.createElement('link');
    link.href = href;
    link.setAttribute('type', 'text/css');
    link.setAttribute('rel', 'stylesheet');

    this.headTag.appendChild(link);
};

var AdSGT = function () {
    this.app = new mads({
        'render': this
    });

    this.render();
    this.style();
    this.events()
};

AdSGT.prototype.render = function () {

    this.app.contentTag.innerHTML = '<div id="container"><img id="text1" src="' + this.app.path + 'img/text_1.png" />' +
        '<div id="page1"><img id="swipe_icn" src="' + this.app.path + 'img/swipe_icn.png" /><img id="animated" /><div id="arot"></div><div id="drg"></div></div>' +
        '<div id="page2"><img id="tablet" src="' + this.app.path + 'img/tablet_blank.png" /></div>' +
        '<div id="page3"></div>' +
        '</div>';

    this.app.contentTag.querySelector('#page2').appendChild(this.renderPage2())
};

AdSGT.prototype.style = function () {
    var e = {},
        els = this.app.contentTag.querySelectorAll('div, img, svg'),
        addCSS = function(cssText) {
            var pattern = /([\w-]*)\s*:\s*([^;]*)/g;
            var match, props = {};
            while(match = pattern.exec(cssText)) {
                props[match[1]] = match[2];
                this.style[match[1]] = match[2]
            }
        };

    for(var _e in els) {
        if(els[_e].id) {
            e[els[_e].id] = els[_e];
            e[els[_e].id].addCSS = addCSS
        }
    }

    document.body.style.margin = 0;
    document.body.style.padding = 0;

    this.app.contentTag.addCSS = addCSS;
    this.app.contentTag.addCSS('margin:0;padding:0;');
    e.container.addCSS('width:320px;height:480px;background:url('+this.app.path+'img/bg.png);margin:0;padding:0;');
    e.text1.addCSS('position:absolute;left:25px;top:98px;');

    // Page 1
    e.page1.addCSS('width:320px;height:480px;position:relative;');
    e.swipe_icn.addCSS('position:absolute;bottom:120px;left:25px;');
    e.drg.addCSS('position:absolute;z-index:10;width:600px;height:480px;left:0;top:0;');

    // Page 2
    e.page2.addCSS('width:320px;height:480px;position:relative;display:none;');
    e.tablet.addCSS('position:absolute;bottom:0;left:10px');

    // Page 3
    e.page3.addCSS('width:320px;height:480px;position:relative;background:url('+this.app.path+'img/last.jpg);display:none;');

    // NOTE: CSS Sprite Code
    e.arot.addCSS('top:198px;left:128px;position:absolute;background: url('+this.app.path+'img/sprite_rot.png) no-repeat top left; height: 266px;background-position: 0 0; width: 183px;');

    this.e = e
}
;

AdSGT.prototype.events = function () {
    var self = this;
    this.app.loadJs(this.app.path + 'js/draggabilly.pkgd.min.js', function() {
        var drg = new Draggabilly(self.e.drg, {
            axis: 'x'
        });

        var rot_1 = 'left: 128px;top:198px; background-position: 0 0; width: 183px;',
            rot_2 = 'left: 155px;top:198px; background-position: -193px 0; width: 149px;',
            rot_3 = 'left: 190px;top: 190px; background-position: -352px 0; width: 49px; height: 274px;';

        function drgEnd() {
            if (this.position.x < -100) {
                self.e.page1.addCSS('opacity: 1;transition: opacity 0.5s linear;');
                self.e.page2.addCSS('opacity: 0;transition: opacity 0.5s linear;display:block;');
                setTimeout(function() {
                    self.e.page1.addCSS('opacity: 0');
                    setTimeout(function() {
                        self.e.page1.addCSS('display: none;');
                        self.e.page2.addCSS('opacity: 1;');
                        self.app.tracker('E', 'page2')
                    }, 500)
                }, 400)
            }
        }

        function drgListener() {
            if (this.position.x < 0) {
                self.e.arot.addCSS(rot_1);
                self.app.tracker('E', 'rotate_1')
            }
            if (this.position.x < -50) {
                self.e.arot.addCSS(rot_2);
                self.app.tracker('E', 'rotate_2')
            }
            if (this.position.x < -100) {
                self.e.arot.addCSS(rot_3);
                self.app.tracker('E', 'rotate_3')
            }
            if (this.position.x < -280) {
                this.position.x = -280
            }
            if (this.position.x > 0) {
                this.position.x = 0
            }
        }

        drg.on('dragMove', drgListener);
        drg.on('dragEnd', drgEnd)
    });
    this.e.page3.addEventListener('click', function() {
        self.app.linkOpener('//www.samsung.com/id/tablets/galaxy-tab-a-2016-10-p585/SM-P585YZWAXID/');
        self.app.tracker('E', 'landing_page')
    })
};

// FOR FREELANCER
// NOTE: Don't edit anything above
// Don't use jquery. http://youmightnotneedjquery.com/

var yt;

AdSGT.prototype.renderPage2 = function () {
    var self = this;

    /* load yt component */
    this.app.loadJs(this.app.path + 'js/ninjoe.ytComponent.js', function () {
        /* Init YT */
        yt = new ytComponent({
            'container': 'yt_frame',
            'width': '268',
            'height': '153',
            'videoId': 'j6AsYtJO9lo',
            'tracker': self.app
        });
    });

    var component = document.createElement('div');

    // Add css to component
    component.setAttribute('style', 'position: absolute;width: 267px;top: 221px;left: 26px;');

    component.innerHTML = '<img id="record-image" src="' + this.app.path + 'img/record_3.png" /> <div id="yt_frame"> </div> <div id="link"> </div> <img id="message" src="' + this.app.path + 'img/cta_1.png" />';

    // Reference an element
    var link = component.querySelector('#link');
    var record_image = component.querySelector('#record-image');
    var message = component.querySelector('#message');

    // Add Style
    link.setAttribute('style', 'color:red;height:35px;position:absolute;top:109px;left:20px;width:120px;');

    record_image.setAttribute('style', 'width: 267px;height: 152px;position: absolute;transition: opacity 0.5s');

    message.setAttribute('style', 'position:absolute;top:155px;left:17px;transition: opacity 0.5s;');

    // Add Event
    link.addEventListener('click', function () {
        record_image.setAttribute('src', self.app.path + 'img/record_2.png');
        record_image.setAttribute('src', self.app.path + 'img/animated1.gif');
        message.setAttribute('src', self.app.path + 'img/cta_2.png');
        link.style.visibility = 'hidden';
        record_image.style.visibility = 'hidden';
        message.style.visibility = 'hidden';
        message.style.opacity = 0;
        record_image.style.opacity = 0;
        yt.player.playVideo();
        self.app.tracker('E', 'record')
    });

    document.addEventListener('yt_video_ended', function () {
        component.querySelector('#' + yt.container).style = 'visibility: hidden;';
        record_image.style.visibility = 'visible';
        message.style.visibility = 'visible';
        message.style.opacity = 1;
        record_image.style.opacity = 1;

        setTimeout(function () {
            self.e.page2.addCSS('opacity: 1;transition: opacity 0.5s linear;');
            self.e.page3.addCSS('opacity: 0;transition: opacity 0.5s linear;display:block;');
            setTimeout(function () {
                self.e.page2.addCSS('opacity: 0');
                setTimeout(function () {
                    self.e.page2.addCSS('display: none;');
                    self.e.page3.addCSS('opacity: 1;');
                    self.app.tracker('E', 'page3')
                }, 500)
            }, 400)
            self.app.tracker('E','show_gif')
        }, 5000);
    });

    return component
};
/* Required Function by Youtube Iframe API */
function onYouTubeIframeAPIReady() {
    yt.loadVideo();
}

var adSGT = new AdSGT();
