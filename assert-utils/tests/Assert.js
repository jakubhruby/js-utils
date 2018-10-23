import test from 'ava';
import Assert from '../src/Assert';

const
	assert = new Assert();

test('Value check', t => {
	t.notThrows(() => {
		assert.value('1' + 0, '10');
	});
	t.throws(() => {
		assert.value('1' + 0, 1);
	});
});

test('Primitive types', t => {
	//string
	t.notThrows(() => {
		assert.type('this is string', 'string');
	});
	t.throws(() => {
		assert.type(2, 'string');
	});

	// number
	t.notThrows(() => {
		assert.type(2, 'number');
	});
	t.throws(() => {
		assert.type({}, 'number');
	});

	// function
	t.notThrows(() => {
		assert.type(() => {}, 'function');
	});
	t.throws(() => {
		assert.type([], 'function');
	});

	// array
	t.notThrows(() => {
		assert.type([], 'array');
	});
	t.notThrows(() => {
		assert.type([], '[]');
	});
	t.throws(() => {
		assert.type({}, 'array');
	});
	t.throws(() => {
		assert.type({}, '[]');
	});

	// element
	t.notThrows(() => {
		assert.type(document.createElement('div'), 'element');
	});
	t.throws(() => {
		assert.type({}, 'element');
	});

	// object
	t.notThrows(() => {
		assert.type({}, 'object');
	});
	t.notThrows(() => {
		assert.type({}, '{}');
	});
	t.notThrows(() => {
		assert.type({}, {});
	});
	t.throws(() => {
		assert.type('sdfsdf', 'object');
	});
	t.throws(() => {
		assert.type('sdfsdf', '{}');
	});
	t.throws(() => {
		assert.type('sdfsdf', {});
	});
});

test('Object properties', t => {
	// some properties
	t.notThrows(() => {
		assert.type({
			string: 'this is string',
			number: 2
		}, {
			string: 'string',
			number: 'number'
		});
	});
	t.throws(() => {
		assert.type({
			string: 2,
			number: 'this is string'
		}, {
			string: 'string',
			number: 'number'
		});
	});

	// missing properties
	t.notThrows(() => {
		assert.type({
			string: 'this is string',
			number: 2
		}, {
			string: 'string',
			number: 'number'
		});
	});
	t.throws(() => {
		assert.type({
			string: 'this is string'
			// missing property number
		}, {
			string: 'string',
			number: 'number'
		});
	});

	// not wanted properties
	t.notThrows(() => {
		assert.type({
			string: 'this is string',
			number: 2
		}, {
			string: 'string'
		});
	});
	t.throws(() => {
		assert.type({
			string: 'this is string',
			number: 2 // this is not wanted
		}, {
			_strict: true,
			string: 'string'
		});
	});

	// required
	t.notThrows(() => {
		assert.type({
			// missing properties
		}, {
			string: '?string',
			object: {
				_required: false
			}
		});
	});
	t.throws(() => {
		assert.type({
			// missing properties
		}, {
			string: 'string',
			object: {}
		});
	});
});
