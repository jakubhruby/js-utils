# layout-utils
Bunch of layout utilities

## circleProgress/CircleProgress.js
Makes pinterest-like grid responsive layout.
### Usage
```html
<div id="progress"></div>
```
```javascript
var
	circleProgress,
	options = {},
	element = document.querySelector('#progress');

circleProgress = new CircleProgress(element, options);
```
Argument ``options`` is optional and may have several properties:
- **progressColor ``string``** - CSS color for progress element. Default color is ``blue``.
- **progressClassName ``string``** - additional CSS class name for progress element.
- **centerMask ``boolean``** - If ``true``, a circle mask is displayed in the center so the progress looks like a ring. Default ``false``.

Demo: https://codepen.io/jakubhruby/pen/yzPXWM

## colorUtils/colorUtils.js
Brings some useful color related functions

- **isColorBright(color)**
Returns true when the given color is bright according to W3C formula https://www.w3.org/TR/AERT#color-contrast and the color opacity.
Demo: https://codepen.io/jakubhruby/pen/mBNGwO

## makeGrid/makeGrid.js
Makes pinterest-like grid responsive layout.
### Usage
```html
<div id="container">
	<div></div>
	<div></div>
	<div></div>
	...
</div>
```
```javascript
var
	element = document.querySelector('#container');

makeGrid(element);
```

Demo: https://codepen.io/jakubhruby/pen/WZXEXj

## timeScrollbar/TimeScrollbar.js
Renders Google Photos timeline scrollbar on the right side
### Usage
```html
<div id="viewport">
	<div data-event-date="YYYY-MM-DD"></div>
	<div data-event-date="YYYY-MM-DD"></div>
	<div data-event-date="YYYY-MM-DD"></div>
	<div data-event-date="YYYY-MM-DD"></div>
</div>
<div id="scrollbar" class="time-scrollbar">
	<div class="time-scrollbar-timeline">
		<div class="time-scrollbar-cursor"></div>
		<div class="time-scrollbar-tracker"></div>
	</div>
</div>
```
```javascript
var
	timeScrollbar,
	scrollbarEl = document.getElementById('scrollbar'),
	viewportEl = document.getElementById('viewport'),
	// optional
	offset = {
		top: 10,
		right: 10
	}

timeScrollbar = new TimeScrollbar(scrollbarEl, viewportEl, offset);
```
