/*
 *
 * mads - version 2.00.01
 * Copyright (c) 2015, Ninjoe
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * https://en.wikipedia.org/wiki/MIT_License
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 *
 */
var mads = function(options) {

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
        this.fet = typeof rma.fet == 'string'
            ? [rma.fet]
            : rma.fet;
    } else if (typeof fet != 'undefined') {
        this.fet = fet;
    } else {
        this.fet = [];
    }

    this.fetTracked = false;

    /* load json for assets */
    this.loadJs(this.json, function() {
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
    this.path = typeof rma != 'undefined'
        ? rma.customize.src
        : '';

    /* Solve {2} issues */
    for (var i = 0; i < this.custTracker.length; i++) {
        if (this.custTracker[i].indexOf('{2}') != -1) {
            this.custTracker[i] = this.custTracker[i].replace('{2}', '{{type}}');
        }
    }
};

/* Generate unique ID */
mads.prototype.uniqId = function() {

    return new Date().getTime();
};

mads.prototype.tagsProcess = function(tags) {

    var tagsStr = '';

    for (var obj in tags) {
        if (tags.hasOwnProperty(obj)) {
            tagsStr += '&' + obj + '=' + tags[obj];
        }
    }

    return tagsStr;
};

/* Link Opner */
mads.prototype.linkOpener = function(url) {

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
mads.prototype.tracker = function(tt, type, name, value) {

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

mads.prototype.imageTracker = function(url) {
    for (var i = 0; i < url.length; i++) {
        var t = document.createElement('img');
        t.src = url[i];

        t.style.display = 'none';
        this.bodyTag.appendChild(t);
    }
};

/* Load JS File */
mads.prototype.loadJs = function(js, callback) {
    var script = document.createElement('script');
    script.src = js;

    if (typeof callback != 'undefined') {
        script.onload = callback;
    }

    this.headTag.appendChild(script);
};

/* Load CSS File */
mads.prototype.loadCss = function(href) {
    var link = document.createElement('link');
    link.href = href;
    link.setAttribute('type', 'text/css');
    link.setAttribute('rel', 'stylesheet');

    this.headTag.appendChild(link);
};

var AdSGT = function() {
    this.app = new mads({'render': this});

    this.render();
    this.style();
    this.events()
};

AdSGT.prototype.render = function() {

    this.app.contentTag.innerHTML = '<div id="container"><img id="text1" src="' + this.app.path + 'img/text_1.png" />' + '<div id="page1"><img id="swipe_icn" src="' + this.app.path + 'img/swipe_icn.png" /><img id="animated" /><div id="arot"></div><div id="drg"></div></div>' + '<div id="page2"><img id="tablet" src="' + this.app.path + 'img/tablet.png" /></div>' + '<div id="page3"></div>' + '</div>';

    // this.app.contentTag.querySelector('#page2').appendChild(this.renderPage2())
    this.renderPage2()
};

AdSGT.prototype.style = function() {
    var e = {},
        els = this.app.contentTag.querySelectorAll('div, img, svg'),
        addCSS = function(cssText) {
            var pattern = /([\w-]*)\s*:\s*([^;]*)/g;
            var match,
                props = {};
            while (match = pattern.exec(cssText)) {
                props[match[1]] = match[2];
                this.style[match[1]] = match[2]
            }
        };

    for (var _e in els) {
        if (els[_e].id) {
            e[els[_e].id] = els[_e];
            e[els[_e].id].addCSS = addCSS
        }
    }

    document.body.style.margin = 0;
    document.body.style.padding = 0;

    this.app.contentTag.addCSS = addCSS;
    this.app.contentTag.addCSS('margin:0;padding:0;');
    e.container.addCSS('width:320px;height:480px;background:url(' + this.app.path + 'img/bg.png);margin:0;padding:0;');
    e.text1.addCSS('position:absolute;left:17px;top:98px;');

    // Page 1
    e.page1.addCSS('width:320px;height:480px;position:relative;');
    e.swipe_icn.addCSS('position:absolute;bottom:120px;left:25px;');
    e.drg.addCSS('position:absolute;z-index:10;width:600px;height:480px;left:0;top:0;');

    // Page 2
    e.page2.addCSS('width:320px;height:480px;position:relative;overflow:hidden;display:none;');
    e.tablet.addCSS('position:absolute;bottom:0;left:10px');

    // Page 3
    e.page3.addCSS('width:320px;height:480px;position:relative;background:url(' + this.app.path + 'img/last.jpg);display:none;');

    // NOTE: CSS Sprite Code
    e.arot.addCSS('top:198px;left:128px;position:absolute;background: url(' + this.app.path + 'img/sprite_rot.png) no-repeat top left; height: 266px;background-position: 0 0; width: 183px;');

    this.e = e
};

AdSGT.prototype.events = function() {
    var self = this;
    this.app.loadJs(this.app.path + 'js/draggabilly.pkgd.min.js', function() {
        var drg = new Draggabilly(self.e.drg, {axis: 'x'});

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
AdSGT.prototype.renderPage2 = function() {
    var self = this;
    var component = this.app.contentTag.querySelector('#page2');
    component.innerHTML += '<img id="menu" src="' + this.app.path + 'img/start_screen.png">';
    component.innerHTML += '<img id="translate_cta" src="' + this.app.path + 'img/cta_1.png">';
    component.innerHTML += '<div id="translate_box"></div>';
    component.innerHTML += '<img id="word_cta" style="display:none;" src="' + this.app.path + 'img/cta_2.png">';
    component.innerHTML += '<img id="simply" src="' + this.app.path + 'img/simply.png"><img id="simply_black" src="' + this.app.path + 'img/simply_black.png">';
    component.innerHTML += '<img id="stunning" src="' + this.app.path + 'img/stunning.png"><img id="stunning_black" src="' + this.app.path + 'img/stunning_black.png">';
    component.innerHTML += '<img id="all_around" src="' + this.app.path + 'img/all_around.png"><img id="all_around_black" src="' + this.app.path + 'img/all_around_black.png">';
    component.innerHTML += '<img id="simply_t" src="'+this.app.path+'img/simply_t.png"> <img id="stunning_t" src="'+this.app.path+'img/stunning_t.png"> <img id="all_around_t" src="'+this.app.path+'img/all_around_t.png">'

    var simplyt = component.querySelector('#simply_t')
    var stunningt = component.querySelector('#stunning_t')
    var allaroundt = component.querySelector('#all_around_t')

    simplyt.style.position = stunningt.style.position = allaroundt.style.position = 'absolute'
    simplyt.style.zIndex = stunningt.style.zIndex = allaroundt.style.zIndex = '21'
    simplyt.style.transformOrigin = stunningt.style.transformOrigin = allaroundt.style.transformOrigin = 'center bottom'
    simplyt.style.transformStyle = stunningt.style.transformStyle = allaroundt.style.transformStyle = 'preserve-3D';
    simplyt.style.transition = stunningt.style.transition = allaroundt.style.transition = 'transform 0.2s linear'
    simplyt.style.transform = stunningt.style.transform = allaroundt.style.transform = 'scale(0)'
    simplyt.style.left = '10px'
    simplyt.style.top = '190px'

    stunningt.style.left = '101px'
    stunningt.style.top = '190px'

    allaroundt.style.left = '65px'
    allaroundt.style.top = '228px'

    // Reference an element
    var menu = component.querySelector('#menu');
    menu.style.position = 'absolute';
    menu.style.left = '25px';
    menu.style.top = '220px';
    menu.style.transformOrigin = 'center center';
    menu.style.transformStyle = 'preserve-3D';
    menu.style.transition = 'transform 0.2s linear';
    menu.style.transform = 'scale(1)';

    var translate_cta = component.querySelector('#translate_cta');
    translate_cta.style.position = 'absolute';
    translate_cta.style.left = '5px';
    translate_cta.style.top = '350px';
    translate_cta.style.transformOrigin = 'right bottom';
    translate_cta.style.transformStyle = 'preserve-3D';
    translate_cta.style.transition = 'transform 0.2s linear';
    translate_cta.style.transform = 'scale(1)';

    var translate_box = component.querySelector('#translate_box');
    translate_box.style.position = 'absolute';
    translate_box.style.left = '125px';
    translate_box.style.top = '395px';
    translate_box.style.height = '45px';
    translate_box.style.width = '95px';

    var word_cta = component.querySelector('#word_cta');
    word_cta.style.position = 'absolute';
    word_cta.style.left = '3px';
    word_cta.style.top = '182px';
    word_cta.style.transformOrigin = 'right bottom';
    word_cta.style.transformStyle = 'preserve-3D';
    word_cta.style.transition = 'all 0.2s linear';
    word_cta.style.transform = 'scale(0)';

    var simply_black = component.querySelector('#simply_black');
    simply_black.style.position = 'absolute';
    simply_black.style.left = '48px';
    simply_black.style.top = '246px';
    simply_black.style.opacity = '0'
    simply_black.style.transition = 'opacity 0.2s linear'
    simply_black.style.zIndex = '20'

    var stunning_black = component.querySelector('#stunning_black');
    stunning_black.style.position = 'absolute';
    stunning_black.style.left = '151px';
    stunning_black.style.top = '246px';
    stunning_black.style.opacity = '0'
    stunning_black.style.transition = 'opacity 0.2s linear'
    stunning_black.style.zIndex = '20'

    var all_around_black = component.querySelector('#all_around_black');
    all_around_black.style.position = 'absolute';
    all_around_black.style.left = '90px';
    all_around_black.style.top = '280px';
    all_around_black.style.opacity = '0'
    all_around_black.style.transition = 'opacity 0.2s linear'
    all_around_black.style.zIndex = '20'

    var simply = component.querySelector('#simply');
    simply.style.position = 'absolute';
    simply.style.left = '48px';
    simply.style.top = '246px';
    simply.style.opacity = '0'
    simply.style.transition = 'opacity 0.2s linear'

    var stunning = component.querySelector('#stunning');
    stunning.style.position = 'absolute';
    stunning.style.left = '151px';
    stunning.style.top = '246px';
    stunning.style.opacity = '0'
    stunning.style.transition = 'opacity 0.2s linear'

    var all_around = component.querySelector('#all_around');
    all_around.style.position = 'absolute';
    all_around.style.left = '90px';
    all_around.style.top = '280px';
    all_around.style.opacity = '0'
    all_around.style.transition = 'opacity 0.2s linear'

    translate_box.addEventListener('click', function() {
        setTimeout(function() {
            translate_cta.style.transform = 'scale(0)';
            menu.style.transform = 'scale(0)';
            word_cta.style.opacity = '0';
            word_cta.style.display = 'block';
            translate_box.style.display = 'none'
            setTimeout(function() {
                word_cta.style.opacity = '1';
                word_cta.style.transform = 'scale(1)';
                simply_black.style.opacity = '1'
                stunning_black.style.opacity = '1'
                all_around_black.style.opacity = '1'
            }, 250);
        }, 1);
        self.app.tracker('E', 'translate');
    });

    var flags = [false, false, false]
    var once = false;


    var toggleWordCTA = function() {
      if (flags.indexOf(true) > -1) {
        word_cta.style.transform = 'scale(0)'
        word_cta.style.opacity = '0'
      } else {
        word_cta.style.transform = 'scale(1)'
        word_cta.style.opacity = '1'
      }

      simplyt.style.transform = flags[0] ? 'scale(1)' : 'scale(0)'

      stunningt.style.transform = flags[1] ? 'scale(1)' : 'scale(0)'

      allaroundt.style.transform = flags[2] ? 'scale(1)' : 'scale(0)'

      if (!once) {
        once = true
        var s = setTimeout(function() {
          self.e.page2.addCSS('opacity: 1;transition: opacity 0.5s linear;');
          self.e.page3.addCSS('opacity: 0;transition: opacity 0.5s linear;display:block;');
          setTimeout(function () {
              self.e.page2.addCSS('opacity: 0');
              setTimeout(function () {
                  self.e.page2.addCSS('display: none;');
                  self.e.page3.addCSS('opacity: 1;');
                  self.app.tracker('E', 'page3')
                  clearTimeout(s)
              }, 500)
          }, 400)
        }, 3000)
      }
    }

    simply_black.addEventListener('click', function() {
        simply_black.style.opacity = simply_black.style.opacity === '1' ? '0' : '1'
        setTimeout(function() {
            simply.style.opacity = simply.style.opacity === '1' ? '0' : '1'
            flags[0] = simply.style.opacity === '1'
            flags[2] = flags[1] = false
            toggleWordCTA()
        }, 100)

        stunning_black.style.opacity = '1'
        setTimeout(function() {
            stunning.style.opacity = '0'
        }, 100)

        all_around_black.style.opacity = '1'
        setTimeout(function() {
            all_around.style.opacity = '0'
        }, 100)
        self.app.tracker('E', 'simply')
    })

    stunning_black.addEventListener('click', function() {
        simply_black.style.opacity = '1'
        setTimeout(function() {
            simply.style.opacity = '0'
        }, 100)

        stunning_black.style.opacity = stunning_black.style.opacity === '1' ? '0' : '1'
        setTimeout(function() {
            stunning.style.opacity = stunning_black.style.opacity === '1' ? '0' : '1'
            flags[1] = stunning.style.opacity === '1'
            flags[0] = flags[2] = false
            toggleWordCTA()
        }, 100)

        all_around_black.style.opacity = '1'
        setTimeout(function() {
            all_around.style.opacity = '0'
        }, 100)
        self.app.tracker('E', 'stunning')
    });

    all_around_black.addEventListener('click', function() {
        simply_black.style.opacity = '1'
        setTimeout(function() {
            simply.style.opacity = '0'
        }, 100)

        stunning_black.style.opacity = '1'
        setTimeout(function() {
            stunning.style.opacity = '0'
        }, 100)

        all_around_black.style.opacity = all_around_black.style.opacity === '1' ? '0' : '1'
        setTimeout(function() {
            all_around.style.opacity = all_around.style.opacity === '1' ? '0' : '1'
            flags[2] = all_around.style.opacity === '1'
            flags[0] = flags[1] = false
            toggleWordCTA()
        }, 100)

        self.app.tracker('E', 'all_around')
    });

    return component
};

var adSGT = new AdSGT();
