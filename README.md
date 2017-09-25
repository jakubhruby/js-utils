# layout-utils
Bunch of layout utilities
## makeGrid/makeGrid.js
Makes pinterest-like grid responsive layout.
### Usage
```javascript
makeGrid(<Element>);
```

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
        <div class="time-scrollbar-tracker"></div>
        <div class="time-scrollbar-cursor"></div>
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
