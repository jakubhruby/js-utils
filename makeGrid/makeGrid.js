/**
 * Aligns child elements into columns in a Pinterest-like style
 * @param {Element} wrapperEl parent element
 */
function makeGrid(wrapperEl) {
	var
		i, highestCol, lowestCol, post, colWidth,
		wrapperElWidth = wrapperEl.clientWidth,
		posts = wrapperEl.children,
		col_heights = [],
		COL_COUNT = getColCount();

	wrapperEl.style.position = 'relative';

	/**
	 * Returns responsively computed column count
	 * @return {Number} column count
	 */
	function getColCount() {
		return (wrapperElWidth < 1200) ? Math.floor(wrapperElWidth / 300) : 4;
	}

	colWidth = Math.floor(wrapperElWidth / COL_COUNT);

	for (i = 0; i < COL_COUNT; i++) {
		col_heights.push(0);
	}

	for (i = 0; i < posts.length; i++) {
		post = posts[i];
		lowestCol = Math.min.apply(Math, col_heights);
		order = col_heights.indexOf(lowestCol);
		post.style.width = colWidth + 'px';
		post.style.position = 'absolute';
		post.style.left = order * colWidth + 'px';
		post.style.top = col_heights[order] + 'px';
		col_heights[order] += parseFloat(post.clientHeight);
	}

	highestCol = Math.max.apply(Math, col_heights);
	wrapperEl.style.height = highestCol + 'px';
}
