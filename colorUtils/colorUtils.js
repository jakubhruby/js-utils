/**
 * Returns true when color is considered to be bright according to W3C formula https://www.w3.org/TR/AERT#color-contrast or to its opacity
 * @param  {String}  color hex, short hex, rgb or rgba
 * @return {Boolean}
 */
function isColorBright(color) {
	var
		value, brightness, r, g, b, a;

	value = color.replace(/\s/g, '');
	value = /^(?:#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2}))|(?:#([0-9A-F]{1})([0-9A-F]{1})([0-9A-F]{1}))|(?:rgba\(([0-9]{1,3}),([0-9]{1,3}),([0-9]{1,3}),(1|0\.[0-9]{1,2})\))|(?:rgb\(([0-9]{1,3}),([0-9]{1,3}),([0-9]{1,3})\))$/i.exec(value);

	if (value) {
		// hash
		if (value[1] !== undefined && value[2] !== undefined && value[3] !== undefined) {
			r = parseInt(value[1], 16);
			g = parseInt(value[2], 16);
			b = parseInt(value[3], 16);
		}
		// short hash
		if (value[4] !== undefined && value[5] !== undefined && value[6] !== undefined) {
			r = parseInt(value[4].concat(value[4]), 16);
			g = parseInt(value[5].concat(value[5]), 16);
			b = parseInt(value[6].concat(value[6]), 16);
		}
		// rgba
		else if (value[7] !== undefined && value[8] !== undefined && value[9] !== undefined && value[10] !== undefined) {
			r = parseInt(value[7]);
			g = parseInt(value[8]);
			b = parseInt(value[9]);
			a = parseFloat(value[10]);
		}
		// rgb
		else if (value[11] !== undefined && value[12] !== undefined && value[13] !== undefined) {
			r = parseInt(value[11]);
			g = parseInt(value[12]);
			b = parseInt(value[13]);
		}

		// formula according to W3C https://www.w3.org/TR/AERT#color-contrast
		brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
		return brightness > 125 || a < 0.5;
	}
}
