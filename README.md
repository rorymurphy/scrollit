# ScrollIt
###Simple scroll animations including Parallax, Tweening and Waypoints

**Project page: https://github.com/rorymurphy/scrollit**

**ScrollIt** is a client-side JavaScript library that provides easy to use
jQuery extensions for implementing common scroll based animations, as well as
declarative data attributes where possible. The only dependency is jQuery,
and the animations work across desktop and mobile.

## Parallax
Parallax allows the appearance of depth to be created in a website by moving
objects at different speeds relative to each other. Parallax is most often done
using the background image but can also be done using any DOM object.
However, parallaxing DOM objects can cause redraw events which, depending on the
browser, may make the experience sub-optimal. There are two ways to invoke
parallax using ScrollIt. The first uses a declarative HTML data attribute.

```html
  <div style="position: relative;" data-parallax="0.5">Some content...</div>
```

In this example, the element will move at 1/2 the scroll speed it normally would.
It is important to note that, in order for parallaxing to work correctly, the
element must be a positioned element (preferably position: relative);
This method parallaxes by moving the element itself, as opposed to the background
image, which is also commonly the target of parallax. To use more advanced
options of this sort, we can call the parallax jQuery extension directly. This
same call can be written as below:

```html
  <div class="parallax-me" style="position: relative;">Some content...</div>
  <script type="text/javascript">
    $('.parallax-me').parallax({
      axis: 'y',
      attr: 'top',
      speed: 0.5
    });
  </script>
```

The attributes available are

Attribute | Possible Values | Description
--------- | --------------- | -----------
axis | 'y' or 'x' | Parallaxing can be done in either the vertical or horizontal scroll directions
attr | usually 'top' or 'background-position-y' but could be any CSS attribute accepting pixel values | The parallax engine will calculate an offset to be applied to the element, based on its position. The attribute instructs the parallax engine what as to what CSS attribute this offset should be applied.
speed | -infinity < speed < infinity | How much slower than normal scroll the object should move, 0 = normal scroll, 0 < speed < 1 = normal parallax , 1 = fixed position, > 1 backwards scroll

## Tweening
Tweening is a technique that allows elements to be animated by specifying a start
value, and end value and an easing function. The tweening engine can then
animate the transition from one to the other. ScrollIt supports tweening on any
color CSS attribute color (rgb, rgba, hsl or hsla) or any attribute that contains  or a number, and not just strictly numeric values (more on
that in a minute). A tweening call looks like:

```html
  <div id="color-me"></div>
  <div id="next-div"></div>
  <script type="text/javascript">
      $('#color-me').tween({
         start: 0,
         end: $('#next-div'),
         easing: 'easeInCubic',
         styles: {
             'background-color': '#ff0000'
         }
      });
  </script>
```

So what is this tween doing? This particular tween is changing the
background-color of the "color-me" div from it's start color (whatever that is
based on the CSS, since no start value was specified) to #ff0000. It will do this
from scroll position 0 (of the scrollParent element) until the top of the
"#next-div" element reaches the top of the screen.

Many of the options for a tween allow for a selection of datatypes to be passed in

Option | Datatype | Common Values | Description
------ | -------- | ------------- | -----------
axis | string | 'y' or 'x' | Tweening can be done in either the vertical or horizontal scroll directions
start | number | | When a number is specified, it refers to the absolute scroll position relative to the scrollParent.
      | string | 'top', 'bottom', 'left' or 'right' | The start value will be set to the appropriate edge of the scrollParent
      | jQuery object | | The start value will be set to the Top (y-axis) or Left (x-axis) of the first element in the jQuery set
      | function | | An arbitrary function can be provided that will return the numeric value for the start. This function is reevaluated on each scroll event, so the start value can be dynamic when a function is provided
end | number | | same as start, but the position at which the tweening ends
    | string | 'top', 'bottom', 'left' or 'right' | The start value will be set to the appropriate edge of the scrollParent
    | jQuery object | | same as start, but the position at which the tweening ends
    | function | | same as start, but the position at which the tweening ends
easing | string | | The name of the easing function to use. ScrollIt provides the same easing functions as jQuery UI. See https://jqueryui.com/easing/ for more details.
       | function | | Specifies a custom easing function to use. The function must accept a single argument with a range from 0 (beginning) to 1 (end). Additionally, the functions return value should be 0 at point 0 and 1 at point 1, although it may go below 0 or above 1 in-between (see easeOutElastic as an example).
styles | object | | The styles option accepts an object where the keys are the CSS attributes to tween and the values are either a) just the end value of the tween or b) a JavaScript object that contains start value and end value in the form {'background-color' : {startValue: '#000000', endValue: '#ffffff'} }



Many more advanced options are available. For example:

```html
  <div id="color-me"></div>
  <div id="next-div"></div>
  <script type="text/javascript">
      $('#color-me').tween({
         start: function(){
           return $('#color-me').offset().top - $(window).height() / 2;
         },
         end: $('#next-div'),
         easing: 'easeInCubic',
         styles: {
             'transform': {startValue: 'rotate(0deg)', endValue: 'rotate(720deg)'}
         }
      });
  </script>
```

This variation specifies the start using a function that returns a position at
which the tween should begin. This is a very powerful way to control the
space in which tweening should occur, and often desireable for responsive designs,
where the pixel heights of elements change based on screen size. Also, in this
example, both a start value and an end value are specified, and the values are not
strictly numeric. In this circumstance, ScrollIt tries to find the number within
the two values and then tweens it, generating a string for 'rotate(10deg)',
'rotate(90deg)', etc. for each point along the way.

# Waypoints

Waypoints are an easy way to specify that some action be taken when the scroll
position reaches a certain point. The waypoint can be specified relative to any
element, such as 100px above a particular element (even if that element is itself moving or changing size).
At the same time, specifying the waypoint relative to the **document** element
will yield a fixed position waypoint. The basic syntax to invoke a waypoint is

```html
  <img id="someimage" src="..." />
  <script type="text/javascript">
    $(document).waypoint({
       position: 500,
       down: function(){
           var img = $('#someimage');
           img.slideDown();
       },
       up: function(){
           var img = $('#someimage');
           img.slideUp();
       }

    });
  </script>
```

From this example, we can see that the primary options to provide are a **position**, and a **down**
method and/or an **up** method. Like most options in ScrollIt, the position option can be either a value
or a function that returns a position value.

Option | Datatype | Common Values | Description
------ | -------- | ------------- | -----------
axis | string | 'y' or 'x' | Waypoints can be set on either the vertical or horizontal scroll directions
position | number | | The scroll position at which to trigger the waypoint
    | string | 'top', 'bottom', 'left' or 'right' | The start value will be set to the appropriate edge of the scrollParent
    | function | | A function that returns a position at which to trigger the waypoint. This is particularly powerful when you want to set a waypoint relative to a (potentially dynamic) element.
down | function | | A function to trigger when the waypoint is passed moving downward
up | function | | A function to trigger when the waypoint is passed moving upward
right | function | | A function to trigger when the waypoint is passed moving to the right
left | function | | A function to trigger when the waypoint is passed moving to the left

# Sample

The ScrollIt repo includes a test directory that contains a very simple (and
ugly) demonstration of many of the core features.

# License

The MIT License (MIT)

Copyright (c) 2015 Rory Murphy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
