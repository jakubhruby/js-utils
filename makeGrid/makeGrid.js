/**
 * Aligns child elements into columns in a Pinterest-like style
 * @param {Element} wrapperEl parent element
 */
function makeGrid(wrapperEl) {
	var
		i, highestCol, lowestCol, post,
		wrapperElWidth = wrapperEl.clientWidth,
		posts = wrapperEl.children,
		col_heights = [],
		order = 1,
		COL_COUNT = getColCount();

	wrapperEl.style.display = 'flex';
	wrapperEl.style.flexDirection = 'column';
	wrapperEl.style.flexWrap = 'wrap';

	/**
	 * Returns responsively computed column count
	 * @return {Number} column count
	 */
	function getColCount() {
		return (wrapperElWidth < 1200) ? Math.floor(wrapperElWidth / 300) : 4;
	}

	for (i = 0; i < COL_COUNT; i++) {
		col_heights.push(0);
	}

	for (i = 0; i < posts.length; i++) {
		post = posts[i];
		lowestCol = Math.min.apply(Math, col_heights);
		order = col_heights.indexOf(lowestCol) + 1;
		post.style.order = order;
		post.style.width = Math.floor(wrapperElWidth / COL_COUNT) + 'px';
		col_heights[order - 1] += parseFloat(post.clientHeight);
	}

	highestCol = Math.max.apply(Math, col_heights);
	wrapperEl.style.height = highestCol + 'px';
}
