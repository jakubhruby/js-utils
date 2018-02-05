/**
 * Renders time scrollbar with dates gathered from child elements
 * @param       {Element} el         scrollbar element
 * @param       {Element} viewportEl viewport and also the parent element
 * @param       {{}} offset          top and right offset
 * @constructor
 */
function TimeScrollbar(el, viewportEl, offset) {
	this.offset = offset || {
		top: 10,
		right: 10
	};
	this.monthNames = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];
	this.displayDates = false;
	this.el = el;
	this.timelineEl = this.el.querySelector('.time-scrollbar-timeline');
	this.trackerEl = this.el.querySelector('.time-scrollbar-tracker');
	this.cursorEl = this.el.querySelector('.time-scrollbar-cursor');
	this.viewportEl = viewportEl;

	this._bindHandlers();

	this._applyStyles();
	this._renderBlocks();
}

/**
 * Applies additional computed CSS styles
 */
TimeScrollbar.prototype._applyStyles = function () {
	var
		top = this.viewportEl.getBoundingClientRect().top + window.scrollY,
		bottomOffset = document.body.scrollHeight - this.viewportEl.getBoundingClientRect().bottom - window.scrollY;

	this.el.style.right = this.offset.right + 'px';
	this.el.style.top = top +'px';
	this.el.style.height = (document.body.clientHeight - top) + 'px';

	this.timelineEl.style.top = this.offset.top + 'px';
	this.timelineEl.style.bottom = bottomOffset + 'px';
};

/**
 * Binds mouse action handlers
 */
TimeScrollbar.prototype._bindHandlers = function () {
	var me = this;

	this.el.onmousemove = function _onMouseMove(event) {
		var cursorPosition = me._getCursorPosition(event);

		me.cursorEl.style.top = cursorPosition + 'px';

		if (me.mouseDown) {
			me._scrollTo(cursorPosition);
			me._updateTrackerPosition(cursorPosition);
		}
	};

	this.el.onmousedown = function _onMouseDown(event) {
		var trackerPosition = me._getCursorPosition(event);

		me._scrollTo(trackerPosition);
		me._updateTrackerPosition(trackerPosition);
		me.mouseDown = true;
	};

	window.onmouseup = function _onMouseUp(event) {
		var trackerPosition = me._getCursorPosition(event);

		me._updateTrackerPosition(trackerPosition);
		me.mouseDown = false;
	};

	window.onscroll = function _onScroll() {
		var
			relativePosition = window.scrollY / ((document.body.scrollHeight - document.body.clientHeight) || 1),
			trackerPosition = Math.round(relativePosition * me.timelineEl.clientHeight);

		me._updateTrackerPosition(trackerPosition);
	};

	window.onresize = function _onResize() {
		me._removeBlocks();
		me._applyStyles();
		me._renderBlocks();
	};
};

/**
 * Scrolls to Y position
 * @param {Number} position Y position
 */
TimeScrollbar.prototype._scrollTo = function (position) {
	var
		relativePosition = position / this.timelineEl.clientHeight,
		scrollToPosition = Math.round(relativePosition * (document.body.scrollHeight - document.body.clientHeight));

	window.scrollTo(0, scrollToPosition);
};

/**
 * Returns Y position with inside timeline element
 * @param  {Event} event mouse event
 * @return {Number}      Y position
 */
TimeScrollbar.prototype._getCursorPosition = function (event) {
	var cursorPosition;

	if (event.y < this.timelineEl.getBoundingClientRect().top) {
		cursorPosition = 0;
	}
	else if (event.y >= this.timelineEl.getBoundingClientRect().top && event.y <= this.timelineEl.getBoundingClientRect().bottom - 2) {
		cursorPosition = event.y - this.timelineEl.getBoundingClientRect().top;
	}
	else {
		cursorPosition = this.timelineEl.getBoundingClientRect().bottom - this.timelineEl.getBoundingClientRect().top - 2;
	}

	return cursorPosition;
};

/**
 * Updates Y position of tracker element, with correction of tracker height
 * @param {Number} position Y position
 */
TimeScrollbar.prototype._updateTrackerPosition = function (position) {
	if (window.scrollY + window.innerHeight >= document.body.scrollHeight) {
		position = this.timelineEl.clientHeight - 2;
	}

	this.trackerEl.style.top = position + 'px';
};

/**
 * Removes all previously rendered time blocks to avoid duplicities while re-rendering
 */
TimeScrollbar.prototype._removeBlocks = function () {
	this.el.querySelectorAll('.time-scrollbar-time-block').forEach(function(block) {
		block.remove();
	});
};

/**
 * Renders time blocks based on data attributes found in viewport children elements
 */
TimeScrollbar.prototype._renderBlocks = function () {
	var
		months, dates, yearEl, monthEl, dateEl, years,
		eventEls = this.viewportEl.querySelectorAll('[data-event-date]'),
		blocks = {};

	eventEls.forEach(function(el) {
		var
			eventDate = new Date(el.getAttribute('data-event-date')),
			year = eventDate.getFullYear(),
			month = eventDate.getMonth(),
			date = eventDate.getDate();

		blocks[year] = blocks[year] || {};
		blocks[year][month] = blocks[year][month] || {};
		blocks[year][month][date] = blocks[year][month][date] || 0;
		blocks[year][month][date]++;
	}, this);

	years = Object.keys(blocks).sort(function(a, b) {
		return a > b ? -1 : 1;
	});

	years.forEach(function(year) {
		months = Object.keys(blocks[year]).sort(function(a, b) {
			return a > b ? -1 : 1;
		});
		yearEl = document.createElement('div');
		yearEl.classList.add('time-scrollbar-time-block');
		yearEl.style.flex = months.length + ' 0 auto';
		yearEl.title = year;

		months.forEach(function(month) {
			dates = Object.keys(blocks[year][month]).sort(function(a, b) {
				return parseInt(a) > parseInt(b) ? -1 : 1;
			});
			monthEl = document.createElement('div');
			monthEl.classList.add('time-scrollbar-time-block');
			monthEl.title = this.monthNames[month] + ' ' + year;

			if (this.displayDates) {
				monthEl.style.flex = dates.length + ' 0 auto';
				dates.forEach(function(date) {
					dateEl = document.createElement('div');
					dateEl.textContent = date;
					dateEl.classList.add('time-scrollbar-time-block');
					dateEl.style.flex = blocks[year][month][date] + ' 0 auto';
					monthEl.insertAdjacentElement('beforeend', dateEl);
				}, this);
			}
			else {
				monthEl.style.flex = Object.values(blocks[year][month]).reduce(function(accumulator, currValue) {
					return accumulator + currValue;
				}) + ' 0 auto';
			}

			monthEl.insertAdjacentHTML('afterbegin', '—');
			yearEl.insertAdjacentElement('beforeend', monthEl);
		}, this);

		yearEl.insertAdjacentHTML('afterbegin', year);
		this.timelineEl.insertAdjacentElement('beforeend', yearEl);
	}, this);
};
