/**
 * @license
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Rory Murphy
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define('scrollit', ['jquery'], function ($) {
            // Also create a global in case some scripts
            // that are loaded still are looking for
            // a global even when an AMD loader is in use.
            return (root.scrollit = factory($));
        });
    } else {
        // Browser globals
        root.scrollit = factory(root.jQuery);
    }
}(this, function ($) {
    var exports = {};

    //BEGIN imported underscore functions
    var _ = {};
    _.has = Object.prototype.hasOwnProperty;
    slice = Array.prototype.slice;
    var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');

    _.allKeys = function(obj) {
      if (!_.isObject(obj)) return [];
      var keys = [];
      for (var key in obj) keys.push(key);
      if (hasEnumBug) collectNonEnumProps(obj, keys);
      return keys;
    };

    var createAssigner = function(keysFunc, undefinedOnly) {
      return function(obj) {
        var length = arguments.length;
        if (length < 2 || obj == null) return obj;
        for (var index = 1; index < length; index++) {
          var source = arguments[index],
              keys = keysFunc(source),
              l = keys.length;
          for (var i = 0; i < l; i++) {
            var key = keys[i];
            if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
          }
        }
        return obj;
      };
    };
    _.defaults = createAssigner(_.allKeys, true);

    _.isObject = function(obj) {
      var type = typeof obj;
      return type === 'function' || type === 'object' && !!obj;
    };

    var oTypes = ['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'];
    for(var i = 0; i < oTypes.length; i++){
      var name = oTypes[i];
      var callback = function(name){
        return function(obj) {
          return toString.call(obj) === '[object ' + name + ']';
        };
      };
      _['is' + name] = callback.call(this, name);
    };

    var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
      if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
      var self = baseCreate(sourceFunc.prototype);
      var result = sourceFunc.apply(self, args);
      if (_.isObject(result)) return result;
      return self;
    };

    _.partial = function(func) {
      var boundArgs = slice.call(arguments, 1);
      var bound = function() {
        var position = 0, length = boundArgs.length;
        var args = Array(length);
        for (var i = 0; i < length; i++) {
          args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
        }
        while (position < arguments.length) args.push(arguments[position++]);
        return executeBound(func, bound, this, this, args);
      };
      return bound;
    };
    // End imported underscore functions

    //
    //  scrollParent from jQuery UI
    //
    $.fn.scrollParent = function() {
        var position = this.css( "position" ),
            excludeStaticParent = position === "absolute",
            scrollParent = this.parents().filter( function() {
                var parent = $( this );
                if ( excludeStaticParent && parent.css( "position" ) === "static" ) {
                        return false;
                }
                return (/(auto|scroll)/).test( parent.css( "overflow" ) + parent.css( "overflow-y" ) + parent.css( "overflow-x" ) );
            }).eq( 0 );

        return position === "fixed" || !scrollParent.length ? $( this[ 0 ].ownerDocument || document ) : scrollParent;
    };

    //
    // Easings courtesy of jQuery UI
    var baseEasings = {};

    $.each( [ "Quad", "Cubic", "Quart", "Quint", "Expo" ], function( i, name ) {
            baseEasings[ name ] = function( p ) {
                    return Math.pow( p, i + 2 );
            };
    });

    $.extend( baseEasings, {
            Sine: function( p ) {
                    return 1 - Math.cos( p * Math.PI / 2 );
            },
            Circ: function( p ) {
                    return 1 - Math.sqrt( 1 - p * p );
            },
            Elastic: function( p ) {
                    return p === 0 || p === 1 ? p :
                            -Math.pow( 2, 8 * (p - 1) ) * Math.sin( ( (p - 1) * 80 - 7.5 ) * Math.PI / 15 );
            },
            Back: function( p ) {
                    return p * p * ( 3 * p - 2 );
            },
            Bounce: function( p ) {
                    var pow2,
                            bounce = 4;

                    while ( p < ( ( pow2 = Math.pow( 2, --bounce ) ) - 1 ) / 11 ) {}
                    return 1 / Math.pow( 4, 3 - bounce ) - 7.5625 * Math.pow( ( pow2 * 3 - 2 ) / 22 - p, 2 );
            }
    });

    exports.easing = {
        Linear: function( p ){
            return p;
        }
    };
    $.each( baseEasings, function( name, easeIn ) {
            exports.easing[ "easeIn" + name ] = easeIn;
            exports.easing[ "easeOut" + name ] = function( p ) {
                    return 1 - easeIn( 1 - p );
            };
            exports.easing[ "easeInOut" + name ] = function( p ) {
                    return p < 0.5 ?
                            easeIn( p * 2 ) / 2 :
                            1 - easeIn( p * -2 + 2 ) / 2;
            };
    });

    //
    // Borrowed the string format function from Xintricity.js
    //
    function stringFormat(formatString){
        var args = arguments;
        formatString = formatString.replace(/\{(\d+)\}/ig, function(match, p1, offset, s){
            return args[parseInt(p1) + 1];
        });
        return formatString;
    };

    //
    // Methods to do the actual setting of css styles, in this case accounting
    // for browser specific prefixes
    //
    function setStyleBrowser($el, name, value, browsers){
        $el.css(name, value);

        for(var i = 0; i < browsers.length; i ++){
           var b = browsers[i];
           switch(b){
               case 'webkit':
                   for(var i = 0; i < $el.length; $i++){
                     $el[i].style['-webkit-' + name] = value;
                   }
                   break;
               case 'mozilla':
                   for(var i = 0; i < $el.length; $i++){
                     $el[i].style['-moz-' + name] = value;
                   }
                   break;
               case 'ie':
                   for(var i = 0; i < $el.length; $i++){
                     $el[i].style['-ms-' + name] = value;
                   }
                   break;
               case 'opera':
                   for(var i = 0; i < $el.length; $i++){
                     $el[i].style['-o-' + name] = value;
                   }
                   break;
           }
        }
    }
    //
    //  Style setters
    //
    function setStyle($el, name, value){
        //Depending on the style, we need to generate the browser specific
        //CSS attributes
        switch(name){
            case 'hyphens':
                setStyleBrowser($el, name, value, ['webkit', 'mozilla', 'ie']);
                break;
            case 'box-shadow':
            case 'column-rule':
            case 'column-rule-color':
            case 'column-rule-style':
            case 'column-rule-width':
            case 'column-width':
            case 'columns':
            case 'column-count':
            case 'font-feature-setting':
            case 'order':
            case 'text-decoration-style':
                setStyleBrowser($el, name, value, ['webkit', 'mozilla']);
                break;
            case 'tab-size':
                setStyleBrowser($el, name, value, ['opera', 'mozilla']);
                break;
            case 'box-sizing':
            case 'column-fill':
            case 'image-rendering':
            case 'text-align-last':
            case 'text-combine-horizontal':
            case 'text-decoration-color':
            case 'text-decoration-line':
                setStyleBrowser($el, name, value, ['mozilla']);
                break;
            case 'column-span':
            case 'flex-basis':
            case 'flex-direction':
            case 'flex-flow':
            case 'flex-grow':
            case 'flex-shrink':
            case 'flex-wrap':
            case 'justify-content':
            case 'marquee-direction':
            case 'marquee-play-count':
            case 'marquee-speed':
            case 'marquee-style':
            case 'perspective':
            case 'perspective-origin':
            case 'transform':
            case 'transform-origin':
            case 'transform-style':
            case 'transition':
            case 'transition-property':
            case 'transition-duration':
            case 'transition-timing-function':
            case 'transition-delay':
                setStyleBrowser($el, name, value, ['webkit']);
                break;
            default:
                $el.css(name, value);
        }
    }

    function hexToRgb(hex){
        hex = hex.substr(1);
        if(hex.length === 3){
            var c = {
               r: parseInt(hex.substr(0, 1), 16),
               g: parseInt(hex.substr(1, 1), 16),
               b: parseInt(hex.substr(2, 1), 16)
            };
            return { r: c.r * 16 + c.r, g: c.g * 16 + c.g, b: c.b * 16 + c.b};
        }else if(hex.length === 6){
            return {
               r: parseInt(hex.substr(0, 2), 16),
               g: parseInt(hex.substr(2, 2), 16),
               b: parseInt(hex.substr(4, 2), 16)
            };
        }
    }

    /**
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes h, s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     *
     * @param   Number  h       The hue
     * @param   Number  s       The saturation
     * @param   Number  l       The lightness
     * @return  Array           The RGB representation
     */
    function hslToRgb(h, s, l){
        var r, g, b;

        if(s == 0){
            r = g = b = l; // achromatic
        }else{
            function hue2rgb(p, q, t){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [r * 255, g * 255, b * 255];
    }

    /**
    * Converts an RGB color value to HSL. Conversion formula
    * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
    * Assumes r, g, and b are contained in the set [0, 255] and
    * returns h, s, and l in the set [0, 1].
    *
    * @param   Number  r       The red color value
    * @param   Number  g       The green color value
    * @param   Number  b       The blue color value
    * @return  Array           The HSL representation
    */
   function rgbToHsl(r, g, b){
       r /= 255, g /= 255, b /= 255;
       var max = Math.max(r, g, b), min = Math.min(r, g, b);
       var h, s, l = (max + min) / 2;

       if(max == min){
           h = s = 0; // achromatic
       }else{
           var d = max - min;
           s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
           switch(max){
               case r: h = (g - b) / d + (g < b ? 6 : 0); break;
               case g: h = (b - r) / d + 2; break;
               case b: h = (r - g) / d + 4; break;
           }
           h /= 6;
       }

       return [h, s, l];
   }

    var color = function(options){
        var t = this;

        _.defaults(options, {
            'a': 1.0
        });
        if(typeof options.r !== 'undefined'
            && typeof options.g !== 'undefined'
            && typeof options.b !== 'undefined'){

            options.type = 'rgb';
            var hsl = rgbToHsl(options.r, options.g, options.b);
            options.h = hsl[0] * 360;
            options.s = hsl[1] * 100;
            options.l = hsl[2] * 100;
        } else if( typeof options.h !== 'undefined'
            && typeof options.s  !== 'undefined'
            && typeof options.l  !== 'undefined'){

            options.type = 'hsl';
            var rgb = hslToRgb(options.h / 360, options.s / 100, options.l / 100);
            options.r = rgb[0];
            options.g = rgb[1];
            options.b = rgb[2];
        }

        t.r = function(){ return options.r; };
        t.g = function(){ return options.g; };
        t.b = function(){ return options.b; };
        t.h = function(){ return options.h; };
        t.s = function(){ return options.s; };
        t.l = function(){ return options.l; };
        t.a = function(){ return options.a; };

        t.mix = function(c, percent){
            var perComp = 1.0 - percent; //percent complement
            if(options.type === 'rgb'){
                return new color({
                   r: perComp * options.r + percent * c.r(),
                   g: perComp * options.g + percent * c.g(),
                   b: perComp * options.b + percent * c.b(),
                   a: perComp * options.a + percent * c.a()
                });
            }else if(options.type === 'hsl'){
                return new color({
                   h: perComp * options.h + percent * c.h(),
                   s: perComp * options.s + percent * c.s(),
                   l: perComp * options.l + percent * c.l(),
                   a: perComp * options.a + percent * c.a()
                });
            }
        };

        t.toString = function(){
            return stringFormat('rgba({0}, {1}, {2}, {3})', Math.round(options.r), Math.round(options.g), Math.round(options.b), options.a);
        }

    };


    var hexRegex = /^\s*#([A-Fa-f0-0]{3}|[A-Fa-f0-0]{6})/;
    var rgbRegex = /^\s*rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/;
    var rgbaRegex = /^\s*rgba\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d\.\d+|\d|\.\d+)\s*\)/;
    var hslRegex = /^\s*hsl\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)/;
    var hslaRegex = /^\s*hsla\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*(\d\.\d+|\d|\.\d+)\s*\)/;
    function parseAttributeColor(val){
        var matches = hexRegex.exec(val);
        if(matches != null){ return new color(hexToRgb('#' + matches[1])); }
        matches = rgbRegex.exec(val);
        if(matches != null){ return new color({r: matches[1], g: matches[2], b: matches[3]}); }
        matches = rgbaRegex.exec(val);
        if(matches != null){ return new color({r: matches[1], g: matches[2], b: matches[3], a: matches[4]}); }
        matches = hslRegex.exec(val);
        if(matches != null){ return new color({h: matches[1], s: matches[2], l: matches[3]}); }
        matches = hslaRegex.exec(val);
        if(matches != null){ return new color({h: matches[1], s: matches[2], l: matches[3], a: matches[4]}); }
        return undefined;
    }

    var numericExpression = function(options){
        var t = this;

        t.formatString = function(){ return options.formatString; }
        t.values = function(){ return options.values; }

        t.mix = function(exp, percent){
            var perComp = 1.0 - percent;
            var args = exp.values();
            var newArgs = [];
            for(var i = 0; i < options.values.length; i++){
                newArgs.push( perComp * options.values[i] + percent * args[i] );
            }
            var opts = {
               formatString: options.formatString,
               values: newArgs
            };
            return new numericExpression(opts);
        };

        t.toString = function(){
            return stringFormat.apply(this, [options.formatString].concat(options.values));
        };
    }

    function parseAttributeNumeric(val){
        var counter = 0;
        var args = {};
        args.values = [];
        args.formatString = val.replace(/(\-?\d+\.?\d*|\-?\d*\.?\d+)/ig, function(match, p1, offset, s){
            args.values.push(parseFloat(p1));
            return '{' + counter++ + '}';
        });
        return new numericExpression(args);
    }

    function parseAttribute(val){
        var result = parseAttributeColor(val);
        if(!result){
            result = parseAttributeNumeric(val);
        }
        return result;
    }

    // So this is where the magic happens - there are several different options
    // for what parameters are passed in, and this turns any of them into a
    // function that will return an offset.
    function makeOffsetFunction(axis, scrollParent, options){
        var offsetTopFunc = function($el, offset){ return ($el.get(0) === document ? 0 : $el.offset().top) + offset; };
        var offsetBottomFunc = function($el, offset){ return ($el.get(0) === document ? 0 : $el.offset().top) + $el.height() + offset; };
        var offsetLeftFunc = function($el, offset){ return ($el.get(0) === document ? 0 : $el.offset().left) + offset; };
        var offsetRightFunc = function($el, offset){ return ($el.get(0) === document ? 0 : $el.offset().left) + $el.width() + offset; };

        var $el, result;
        if(options instanceof $){ $el = options; }
        else if(_.isObject(options) && options.$el){ $el = options.$el; }
        else { $el = scrollParent; }

        if(axis === 'y'){
            if(_.isNumber(options)){
                result = _.partial(offsetTopFunc, $el, options);
            }else if(_.isObject(options) && _.has(options, 'top')){
                result = _.partial(offsetTopFunc, $el, options.top);
            }else if(_.isObject(options) && _.has(options, 'bottom')){
                result = _.partial(offsetBottomFunc, $el, options.bottom);
            }else{ result = _.partial(offsetTopFunc, $el, 0); }
        }else{
            if(_.isNumber(options)){
                result = _.partial(offsetLeftFunc, $el, options);
            }else if(_.isObject(options) && _.has(options, 'left')){
                result = _.partial(offsetLeftFunc, $el, options.left);
            }else if(_.isObject(options) && _.has(options, 'right')){
                result = _.partial(offsetRightFunc, $el, options.bottom);
            }else{ result = _.partial(offsetLeftFunc, $el, 0); }
        }
        return result;
    }

    exports.Tween = function(options){
        var t = this;
        var defaults = {
            $el: null,
            scrollParent: null,
            axis: 'y',
            start: 0,
            end: 0,
            easing: 'Linear',
            styles: {},
            scroll: null
        };
        //executionPoint represents whether we are above, inside, or below the tween
        //used for setting edge conditions
        //-1 = above, 0 = inside, 1 = below
        var executionPoint = 0;
        _.defaults(options, defaults);
        if(options.$el === null){
            throw "Must specify an element or elements to tween";
        }
        if(options.scroll === null
            && (options.style === null || options.styles.length === 0)){
            throw "Must specify either styles to tween or a scroll function";
        }
        var $el = options.$el = $(options.$el);
        if(options.scrollParent === null){
            options.scrollParent = $el.scrollParent();
        }
        options.$scrollParent = $(options.scrollParent);

        options.start = _.isFunction(options.start) ? options.start : makeOffsetFunction(options.axis, options.$scrollParent, options.start);
        options.end = _.isFunction(options.end) ? options.end : makeOffsetFunction(options.axis, options.$scrollParent, options.end);
        options.easing = _.isFunction(options.easing) ? options.easing : exports.easing[options.easing];

        for(var key in options.styles){
          var val = options.styles[key];
          var style = val;
          if(_.isString(val)){
              style = { endValue: val };
          }
          style = _.defaults(style, {
              startValue: null,
              endValue: null
          });
          //var dummy = $('<div style="position: fixed; left: 10000px;"></div>').appendTo('body');
          if(style.startValue){
              //Write to a fake element and read back because some browsers actually change the format.
              //for example Chrome changes rotateX and rotateY into a transformation matrix.
              //style.startValue = dummy.css(key, style.startValue).css(key);
              // ^ Nevermind, it was screwing up rotation, as rotate(360) === rotate(0) when you get the matrix transform.
              style.startValue = parseAttribute(style.startValue);
          }
          if(style.endValue){
              //Write to a fake element and read back because some browsers actually change the format.
              //for example Chrome changes rotateX and rotateY into a transformation matrix.
              //style.endValue = dummy.css(key, style.endValue).css(key);
              // ^ Nevermind, it was screwing up rotation, as rotate(360) === rotate(0) when you get the matrix transform.
              style.endValue = parseAttribute(style.endValue);
          }
          //dummy.remove();
          options.styles[key] = style;
        }

        var scroll = function(){
            var start = options.start();
            var end = options.end();
            var pos = options.$scrollParent.scrollTop();

            var value=0;
            if(pos < start && executionPoint >= 0){
                value = 0;
            }else if(pos > end && executionPoint < 1){
                value = 1;
            }else if(pos < start || pos > end){
                executionPoint = (pos < start) ? -1 : 1;
                return;
            } else{
                var percent = (pos - start) / (end - start);
                value = options.easing(percent);
            }

            executionPoint = (pos < start) ? -1 : ( (pos > end) ? 1 : 0 );

            if(options.scroll){ options.scroll(value); }
            for(var key in options.styles){
              var val = options.styles[key];
              if(typeof val.startValue === 'undefined' || val.startValue === null){
                  val.startValue = parseAttribute(options.$el.css(key));
              }
              setStyle(options.$el, key, val.endValue.mix(val.startValue, 1 - value).toString());
            }
        };

        var animate = function(){
          window.requestAnimationFrame(scroll);
        };
        $(options.scrollParent).on('scroll', animate);
        animate();
        $(document).on('ready', animate);

        t.dispose = function(){
            $(options.scrollParent).off('scroll', animate);
        };
    };

    exports.Parallax = function(options){
        var t = this;
        var defaults = {
            $el: null,
            scrollParent: null,
            axis: 'y',
            attr: 'top',
            speed: 0
        };

        _.defaults(options, defaults);
        if(options.$el === null){
            throw "Must specify an element or elements to parallax";
        }

        var $el = options.$el = $(options.$el);
        if(options.scrollParent === null){
            options.scrollParent = $el.scrollParent();
        }
        options.$scrollParent = $(options.scrollParent);

        var scroll = function(){
            var parentBound, offsetBound, scrollBound;
            if(options.axis == 'x'){
              parentPos = (options.$scrollParent.get(0) === document) ? 0 : options.$scrollParent.offset().left;
              //We need the position of where the element SHOULD be, not where it IS (since this includes parallaxing)
              offsetPos = $el.offset().left;
              if(options.attr === 'left'){
                var left = $el.css('left');
                offsetPos -= ($.isNumeric(left) ? left : 0);
              }else if(options.attr === 'right'){
                var right = $el.css('right');
                offsetPos += ($.isNumeric(right) ? right : 0);
              }

              scrollPos = options.$scrollParent.scrollLeft();
            }else{
              parentPos = (options.$scrollParent.get(0) === document) ? 0 : options.$scrollParent.offset().top;
              offsetPos = $el.offset().top;
              if(options.attr === 'top'){
                  var top = $el.css('top');
                  offsetPos -= ($.isNumeric(top) ? top : 0);
              }else if(options.attr === 'bottom'){
                  var bottom = $el.css('bottom');
                  offsetPos += ($.isNumeric(bottom) ? bottom : 0);
              }
              scrollPos = options.$scrollParent.scrollTop();
            }

            var pos = -( offsetPos - parentPos - scrollPos)
                       * options.speed;
            $el.css(options.attr, Math.round(pos));
        };

        var animate = function(){
          window.requestAnimationFrame(scroll);
        };
        options.$scrollParent.on('scroll', animate);
        animate();
        $(document).on('ready', animate);
        t.dispose = function(){
            options.$scrollParent.off('scroll', animate);
        };
    };

    exports.Waypoint = function(options){
        var t = this;
        var defaults = {
            position: 0,
            scrollParent: null,
            axis: 'y',
            up: null,
            down: null
        }


        _.defaults(options, defaults);
        if(options.$el === null){
            options.$el = $(document);
        }
        var $el = options.$el = $(options.$el);
        if(options.scrollParent === null){
            options.scrollParent = $el.scrollParent();
        }
        options.$scrollParent = $(options.scrollParent);

        options.position = _.isFunction(options.position) ? options.position : makeOffsetFunction(options.axis, options.$el, options.position);
        t._lastScrollTop = options.$scrollParent.scrollTop();
        var scroll = function(){
            var position = options.position();
            var scrollTop = options.$scrollParent.scrollTop();
            var scrollLeft = options.$scrollParent.scrollLeft();

            if(options.axis === 'y' && t._lastScrollTop < position && scrollTop > position && options.down){
                options.down();
            }
            if(options.axis === 'y' && t._lastScrollTop > position && scrollTop < position && options.up){
                options.up();
            }

            if(options.axis === 'x' && t._lastScrollLeft < position && scrollLeft > position && options.right){
                options.right();
            }
            if(options.axis === 'x' && t._lastScrollLeft > position && scrollLeft < position && options.left){
                options.left();
            }

            t._lastScrollTop = scrollTop;
            t._lastScrollLeft = scrollLeft;
        };

        var animate = function(){
          window.requestAnimationFrame(scroll);
        };
        $(options.scrollParent).on('scroll', animate);
        animate();
        $(document).on('ready', animate);
        t.dispose = function(){
            $(options.scrollParent).off('scroll', animate);
        };
    }


    //
    // jQuery Plugins - Get their own scope
    //

    var tweens = {};

    $.fn.tween = function(options){
      if(options === 'off'){
          this.each(function(idx, el){
             if(tweens[el]){
                $.each(tweens[el], function(i2, item){
                   item.dispose();
                });
                delete tweens[el];
             }
          });

      }else{
        this.each(function(idx, el){
            var opts = $.extend({}, options);
            opts.$el = $(el);
            var tween = new scrollit.Tween(opts);
            tweens[el] = tweens[el] || [];
            tweens[el].push(tween);
        });
      }
    };

    var waypoints = {};
    $.fn.waypoint = function(options){
        this.each(function(idx, el){
            var opts = $.extend({}, options);
            opts.$el = $(el);
            var way = new scrollit.Waypoint(opts);
            waypoints[el] = waypoints[el] || [];
            waypoints[el].push(way);
        });
    };

    $.fn.parallax = function(options){
        this.each(function(idx, el){
            var opts = $.extend({}, options);
            opts.$el = $(el);
            var parallax = new exports.Parallax(opts);
        });
    };

    $(document).ready(function(){
       $('[data-parallax]').each(function(idx, el){
           $(el).parallax({
               speed: $(el).data('parallax')
           });
       });
    });
    return exports;
}));
