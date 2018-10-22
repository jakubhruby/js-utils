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
	 * @param {Function} config.handlers.save is called when the form is submitted
	 * @param {Function} [config.handlers.delete] is called when delete button is pressed
	 * @param {Function} [config.handlers.change] is called when any field changes its value
	 * @param {String} [config.id] form identification
	 * @param {Object} [config.validators] validation functions dictionary, each in form validatorName(value, field) {return {valid: [Boolean], hint: [String]}}
	 * @param {Object} [config.plugins] dictionary of special fields, each in form {init: fn(field) {}, getValue() {return value;}}
	 * @param {Boolean} [config.editable] enable form editing @default true
	 * @param {Boolean} [config.editOnClick] enable edit mode by clicking somewhere on form @default false
	 * @param {Boolean} [config.persistentEditMode] edit mode is always enabled (standard form) @default true
	 * @param {Boolean} [config.displayEdit] display edit button @default false
	 * @param {Boolean} [config.displayDelete] display delete button @default false
	 * @param {Boolean} [config.displayLoadingMask] display overlay with loading icon when saving form @default false
	 */
	constructor(config) {
		assert.type(config, {
			form: 'element',
			handlers: {
				save: 'fn',
				delete: '?fn',
				change: '?fn'
			},
			id: '?string',
			validators: '?{}',
			plugins: '?{}',
			editable: '?boolean',
			editOnClick: '?boolean',
			persistentEditMode: '?boolean',
			displayEdit: '?boolean',
			displayDelete: '?boolean',
			displayLoadingMask: '?boolean'
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

		this.validatedValues = {};
		this.data = {};

		if (this.persistentEditMode) {
			this.editFields();
		}

		for (let plugin in this.plugins) {
			assert.value(this.form.querySelectorAll(`.field[name="${plugin}"]`).length, 1);
			assert.type(this.plugins[plugin], {
				init: 'fn',
				getValue: 'fn'
			});

			this.plugins[plugin].init(this.form.querySelectorAll(`.field[name="${plugin}"]`));
		}

		this._bindFormHandlers();
		this.setData(config.data || {});
		this.cancelEdit();
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

			if (this.plugins.hasOwnProperty(name)) {
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
				else {
					data[name] = field.value;
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

	setEditable(editable) {
		assert.type(editable, 'boolean');

		if (editable != this.editable) {
			let
				buttons = this.getButtons();

			this.cancelEdit();
			this.editable = editable;

			if (buttons.edit) {
				if (editable && this.displayEdit) {
					buttons.edit.style.display = 'block';
				}
				else {
					buttons.edit.style.display = 'none';
				}
			}
		}
	}

	setData(data) {
		assert.type(data, '{}');

		this.form.querySelectorAll('.field').forEach(field => {
			let
				name = field.getAttribute('name');

			if (data.hasOwnProperty(name)) {
				if (data[name] === undefined) {
					data[name] = '';
				}
				else if (field.closest('select') === field && !data[name]) {
					let
						option = field.querySelector('option');

					data[name] = option ? option.value : undefined;
				}
				else if (field.getAttribute('type') === 'checkbox' && typeof data[name] === 'string') {
					data[name] = data[name] === 'on' ? true : false;
				}

				if (data[name] !== undefined) {
					if (field.closest('[type="radio"]') === field) {
						let
							fieldToCheck = this.form.querySelector('[type="radio"][name="' + name + '"]');

						if (fieldToCheck) {
							fieldToCheck.checked = true;
						}
					}
					else if (field.closest('[type="checkbox"]') === field) {
						field.checked = data[name];
					}
					else if (field.closest('select') === field) {
						let
							optionToSelect = field.querySelector('option[value="' + data[name] + '"]');

						if (optionToSelect) {
							optionToSelect.selected = true;
						}
					}
					else {
						field.value = data[name];
					}
				}
				this.data[name] = data[name];
			}
		});
	}

	setId(id) {
		assert.type(id, 'string');
		this.id = id;
	}

	editFields() {
		let
			buttons = this._getButtons(),
			firstField = this.form.querySelector('.field:not(.readonly)');

		this.form.classList.add('active');

		if (buttons.addNew) {
			buttons.addNew.style.display = 'none';
		}

		if (buttons.edit) {
			buttons.edit.style.display = 'none';
		}

		if (buttons.save) {
			buttons.save.style.display = 'block';
		}

		if (buttons.cancel) {
			buttons.cancel.style.display = 'block';
		}

		if (buttons.delete && this.displayDelete) {
			buttons.delete.style.display = 'block';
		}

		this.form.querySelectorAll('.field').forEach(field => {
			field.classList.remove('readonly');
			field.disabled = false;
		});

		if (firstField) {
			firstField.focus();
		}
	}

	cancelEdit() {
		let
			buttons = this._getButtons();

		if (!this.persistentEditMode) {
			this.form.classList.remove('active');

			if (this.form.classList.contains('entry') && buttons.addNew) {
				buttons.addNew.parentNode.removeChild(buttons.addNew);
				delete buttons.addNew;
			}
			else if (buttons.addNew) {
				buttons.addNew.style.display = 'block';
			}

			this.form.querySelectorAll('.field').forEach(field => {
				field.classList.add('readonly');
				field.disabled = true;
			});

			if (buttons.edit && this.displayEdit) {
				buttons.edit.style.display = 'block';
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

			document.activeElement.blur();
			window.getSelection().empty();
		}

		this.hideLoadingMask();
		this.form.querySelectorAll('.invalid').forEach(field => {
			field.classList.remove('invalid');
		});
		this.setData(this.data);
		this.validatedValues = {};
		this.dirty = false;
	}

	save() {
		this.validateForm()
			.then(function(validations) {
				if (validations.every(function(validation) {
					return validation;
				})) {
					this.dirty = false;
					assert.type(this.handlers.save, 'fn');
					this.handlers.save.call(this);

					if (this.displayLoadingMask) {
						this.showLoadingMask();
					}
				}
			}.bind(this))
			.catch(function(reason) {
				console.error(reason);
			});
	}

	validateForm() {
		let
			pendingValidations = [];

		this.form.querySelectorAll('.field[data-validators]:not(.readonly)').forEach(field => {
			pendingValidations.push(this.validateField(field));
		});
		return Promise.all(pendingValidations);
	}

	/**
	 * @return {oolean or Promise}
	 */
	validateField(field) {
		let
			valid,
			label = this._getLabel(field),
			fieldName = field.getAttribute('name'),
			validationValue = field.value,
			validators = (field.getAttribute('data-validators') || 'default').split(' '),
			validationWaterfall = new Waterfall(),
			defaultValidator = function() {
				return {
					valid: true
				};
			};

		if (field.closest('[type="checkbox"]') == field) {
			validationValue = field.checked;
		}

		if (validators.indexOf('passwordConfirm') >= 0) {
			let
				relatedField = this.form.querySelector(`[name="${field.getAttribute('data-related-field')}"]`);

			validationValue = {
				password: relatedField ? relatedField.value : undefined,
				passwordConfirm: field.value
			};
		}

		if (this.validatedValues.hasOwnProperty(fieldName) && JSON.stringify(this.validatedValues[fieldName].value) === JSON.stringify(validationValue)) {
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

			valid = validationWaterfall.exec(validators.map(function(validator) {
				return function() {
					let
						fieldValidation = (this.validators[validator] || defaultValidator).call(this, validationValue, field);

					if (typeof fieldValidation === 'function') {
						fieldValidation = fieldValidation();
					}

					if (!(fieldValidation instanceof Promise)) {
						fieldValidation = Promise.resolve(fieldValidation);
					}

					return fieldValidation
						.then(function(validationResult) {
							if (validationResult.valid || !this.$form.hasClass('active')) {
								field.classList.remove('invalid');

								if (label) {
									label.classList.remove('invalid');
								}
							}
							else {
								validationWaterfall.stop();
								field.classList.add('invalid');

								if (label) {
									label.classList.add('invalid');
									label.setAttribute('data-hint', validationResult.hint || '');
								}
							}
							this.validatedValues[fieldName].valid = validationResult.valid;
							return validationResult.valid;
						}.bind(this));
				}.bind(this);
			}, this));

			this.validatedValues[fieldName].valid = valid;
		}

		return valid;
	}

	resetValidation() {
		this.validatedValues = {};
	}

	_validatePreviousFields(field) {
		let
			fieldVisited = false;

		// validate all previous fields
		this.form.querySelectorAll('.field:not(.readonly)').forEach(item => {
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

		this.form.addEventListener('click', event => {
			if (event.target.tagName !== 'A' && this.editable && this.editOnClick) {
				event.stopPropagation();

				if (this.form.querySelectorAll('.field.readonly').length) {
					this.editFields();
				}
			}
		});

		this.form.addEventListener('submit', event => {
			event.preventDefault();
			event.stopPropagation();
			this.save();
		});

		if (buttons.edit) {
			buttons.edit.addEventListener('click', event => {
				if (this.editable) {
					event.stopPropagation();
					this.editFields();
				}
			});
		}

		if (buttons.save) {
			buttons.save.addEventListener('click', event => {
				event.stopPropagation();
				this.save();
			});
		}

		if (buttons.cancel) {
			buttons.cancel.addEventListener('click', event => {
				event.stopPropagation();
				this.cancelEdit();
			});
		}

		if (buttons.delete) {
			buttons.delete.addEventListener('click', event => {
				assert.type(this.handlers.delete, '?fn');

				event.preventDefault();
				event.stopPropagation();

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
				handler = event => {
					let
						field = event.target,
						label = this._getLabel(field);

					field.classList.remove('invalid');

					if (label) {
						label.classList.remove('invalid');
					}
					this.dirty = true;
				};

			field.addEventListener('input', handler);
			field.addEventListener('change', handler);
			field.addEventListener('focus', event => {
				this._validatePreviousFields(event.target);
			});
			field.addEventListener('blur', event => {
				let
					fields = this.form.querySelectorAll('.field:not(.readonly)');

				if (event.target === fields[fields.length - 1]) {
					this.validateForm();
				}

				// validate only if there's any value to not bother user during walking through empty fields
				if (event.target.value !== undefined) {
					this.validateField(event.target);
				}
			});
		});

		this.form.querySelectorAll('select.field').forEach(field => {
			field.addEventListener('keydown', event => {
				// ENTER
				if (event.keyCode === 13) {
					event.preventDefault();
					this.save();
				}
			});
		});

		document.addEventListener('keydown', event => {
			// ESC
			if (event.keyCode === 27 && event.target.closest('form') === this.form) {
				event.preventDefault();
				event.stopPropagation();
				this.cancelEdit();
			}
		});

		window.addEventListener('beforeunload', () => {
			if (this.dirty) {
				return this._translate('You have unsaved changes, do you really want to leave?');
			}
		});
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

	_getButtons() {
		return {
			addNew: this.form.querySelector('.add-new'),
			edit: this.form.querySelector('.edit-button'),
			save: this.form.querySelector('.save-button'),
			cancel: this.form.querySelector('.cancel-button'),
			delete: this.form.querySelector('.delete-button')
		};
	}

	_getLabel(field) {
		let
			label,
			fieldId = field.getAttribute('id');

		if (fieldId !== undefined) {
			label = this.form.querySelector('label[for="' + fieldId + '"]');
		}

		return label;
	}

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

exports.Form = Form;
