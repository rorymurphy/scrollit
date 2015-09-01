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
CSS attribute that contains color or a number, and not just strictly numeric values (more on
that in a sec). A tweening call looks like:

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
based on the CSS, since no start value was specified) to $ff0000. It will do this
from scroll position 0 (of the scrollParent element) until the top of the
"#next-div" element reaches the top of the screen.

Many of the options for a tween allow for different datatypes to be passed in

Option | Datatype | Common Values | Description
------ | -------- | ------------- | -----------
axis | string | 'y' or 'x' | Tweening can be done in either the vertical or horizontal scroll directions
start | number | | When a number is specified, it refers to the absolute scroll position relative to the scrollParent.
      | jQuery object | | The start value will be set to the Top (y-axis) or Left (x-axis) of the first element in the jQuery set
      | function | | An arbitrary function can be provided that will return the numeric value for the start. This function is reevaluated on each scroll event, so the start value can be dynamic when a function is provided
end | number | | same as start, but the position at which the tweening ends
    | jQuery object | | same as start, but the position at which the tweening ends
    | function | | same as start, but the position at which the tweening ends
easing | string | | The name of the easing function to use. ScrollIt provides the same easing functions as jQuery UI. See https://jqueryui.com/easing/ for more details.
       | function | | Specifies a custom easing function to use. The function must accept a single argument with a range from 0 (beginning) to 1 (end). Additionally, the functions return value should be 0 at point 0 and 1 at point 1, although it may go below 0 or above 1 in-between (see easeOutElastic as an example).
styles | object | | The styles option accepts an object where the keys are the CSS attributes to tween and the values are either a) just the end value of the tween or b) a JavaScript object that contains start value and end value in the form 'background-color' : {startValue: '#000000', endValue: '#ffffff'}



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
             'background-color': {startValue: '#ffffff', endValue: '#ff0000'}
         }
      });
  </script>
```

This variation specifies the start using a function that returns a position at
which the tween should begin. This is a very powerful way to control the
space in which tweening should occur, and often desireable for responsive designs,
where the pixel heights of elements change based on screen size. Also, in this
example, both a start value and an end value are specified for the background-color.
