/**
 * Transforms given element to a circle progress "bar"
 * @param       {Element} el progress element
 * @constructor
 */
function CircleProgress(el, options) {
    var opt;

    this.el = el;
    this.el.classList.add('circle-progress');
    this.el.insertAdjacentHTML(
        'afterbegin',
        '<div class="half-clip half-clip-first">' +
            '<div class="half half-first"></div>' +
        '</div>' +
        '<div class="half-clip half-clip-second">' +
            '<div class="half half-second"></div>' +
        '</div>' +
        '<div class="center-mask"></div>'
    );

    if (options) {
        for (opt in options) {
            switch (opt) {
                case 'progressColor':
                    this.el.querySelectorAll('.half').forEach(function(item) {
                        item.style.backgroundColor = options[opt];
                    });
                    break;
                case 'progressClassName':
                    this.el.querySelectorAll('.half').forEach(function(item) {
                        item.classList.add(options[opt]);
                    });
                    break;
                case 'centerMask':
                    this.el.querySelector('.center-mask').style.display = options[opt] ? 'block' : 'none';
                    break;
            }
        }
    }
}

/**
 * Updates progress state
 * @param  {Number} progress Progress value from interval <0,1>
 */
CircleProgress.prototype.setValue = function (progress) {
    var rotateValues = this._getRotateValues(progress);

    this.el.querySelector('.half-first').style.transform = 'rotate(' + rotateValues.firstHalf + 'deg)';
    this.el.querySelector('.half-second').style.transform = 'rotate(' + rotateValues.secondHalf + 'deg)';
};

/**
 * Counts degrees for CSS rotation
 * @param  {Number} progress Progress value from interval <0,1>
 * @return {{}}              Return simple object with degree values
 */
CircleProgress.prototype._getRotateValues = function (progress) {
    var
        firstHalfRotate = -180,
        secondHalfRotate = -180;

    if (progress > 0) {
        firstHalfRotate = (1 - progress * 2) * -180;
    }

    if (progress > 0.5) {
        firstHalfRotate = 0;
        secondHalfRotate = (1 - progress) * 2 * -180;
    }

    if (progress === 1) {
        secondHalfRotate = 0;
    }

    return {
        firstHalf: firstHalfRotate,
        secondHalf: secondHalfRotate
    };
};
