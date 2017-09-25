function makeGrid(wrapperEl) {
	var
		i, highestCol, post,
		wrapperElWidth = wrapperEl.clientWidth,
		posts = wrapperEl.children,
		col_heights = [],
		order = 1,
		COMPARE_OFFSET = 20,
		COL_COUNT = getColCount();

	wrapperEl.style.display = 'flex';
	wrapperEl.style.flexDirection = 'column';
	wrapperEl.style.flexWrap = 'wrap';

	function getColCount() {
		return (wrapperElWidth < 1200) ? Math.floor(wrapperElWidth / 300) : 4;
	}

	if (pendingRefresh) {
		clearTimeout(pendingRefresh);
	}

	for (i = 0; i < COL_COUNT; i++) {
		col_heights.push(0);
	}

	for (i = 0; i < posts.length; i++) {
		post = posts[i];
		post.style.order = order;
		post.style.width = Math.floor(wrapperElWidth / COL_COUNT) + 'px';

		col_heights[order - 1] += parseFloat(post.clientHeight);
		highestCol = Math.max.apply(Math, col_heights);

		if (col_heights[order - 1] >= highestCol - COMPARE_OFFSET) {
			order++;

			if (order > COL_COUNT) {
				order = 1;
			}
		}
	}

	wrapperEl.style.height = highestCol + 'px';
}
