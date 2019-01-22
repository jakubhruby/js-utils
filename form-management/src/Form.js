import waterfallExec from 'waterfall-exec';
import assertUtils from 'assert-utils';

const
	{Waterfall} = waterfallExec,
	{assert} = assertUtils;

export default class Form {

	/**
	 * Initiate form management
	 * @param {Object} config configuration
	 * @param {Element} config.form <form> element
	 * @param {Object} config.handlers event listeners
	 * @param {function} config.handlers.save is called when the form is submitted
	 * @param {function} [config.handlers.delete] is called when delete button is pressed
	 * @param {function} [config.handlers.change] is called when any field changes its value
	 * @param {function} [config.handlers.cancel] is called when edit is cancelled
	 * @param {string} [config.id] form identification
	 * @param {Object} [config.validators] validation functions dictionary, each in form validatorName(value, field) {return {valid: [boolean], hint: [string]}}
	 * @param {Object} [config.plugins] dictionary of special fields, each in form {init: fn(field) {}, getValue() {return value;}}
	 * @param {boolean} [config.editable=true] enable form editing
	 * @param {boolean} [config.editOnClick=false] enable edit mode by clicking somewhere on form
	 * @param {boolean} [config.persistentEditMode=true] edit mode is always enabled (standard form behavior)
	 * @param {boolean} [config.displayEdit=false] display edit button
	 * @param {boolean} [config.displayDelete=false] display delete button
	 * @param {boolean} [config.displayLoadingMask=false] display overlay with loading icon when saving form
	 * @param {function} [config.translate] translate function in form function(text) {return translatedText;}
	 * @param {boolean} [config.autoFocus=false] focus the first editable field on edit start
	 */
	constructor(config) {
		assert.type(config, {
			form: 'element',
			handlers: {
				save: 'function',
				delete: '?function',
				change: '?function',
				cancel: '?function'
			},
			id: '?string',
			validators: '?{}',
			plugins: '?{}',
			editable: '?boolean',
			editOnClick: '?boolean',
			persistentEditMode: '?boolean',
			displayEdit: '?boolean',
			displayDelete: '?boolean',
			displayLoadingMask: '?boolean',
			translate: '?function',
			autoFocus: '?boolean'
		});

		this.form = config.form;
		this.handlers = config.handlers;
		this.id = config.id;
		this.validators = Object.assign({}, this.VALIDATORS, config.validators || {});
		this.plugins = config.plugins || {};
		this.editable = config.editable === undefined ? true : config.editable;
		this.editOnClick = config.editOnClick;
		this.persistentEditMode = config.persistentEditMode === undefined ? true : config.persistentEditMode;
		this.displayEdit = config.displayEdit;
		this.displayDelete = config.displayDelete;
		this.displayLoadingMask = config.displayLoadingMask;
		this.translate = config.translate;
		this.autoFocus = config.autoFocus;

		this.validatedValues = {};
		this.data = {};

		if (this.persistentEditMode) {
			this.edit();
		}
		else {
			this.cancel();
		}

		for (let plugin in this.plugins) {
			assert.value(this.form.querySelectorAll(`.field[name="${plugin}"]`).length, 1);
			assert.type(this.plugins[plugin], {
				init: 'function',
				getValue: 'function'
			});

			this.plugins[plugin].init(this.form.querySelectorAll(`.field[name="${plugin}"]`));
		}

		this._bindFormHandlers();
		this._setInitialData(config.data);
	}

	getEl() {
		return this.form;
	}

	getOriginalData() {
		return this.data;
	}

	getData() {
		let
			data = {};

		this.form.querySelectorAll('.field').forEach(field => {
			let
				name = field.getAttribute('name');

			if (name in this.plugins) {
				data[name] = this.plugins[name].getValue();
			}
			else {
				if (field.closest('[type="file"],[type="files"]') === field) {
					data[name] = field.files;
				}
				else if (field.closest('[type="radio"]') === field) {
					let
						checkedField = this.form.querySelector('[type="radio"][name="' + name + '"]:checked');

					if (checkedField) {
						data[name] = checkedField.value;
					}
					else {
						data[name] = undefined;
					}
				}
				else if (field.closest('[type="checkbox"]') === field) {
					data[name] = field.closest(':checked') === field;
				}
				else if (field.closest('select[multiple]') === field) {
					data[name] = [];
					for (let i = 0; i < field.options.length; i++) {
						if (field.options[i].selected) {
							let
								value = field.options[i].value;

							if (value == parseInt(value)) {
								value = parseInt(value);
							}

							data[name].push(value);
						}
					}
				}
				else {
					data[name] = field.value || undefined;
				}
			}
		});

		return data;
	}

	getId() {
		return this.id;
	}

	isDirty() {
		return !this._compareObjects(this.data, this.getData());
	}

	/**
	 * @param {boolean} editable
	 */
	setEditable(editable) {
		assert.type(editable, 'boolean');

		if (editable != this.editable) {
			let
				buttons = this.getButtons();

			this.editable = editable;

			if (!editable) {
				this.cancel();
			}

			if (buttons.edit) {
				if (editable && this.displayEdit) {
					buttons.edit.style.display = null;
				}
				else {
					buttons.edit.style.display = 'none';
				}
			}
		}
	}

	/**
	 * @param {Object} data
	 */
	setData(data) {
		assert.type(data, '{}');

		this.form.querySelectorAll('.field').forEach(field => {
			let
				name = field.getAttribute('name'),
				value = data[name];

			if (name in data) {
				if (value === undefined) {
					value = '';
				}
				else if (field.closest('select') === field && !value) {
					let
						option = field.querySelector('option');

					value = option ? option.value : undefined;
				}
				else if (field.getAttribute('type') === 'checkbox' && typeof value === 'string') {
					value = value === 'on' ? true : false;
				}

				if (value !== undefined) {
					if (field.closest('[type="radio"]') === field) {
						let
							fieldToCheck = this.form.querySelector('[type="radio"][name="' + name + '"]');

						if (fieldToCheck) {
							fieldToCheck.checked = true;
						}
					}
					else if (field.closest('[type="checkbox"]') === field) {
						field.checked = value;
					}
					else if (field.closest('select') === field) {
						let
							optionToSelect;

						if (!(value instanceof Array)) {
							value = [value];
						}

						value.forEach(optionValue => {
							optionToSelect = field.querySelector('option[value="' + optionValue + '"]');

							if (optionToSelect) {
								optionToSelect.selected = true;
							}
						});
					}
					else {
						field.value = value;
					}
				}

				this.data[name] = data[name] || undefined;
			}
		});
	}

	/**
	 * @param {string} id
	 */
	setId(id) {
		assert.type(id, 'string');
		this.id = id;
	}

	edit() {
		let
			firstField,
			buttons = this._getButtons();

		this.form.classList.add('active');

		if (buttons.addNew) {
			buttons.addNew.style.display = 'none';
		}

		if (buttons.edit) {
			buttons.edit.style.display = 'none';
		}

		if (buttons.save) {
			buttons.save.style.display = null;
		}

		if (buttons.cancel) {
			buttons.cancel.style.display = this.persistentEditMode ? 'none' : null;
		}

		if (buttons.delete) {
			buttons.delete.style.display = this.displayDelete ? null : 'none';
		}

		this.form.querySelectorAll('.field').forEach(field => {
			field.removeAttribute('readonly');
		});

		firstField = this.form.querySelector('.field:not([readonly])');

		if (firstField && this.autoFocus) {
			firstField.focus();
		}
	}

	cancel() {
		if (!this.persistentEditMode) {
			let
				buttons = this._getButtons();

			this.form.classList.remove('active');

			if (this.form.classList.contains('entry') && buttons.addNew) {
				buttons.addNew.parentNode.removeChild(buttons.addNew);
				delete buttons.addNew;
			}
			else if (buttons.addNew) {
				buttons.addNew.style.display = null;
			}

			this.form.querySelectorAll('.field').forEach(field => {
				field.setAttribute('readonly', 'readonly');
			});

			if (buttons.edit) {
				buttons.edit.style.display = this.displayEdit ? null : 'none';
			}

			if (buttons.save) {
				buttons.save.style.display = 'none';
			}

			if (buttons.cancel) {
				buttons.cancel.style.display = 'none';
			}

			if (buttons.delete) {
				buttons.delete.style.display = 'none';
			}

			if (document.activeElement.closest('form') === this.form) {
				document.activeElement.blur();
				window.getSelection().empty();
			}
		}

		this.reset();
	}

	save() {
		this.validateForm()
			.then(validations => {
				if (validations.every(validation => {
					return validation;
				})) {
					this.dirty = false;
					assert.type(this.handlers.save, 'function');
					this.handlers.save.call(this);

					if (this.displayLoadingMask) {
						this.showLoadingMask();
					}
				}
			})
			.catch(reason => {
				console.error(reason);
			});
	}

	reset() {
		this.setData(this.data);
		this.hideLoadingMask();
		this.resetValidation();
		this.dirty = false;
	}

	validateForm() {
		let
			pendingValidations = [];

		this.form.querySelectorAll('.field[data-validators]:not([readonly])').forEach(field => {
			pendingValidations.push(this.validateField(field));
		});
		return Promise.all(pendingValidations);
	}

	/**
	 * @param {Element} field
	 * @return {(boolean|Promise)}
	 */
	validateField(field) {
		let
			valid,
			labels = this._getLabels(field),
			fieldName = field.getAttribute('name'),
			validationValue = field.value,
			validators = (field.getAttribute('data-validators') || 'default').split(' '),
			validationWaterfall = new Waterfall();

		if (field.getAttribute('type') == 'checkbox') {
			validationValue = field.checked;
		}

		if (field.getAttribute('type') == 'radio') {
			let
				checkedField = this.form.querySelector('[name="' + field.getAttribute('name') + '"]:checked');

			if (checkedField) {
				validationValue = checkedField.value;
			}
			else {
				validationValue = undefined;
			}
		}

		if (validators.indexOf('passwordConfirm') >= 0) {
			let
				relatedField = this.form.querySelector(`[name="${field.getAttribute('data-related-field')}"]`);

			validationValue = {
				password: relatedField ? relatedField.value : undefined,
				passwordConfirm: field.value
			};
		}

		if ((fieldName in this.validatedValues) && JSON.stringify(this.validatedValues[fieldName].value) === JSON.stringify(validationValue)) {
			let
				validationResult = this.validatedValues[fieldName].valid;

			if (validationResult instanceof Promise) {
				valid = validationResult;
			}
			else {
				valid = Promise.resolve(validationResult);
			}
		}
		else {
			this.validatedValues[fieldName] = {
				value: validationValue
			};

			valid = validationWaterfall.exec(validators.map(validator => {
				return () => {
					let
						fieldValidation = (this.validators[validator] || this.validators.default).call(this, validationValue, field);

					if (typeof fieldValidation === 'function') {
						fieldValidation = fieldValidation();
					}

					if (!(fieldValidation instanceof Promise)) {
						fieldValidation = Promise.resolve(fieldValidation);
					}

					return fieldValidation
						.then(validationResult => {
							if (this.form.classList.contains('active')) {
								if (validationResult.valid || !this.form.classList.contains('active')) {
									field.classList.remove('invalid');

									if (labels.length) {
										labels.forEach(label => {
											label.classList.remove('invalid');
										});
									}
								}
								else {
									validationWaterfall.stop();
									field.classList.add('invalid');

									if (labels.length) {
										labels.forEach(label => {
											label.classList.add('invalid');
											label.setAttribute('data-hint', validationResult.hint || '');
										});
									}
								}
								this.validatedValues[fieldName].valid = validationResult.valid;
								return validationResult.valid;
							}
							else {
								validationWaterfall.stop();
								return true;
							}
						});
				};
			}));

			this.validatedValues[fieldName].valid = valid;
		}

		return valid;
	}

	resetValidation() {
		this.form.querySelectorAll('.invalid').forEach(field => {
			field.classList.remove('invalid');
		});
		this.validatedValues = {};
	}

	showLoadingMask() {
		let
			loadingMask = this.form.querySelector('.loading-mask');

		if (loadingMask) {
			loadingMask.classList.add('active');
		}
	}

	hideLoadingMask() {
		let
			loadingMask = this.form.querySelector('.loading-mask');

		if (loadingMask) {
			loadingMask.classList.remove('active');
		}
	}

	/**
	 * @param  {Element} field
	 */
	_validatePreviousFields(field) {
		let
			fieldVisited = false;

		// validate all previous fields
		this.form.querySelectorAll('.field:not([readonly])').forEach(item => {
			if (field === item) {
				fieldVisited = true;
			}

			if (!fieldVisited) {
				this.validateField(item);
			}
		});
	}

	_bindFormHandlers() {
		let
			buttons = this._getButtons();

		this.form.addEventListener('click', ev => {
			if (ev.target.tagName !== 'A' && this.editable && this.editOnClick) {
				ev.stopPropagation();

				if (this.form.querySelectorAll('.field[readonly]').length) {
					this.editFields();
				}
			}
		});

		this.form.addEventListener('submit', ev => {
			ev.preventDefault();
			ev.stopPropagation();
			this.save();
		});

		if (buttons.edit) {
			buttons.edit.addEventListener('click', ev => {
				if (this.editable) {
					ev.preventDefault();
					ev.stopPropagation();
					this.edit();
				}
			});
		}

		if (buttons.save) {
			buttons.save.addEventListener('click', ev => {
				ev.preventDefault();
				ev.stopPropagation();
				this.save();
			});
		}

		if (buttons.cancel) {
			buttons.cancel.addEventListener('click', ev => {
				ev.preventDefault();
				ev.stopPropagation();
				this.cancel();

				if (this.handlers.cancel) {
					this.handlers.cancel.call(this);
				}
			});
		}

		if (buttons.delete) {
			buttons.delete.addEventListener('click', ev => {
				assert.type(this.handlers.delete, '?function');

				ev.preventDefault();
				ev.stopPropagation();

				if (this.handlers.delete) {
					this.handlers.delete.call(this);
				}

				if (this.displayLoadingMask) {
					this.showLoadingMask();
				}
			});
		}

		this.form.querySelectorAll('.field').forEach(field => {
			let
				handler = ev => {
					let
						field = ev.currentTarget,
						labels = this._getLabels(field);

					field.classList.remove('invalid');

					if (labels) {
						labels.forEach(label => {
							label.classList.remove('invalid');
						});
					}

					if (this.handlers.change) {
						this.handlers.change();
					}
					this.dirty = true;
				};

			field.addEventListener('input', handler);
			field.addEventListener('change', handler);
			field.addEventListener('focus', ev => {
				this._validatePreviousFields(ev.currentTarget);
			});
			field.addEventListener('blur', ev => {
				let
					fields = this.form.querySelectorAll('.field:not([readonly])');

				if (ev.currentTarget === fields[fields.length - 1]) {
					this.validateForm();
				}

				// validate only if there's any value to not bother user during walking through empty fields
				if (ev.currentTarget.value !== undefined) {
					this.validateField(ev.currentTarget);
				}
			});
		});

		this.form.querySelectorAll('select.field').forEach(field => {
			field.addEventListener('keydown', ev => {
				// ENTER
				if (ev.keyCode === 13) {
					ev.preventDefault();
					this.save();
				}
			});
		});

		document.addEventListener('keydown', ev => {
			// ESC
			if (ev.keyCode === 27 && ev.target.closest('form') === this.form) {
				ev.preventDefault();
				ev.stopPropagation();
				this.cancel();

				if (this.handlers.cancel) {
					this.handlers.cancel.call(this);
				}
			}
		});

		window.addEventListener('beforeunload', () => {
			if (this.dirty) {
				return this._translate('You have unsaved changes, do you really want to leave?');
			}
		});
	}

	_getButtons() {
		return {
			addNew: this.form.querySelector('.add-new'),
			edit: this.form.querySelector('.edit-button'),
			save: this.form.querySelector('.save-button'),
			cancel: this.form.querySelector('.cancel-button'),
			delete: this.form.querySelector('.delete-button')
		};
	}

	/**
	 * @param  {Element} field
	 * @return {Element}
	 */
	_getLabels(field) {
		let
			labels = [],
			fields = this.form.querySelectorAll('[name="' + field.getAttribute('name') + '"]');

		fields.forEach(field => {
			let
				fieldId = field.getAttribute('id');

			this.form.querySelectorAll('label[for="' + fieldId + '"]').forEach(label => {
				labels.push(label);
			});
		});

		return labels;
	}

	/**
	 * Sets initial data for each form field
	 * @param {Object} data
	 */
	_setInitialData(data) {
		assert.type(data, '?{}');

		let
			initialData = this.getData();

		Object.assign(initialData, data || {});
		this.setData(initialData);
	}

	/**
	 * Deep object property comparison
	 * @param  {Object} a
	 * @param  {Object} b
	 * @param  {boolean} strict strict value equality
	 * @return {boolean}
	 */
	_compareObjects(a, b, strict) {
		let
			equals = false,
			keyListA = Object.keys(a).sort().join(),
			keyListB = Object.keys(b).sort().join();

		if (keyListA === keyListB) {
			for (let key in a) {
				if (typeof key === 'object') {
					equals = this.compareObjects(a[key], b[key]);

					if (!equals) {
						break;
					}
				}
				else if (strict) {
					equals = (a[key] === b[key]);

					if (!equals) {
						console.warn('Key', key, 'is not strict equal');
						break;
					}
				}
				else {
					equals = (a[key] == b[key]);

					if (!equals) {
						console.warn('Key', key, 'is not equal');
						break;
					}
				}
			}
		}
		else {
			console.warn('Objects have different key list:');
			console.warn(keyListA);
			console.warn(keyListB);
		}

		return equals;
	}

	_translate(text) {
		if (typeof this.translate === 'function') {
			return this.translate(text);
		}
		else {
			return text;
		}
	}
}

Form.prototype.VALIDATORS = {
	default: function() {
		return {
			valid: true
		};
	},
	required: function(value) {
		return {
			valid: !!(value && value.length),
			hint: this._translate('This field is required')
		};
	},
	email: function(value) {
		return {
			valid: !value || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/.test(value),
			hint: this._translate('E-mail value has wrong format')
		};
	},
	passwordConfirm: function(value) {
		return {
			valid: value.password === value.passwordConfirm,
			hint: this._translate('Both passwords have to be equal')
		};
	},
	checked: function(value) {
		assert.type(value, 'boolean');

		return {
			valid: value,
			hint: this._translate('This field has to be checked')
		};
	},
	unchecked: function(value) {
		assert.type(value, 'boolean');

		return {
			valid: !value,
			hint: this._translate('This field has to be unchecked')
		};
	}
};
