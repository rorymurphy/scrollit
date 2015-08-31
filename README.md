# ScrollIt
###Simple scroll animations including Parallax, Tweening and Waypoints

**Project page: https://github.com/rorymurphy/scrollit**

**ScrollIt** is a client-side JavaScript library that provides easy to use
jQuery extensions for implementing common scroll based animations, as well as
declarative data attributes where possible. The only dependency is jQuery,
and the animations work across desktop and mobile.

Parallax allows the appearance of depth to be created in a website by moving
objects at different speeds relative to each other. Parallax is most often done
using the background image but can also be done using any DOM object.
However, parallaxing DOM objects can cause redraw events which, depending on the
browser, may make the experience sub-optimal. There are two ways to invoke
parallax using ScrollIt. The first uses a declarative HTML data attribute.

  <div style="position: relative;" data-parallax="0.5">Some content...</div>

In this example, the element will move at 1/2 the scroll speed it normally would.
It is important to note that, in order for parallaxing to work correctly, the
element must be a positioned element (preferably position: relative);
This method parallaxes by moving the element itself, as opposed to the background
image, which is also commonly the target of parallax. To use more advanced
options of this sort, we can call the parallax jQuery extension directly. This
same call can be written as below:

  <div class="parallax-me" style="position: relative;">Some content...</div>
  <script type="text/javascript">
    $('.parallax-me').parallax({
      axis: 'y',
      attr: 'top',
      speed: 0.5
    });
  </script>

The attributes available are

Attribute | Possible Values | Description
--------- | --------------- | -----------
axis | 'y' or 'x' | Parallaxing can be done in either the vertical or horizontal scroll directions
attr | usually 'top' or 'background-position-y' but could be any CSS attribute accepting pixel values | The parallax engine will calculate an offset to be applied to the element, based on its position. The attribute instructs the parallax engine what as to what CSS attribute this offset should be applied.
speed | -infinity < speed < infinity | How much slower than normal scroll the object should move, 0 = normal scroll, 0 < speed < 1 = normal parallax , 1 = fixed position, > 1 backwards scroll
