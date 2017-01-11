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
}

mads.prototype.tagsProcess = function (tags) {

    var tagsStr = '';

    for(var obj in tags){
        if(tags.hasOwnProperty(obj)){
            tagsStr+= '&'+obj + '=' + tags[obj];
        }
    }

    return tagsStr;
}

/* Link Opner */
mads.prototype.linkOpener = function (url) {

	if(typeof url != "undefined" && url !=""){

        if(typeof this.ct != 'undefined' && this.ct != '') {
            url = this.ct + encodeURIComponent(url);
        }

		if (typeof mraid !== 'undefined') {
			mraid.open(url);
		}else{
			window.open(url);
		}

        if(typeof this.cte != 'undefined' && this.cte != '') {
            this.imageTracker(this.cte);
        }
	}
}

/* tracker */
mads.prototype.tracker = function (tt, type, name, value) {

    /*
    * name is used to make sure that particular tracker is tracked for only once
    * there might have the same type in different location, so it will need the name to differentiate them
    */
    name = name || type;

    if ( tt == 'E' && !this.fetTracked ) {
        for ( var i = 0; i < this.fet.length; i++ ) {
            var t = document.createElement('img');
            t.src = this.fet[i];

            t.style.display = 'none';
            this.bodyTag.appendChild(t);
        }
        this.fetTracked = true;
    }

    if ( typeof this.custTracker != 'undefined' && this.custTracker != '' && this.tracked.indexOf(name) == -1 ) {
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
    for ( var i = 0; i < url.length; i++ ) {
        var t = document.createElement('img');
        t.src = url[i];

        t.style.display = 'none';
        this.bodyTag.appendChild(t);
    }
}

/* Load JS File */
mads.prototype.loadJs = function (js, callback) {
    var script = document.createElement('script');
    script.src = js;

    if (typeof callback != 'undefined') {
        script.onload = callback;
    }

    this.headTag.appendChild(script);
}

/* Load CSS File */
mads.prototype.loadCss = function (href) {
    var link = document.createElement('link');
    link.href = href;
    link.setAttribute('type', 'text/css');
    link.setAttribute('rel', 'stylesheet');

    this.headTag.appendChild(link);
}

var AdSGT = function() {
  this.app = new mads({
    'render': this
  })

  this.render()
  this.style()
  this.events()
}

AdSGT.prototype.render = function() {

  // var blue = '<svg version="1.2" baseProfile="tiny" id="blue" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 320 480" overflow="scroll" xml:space="preserve"><svg id="group_lines" x="10"><path id="bluepath" fill="none" stroke="#0197CF" stroke-width="6" stroke-linecap="round" stroke-miterlimit="10" d="M6.7,5c5.9,2.5,13.6,6,22.3,11c7.1,4,15.3,8.8,24.8,16.8c7.2,6.1,16,13.5,23.5,26C80.4,64,85,72,87.2,83.5c3.6,19-2.3,34.5-5,41.5c-2.7,7-5.8,12-8.3,16c-4.6,7.5-9.8,14-19.3,23.9c-7.9,8.1-18.8,18.6-32.9,30.1"/></svg></svg>'

  this.app.contentTag.innerHTML = '<div id="container"><img id="text1" src="'+this.app.path+'img/text_1.png" />'+
    '<div id="page1"><img id="swipe_icn" src="'+this.app.path+'img/swipe_icn.png" /><img id="animated" /><div id="arot"></div><div id="drg"></div></div>'+
    '<div id="page2">'+
      '<img id="tablet" src="'+this.app.path+'img/tablet.png" />'+
      '<img id="trace" src="'+this.app.path+'img/line.png"/>'+
      '<div id="bluec"><img id="blue" src="'+this.app.path+'img/blue.png"></div>'+
      '<div id="redc"><img id="red" src="'+this.app.path+'img/red.png"></div>'+
      '<div id="selected"></div>'+
      '<img id="ctablue" src="'+this.app.path+'img/ctablue.png">'+
      '<img id="ctared" src="'+this.app.path+'img/ctared.png">'+
      '<img id="pen" src="'+this.app.path+'img/pen.png">'+
      '<div id="blueBox"></div>'+
      '<div id="redBox"></div>'+
    '</div>'+
    '<div id="page3"></div>'+
    '</div>'
}

AdSGT.prototype.style = function() {
  var e = {},
      els = this.app.contentTag.querySelectorAll('div, img, svg, path'),
      addCSS = function(cssText) {
        var pattern = /([\w-]*)\s*:\s*([^;]*)/g
        var match, props = {}
        while(match = pattern.exec(cssText)) {
          props[match[1]] = match[2]
          this.style[match[1]] = match[2]
        }
      }

  for(var _e in els) {
    if(els[_e].id) {
      e[els[_e].id] = els[_e]
      e[els[_e].id].addCSS = addCSS
    }
  }

  this.app.contentTag.addCSS = addCSS
  this.app.contentTag.addCSS('margin:0;padding:0;')
  e.container.addCSS('width:320px;height:480px;background:url('+this.app.path+'img/bg.png);margin:0;padding:0;')
  e.text1.addCSS('position:absolute;left:25px;top:98px;')

  // Page 1
  e.page1.addCSS('width:320px;height:480px;position:relative;overflow:hidden')
  e.swipe_icn.addCSS('position:absolute;bottom:120px;left:25px;')
  e.drg.addCSS('position:absolute;z-index:10;width:600px;height:480px;left:0;top:0;')

  // Page 2
  e.page2.addCSS('width:320px;height:480px;position:relative;display:none;')
  e.tablet.addCSS('position:absolute;bottom:0;left:30px')
  e.trace.addCSS('position:absolute;bottom:40px;left:100px;')
  e.redc.addCSS('position:absolute;top:242px;left:132px;z-index:10;width:86px;height:0;overflow:hidden;')
  e.redBox.addCSS('position:absolute;top:220px;left:130px;z-index:12;background:transparent;width:110px;height:40px;')

  e.bluec.addCSS('position:absolute;top:248px;left:98px;z-index:10;width:86px;height:0;overflow:hidden;')
  e.blueBox.addCSS('position:absolute;top:220px;left:90px;z-index:12;background:transparent;width:110px;height:40px;')

  e.pen.addCSS('position:absolute;top:160px;left:120px;z-index:11;')

  e.ctablue.addCSS('position:absolute;top:178px;left:5px;')
  e.ctared.addCSS('position:absolute;top:178px;right:5px;display:none;')

  e.selected.addCSS('background:url('+this.app.path+'img/selected.png) no-repeat top left;')
  e.selected.addCSS('width: 47px; height: 22px;left:55px;bottom:5px;position:absolute;background-position: 0 -32px;')

  // Page 3
  e.page3.addCSS('width:320px;height:480px;position:relative;background:url('+this.app.path+'img/last.jpg);display:none;')

  // NOTE: CSS Sprite Code
  e.arot.addCSS('top:198px;left:128px;position:absolute;background: url('+this.app.path+'img/sprite_rot.png) no-repeat top left; height: 266px;background-position: 0 0; width: 183px;')

  this.e = e
}

AdSGT.prototype.events = function() {
  var self = this;
  this.app.loadJs(this.app.path + 'js/draggabilly.pkgd.min.js', function() {
    var drg = new Draggabilly(self.e.drg, {
      axis: 'x'
    })

    var rot_1 = 'left: 128px;top:198px; background-position: 0 0; width: 183px;',
        rot_2 = 'left: 155px;top:198px; background-position: -193px 0; width: 149px;',
        rot_3 = 'left: 190px;top: 190px; background-position: -352px 0; width: 49px; height: 274px;'

    function drgEnd() {
      if (this.position.x < -100) {
        self.e.page1.addCSS('opacity: 1;transition: opacity 0.5s linear;')
        self.e.page2.addCSS('opacity: 0;transition: opacity 0.5s linear;display:block;')
        setTimeout(function() {
          self.e.page1.addCSS('opacity: 0')
          setTimeout(function() {
            self.e.page1.addCSS('display: none;')
            self.e.page2.addCSS('opacity: 1;')
            self.app.tracker('E', 'page2')
          }, 500)
        }, 400)
      }
    }

    function drgListener() {
      if (this.position.x < 0) {
        self.e.arot.addCSS(rot_1)
        self.app.tracker('E', 'rotate_1')
      }
      if (this.position.x < -50) {
        self.e.arot.addCSS(rot_2)
        self.app.tracker('E', 'rotate_2')
      }
      if (this.position.x < -100) {
        self.e.arot.addCSS(rot_3)
        self.app.tracker('E', 'rotate_3')
      }
      if (this.position.x < -280) {
        this.position.x = -280
      }
      if (this.position.x > 0) {
        this.position.x = 0
      }
    }

    drg.on('dragMove', drgListener)
    drg.on('dragEnd', drgEnd)

    var bx = new Draggabilly(self.e.blueBox, {
      axis: 'y'
    })

    bx.on('dragMove', function() {
      if (this.position.y < 220) {
        this.position.y = 220
      }
      if (this.position.y > 400) {
        this.position.y = 400
      }
      if (this.position.y >= 220 && this.position.y <= 400) {
        var p = (220 - this.position.y) / (400 - 220)
        self.e.bluec.style.height = ((p * 191) * -1) + 'px'
        self.e.pen.style.top = 160 + (this.position.y - 220) + 'px'
        var l = 120 + (200 * (p * -1))
        if (self.e.pen.style.top.replace('px', '') > 219) {
          l = 185
        }
        if (self.e.pen.style.top.replace('px', '') > 251) {
          l = 238 + (-100 * (p * -1))
        }
        self.e.pen.style.left = l + 'px'
      }
    })

    bx.on('dragEnd', function() {
      if (this.position.y >= 390) {
        self.app.tracker('E', 'traced_blue')
        console.log('traced_blue')
        self.e.selected.addCSS('background-position: 0 0;')
        self.e.ctablue.addCSS('display:none;')
        self.e.pen.addCSS('top:156px;left:154px;-moz-transform: scaleX(-1);-o-transform: scaleX(-1);-webkit-transform: scaleX(-1);transform: scaleX(-1);filter: FlipH;-ms-filter: "FlipH";')
        self.e.ctared.addCSS('display:block;')
        bx.destroy()
      }
    })

    var rx = new Draggabilly(self.e.redBox, {
      'axis': 'y'
    })

    rx.on('dragMove', function() {
      if (this.position.y < 220) {
        this.position.y = 220
      }
      if (this.position.y > 400) {
        this.position.y = 400
      }
      if (this.position.y >= 220 && this.position.y <= 400) {
        var p = (220 - this.position.y) / (400 - 220)
        self.e.redc.style.height = ((p * 202) * -1) + 'px'
        self.e.pen.style.top = 150 + (this.position.y - 220) + 'px'
        var l = 150 + (-200 * (p * -1))
        if (self.e.pen.style.top.replace('px', '') > 240) {
          l = (100 * (p * -1))
        }
        self.e.pen.style.left = l + 'px'
      }
    })

    rx.on('dragEnd', function() {
      if (this.position.y >= 380) {
        self.app.tracker('E', 'traced_red')

        self.e.page2.addCSS('opacity: 1;transition: opacity 0.5s linear;')
        self.e.page3.addCSS('opacity: 0;transition: opacity 0.5s linear;display:block;')
        setTimeout(function() {
          self.e.page2.addCSS('opacity: 0')
          setTimeout(function() {
            self.e.page2.addCSS('display: none;')
            self.e.page3.addCSS('opacity: 1;')
            self.app.tracker('E', 'page3')

          }, 500)
        }, 400)

        rx.disable()
      }
    })
  })
  this.e.page3.addEventListener('click', function() {
    self.app.linkOpener('//www.samsung.com/id/tablets/galaxy-tab-a-2016-10-p585/SM-P585YZWAXID/')
    self.app.tracker('E', 'landing_page')
  })
}

var adSGT = new AdSGT()
