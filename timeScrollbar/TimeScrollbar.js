function TimeScrollbar(el, viewportEl, offset) {
	offset = offset || {
		top: 10,
		right: 10
	};

	this.monthNames = [
		'January',
		'February',
		'March',
		'April',
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

	this._applyStyles(offset);
	this._bindHandlers();
	this._renderBlocks();
}

TimeScrollbar.prototype._applyStyles = function (offset) {
	var
		top = this.viewportEl.getBoundingClientRect().top + window.scrollY,
		bottomOffset = document.body.scrollHeight - this.viewportEl.getBoundingClientRect().bottom - window.scrollY;

	this.el.style.position = 'fixed';
	this.el.style.right = offset.right + 'px';
	this.el.style.top = top +'px';
	this.el.style.height = (document.body.clientHeight - top) + 'px';

	this.timelineEl.style.top = offset.top + 'px';
	this.timelineEl.style.bottom = bottomOffset + 'px';
};

TimeScrollbar.prototype._bindHandlers = function () {
	var me = this;

	this.el.onmousemove = function(event) {
		var cursorPosition = me._getCursorPosition(event);

		me.cursorEl.style.top = cursorPosition + 'px';

		if (me.mouseDown) {
			me._scrollTo(cursorPosition);
			me.cursorEl.style.zIndex = 1;
			me.trackerEl.style.zIndex = 2;
			me._updateTrackerPosition(cursorPosition);
		}
		else {
			me.cursorEl.style.zIndex = 2;
			me.trackerEl.style.zIndex = 1;
		}
	};

	this.el.onmousedown = function(event) {
		var trackerPosition = me._getCursorPosition(event);

		me._scrollTo(trackerPosition);
		me._updateTrackerPosition(trackerPosition);
		me.mouseDown = true;
	};

	window.onmouseup = function(event) {
		var trackerPosition = me._getCursorPosition(event);

		me._updateTrackerPosition(trackerPosition);
		me.mouseDown = false;
	};

	window.onscroll = function() {
		var
			relativePosition = window.scrollY / document.body.clientHeight,
			trackerPosition = relativePosition * me.timelineEl.clientHeight;

		me._updateTrackerPosition(trackerPosition);
	};
};

TimeScrollbar.prototype._scrollTo = function (position) {
	var
		relativePosition = position / this.timelineEl.clientHeight,
		scrollToPosition = relativePosition * document.body.clientHeight;

	window.scrollTo(0, scrollToPosition);
};

TimeScrollbar.prototype._getCursorPosition = function (event) {
	var cursorPosition;

	if (event.y < this.el.offsetTop + this.timelineEl.offsetTop) {
		cursorPosition = 0;
	}
	else if (event.y > this.el.offsetTop + this.timelineEl.offsetTop + this.timelineEl.clientHeight - this.cursorEl.clientHeight) {
		cursorPosition = (this.el.offsetTop + this.timelineEl.offsetTop + this.timelineEl.clientHeight - this.cursorEl.clientHeight) + 'px';
	}
	else {
		cursorPosition = event.y - this.el.offsetTop - this.timelineEl.offsetTop;
	}

	return cursorPosition;
};

TimeScrollbar.prototype._updateTrackerPosition = function (position) {
	if (window.scrollY + window.innerHeight === document.body.scrollHeight) {
		position = this.timelineEl.clientHeight - 2;
	}

	this.trackerEl.style.top = position + 'px';
};

TimeScrollbar.prototype._renderBlocks = function () {
	var
		year, months, month, dates, date, yearEl, monthEl, dateEl,
		eventEls = this.viewportEl.querySelectorAll('[data-event-date]'),
		blocks = {};

	eventEls.forEach(function(el) {
		var
			eventDate = new Date(el.getAttribute('data-event-date')),
			year = eventDate.getFullYear(),
			month = eventDate.getMonth(),
			date = eventDate.getDate();

		blocks[year] = blocks[year] || {count: 0, months: {}};
		blocks[year].count++;

		blocks[year].months[month] = blocks[year].months[month] || {count: 0, dates: {}};
		blocks[year].months[month].count++;

		if (this.displayDates) {
			blocks[year].months[month].dates[date] = blocks[year].months[month].dates[date] || {count: 0, events: []};
			blocks[year].months[month].dates[date].count++;
		}
	}, this);

	for (year in blocks) {
		months = blocks[year];
		yearEl = document.createElement('div');
		yearEl.style.flex = months.count + ' 0 auto';
		yearEl.style.display = 'flex';
		yearEl.style.flexDirection = 'column';

		for (month in months.months) {
			dates = months.months[month];
			monthEl = document.createElement('div');
			monthEl.style.flex = dates.count + ' 0 auto';
			monthEl.style.display = 'flex';
			monthEl.style.flexDirection = 'column';
			monthEl.title = this.monthNames[month] + ' ' + year;

			if (this.displayDates) {
				for (date in dates.dates) {
					dateEl = document.createElement('div');
					dateEl.textContent = date;
					dateEl.style.flex = dates.dates[date].count + ' 0 auto';
					monthEl.insertAdjacentElement('afterbegin', dateEl);
				}
			}

			monthEl.insertAdjacentHTML('afterbegin', '—');
			yearEl.insertAdjacentElement('afterbegin', monthEl);
		}

		yearEl.insertAdjacentHTML('afterbegin', year);
		this.timelineEl.insertAdjacentElement('afterbegin', yearEl);
	}
};
