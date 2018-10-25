export default class Assert {
	type(value, def) {
		try {
			this._checkItem(value, def);
		}
		catch (err) {
			throw 'Assertion error: ' + err;
		}
	}

	value(value, expectedValue) {
		if (value === expectedValue) {
			return true;
		}
		else {
			throw `Assertion error: expected "${expectedValue}" but got ${value}`;
		}
	}

	_checkItem(value, def) {
		let
			item, valid, strict,
			required = true;

		if (typeof def === 'string') {
			if (def.substr(0, 1) === '?') {
				required = false;
				def = def.substr(1);
			}

			if (def === '{}') {
				valid = typeof value === 'object';
			}
			else if (def === '[]' || def === 'array') {
				valid = value instanceof Array;
			}
			else if (def === 'element') {
				valid = value instanceof HTMLElement;
			}
			else {
				valid = typeof value === def;
			}

			if (!required) {
				valid = valid || value === undefined;
			}

			if (!valid) {
				throw `expected "${def}" but got "${typeof value}"`;
			}
		}
		else if (typeof def === 'object') {
			if (def.hasOwnProperty('_required')) {
				required = def._required;
				delete def._required;
			}

			if (def.hasOwnProperty('_strict')) {
				strict = def._strict;
				delete def._strict;
			}

			if (value === undefined) {
				if (required) {
					throw 'expected "object" but got "undefined"';
				}
				else {
					valid = true;
				}
			}
			else if (typeof value !== 'object') {
				throw `expected "object" but got "${typeof value}"`;
			}
			else {
				for (item in def) {
					this._checkItem(value[item], def[item]);
				}

				if (strict) {
					Object.keys(value).forEach(key => {
						if (!def.hasOwnProperty(key)) {
							throw `unexpected property "${key}"`;
						}
					});
				}
			}
		}
	}
}
