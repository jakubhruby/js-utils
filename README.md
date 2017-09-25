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
```
```javascript
var
    viewportEl = document.getElementById('viewport'),
    timeScrollbar = new TimeScrollbar(viewportEl);
```
