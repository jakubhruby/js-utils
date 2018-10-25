import Assert from './src/Assert.js';

exports = {
	Assert: Assert,
	assert: new Assert()
};

// CommonJS
module.exports = exports;
// ES 6
export default exports;
