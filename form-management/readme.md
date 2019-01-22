# form-management
Layer for advanced form field validation and user interaction handling.

## Install
```
npm install form-management
```

## Usage
```html
<form id="myForm">
	<label for="myInput">My input</label>
	<input type="text" name="myInput" id="myInput" class="field" data-validators="required myValidator"/>
	<input type="submit" value="Submit"/>
</form>
```
```javascript
import formManagement from 'form-management';

const {Form} = formManagement;

let Form = new Form({
	form: document.querySelector('#myForm'),
	handlers: {
		save: () => {
			alert('Ready to submit');
		}
	},
	validators: {
		myValidator: (value, field) => {
			return {
				valid: checkMyFieldValue(field, value),
				hint: 'This field is not valid'
			};
		}
	}
})

function checkMyFieldValue(field, value) {
	// custom field validation rule
}
```

#### Form.constructor(config)
##### config |`object`
- `form`|`element` - `<form>` element
- `handlers`|`object` - event handlers
	- `save`|`function` - is called when the form is submitted
	- `delete`|`function`_optional_ - is called when delete button is pressed
	- `change`|`function`_optional_ - is called when any field changes its value
	- `cancel`|`function`_optional_ - is called when edit is cancelled
- `id`|`string`_optional_ - custom form identification
- `validators`|`object`_optional_ - validation functions dictionary, each in form `validatorName(value, field) {return {valid: [Boolean], hint: [String]}}`
- `plugins`|`object`_optional_ - dictionary of special fields, each in form `{init: fn(field) {}, getValue() {return value;}}`
- `editable`|`boolean`_optional_ - enable form editing. Default is `true`.
- `editOnClick`|`boolean`_optional_ - enable edit mode by clicking somewhere on form. Default is `false`.
- `persistentEditMode`|`boolean`_optional_ - edit mode is always enabled (standard form behavior). Default is `true`.
- `displayEdit`|`boolean`_optional_ - display edit button. Default is `false`.
- `displayDelete`|`boolean`_optional_ - display delete button. Default is `false`.
- `displayLoadingMask`|`boolean`_optional_ - display overlay with loading icon when saving form. Default is `false`.
- `translate`|`function`_optional_ - translate function in form `function(text) {return translatedText;}`
- `autoFocus`|`boolean`_optional_ - focus the first editable field on edit start. Default is `false`

#### Form.getEl()
Returns `<form>` element associated with the `Form` instance.

#### Form.getOriginalData()
Returns key-value object with initial form data representation.
- text inputs and selectables return `string`
- checkboxes return `boolean`

#### Form.getData()
Returns key-value object with current form data representation.
- text inputs and selectables return `string`
- checkboxes return `boolean`

#### Form.getId()
Returns custom form ID set in `constructor`.

#### Form.isDirty()
Returns `true` if current data differs from initial data, else `false`;

#### Form.setEditable(editable)
Sets form editable or not editable. If new `editable` state differs from current `editable` state, form editing is cancelled.
##### editable |`boolean`
New `editable` state to be set

#### Form.setData(data)
Sets new initial data and overwrites values in fields.
##### data |`object`
Key-value object with new form data.
- value for text inputs and selectables should be `string`
- value for checkboxes should be `boolean`
- if value is `undefined`, the field is cleared
- if field name is not listed in keys, nothing happen to the field

#### Form.setId(id)
Sets new custom identification.
##### id |`string`

#### Form.edit()
Switches to editing mode (if not yet) and focuses the first editable field.

#### Form.cancel()
Switches to read mode (if not disabled by `persistentEditMode`), removes validation hints and invalid states, cleares dirty state and blurs form fields.

#### Form.save()
Runs form validation and calls `save` handler if successfull.

#### Form.reset()
Resets form to the default state using original data values.

#### Form.validateForm()
Validates all form fields.

#### Form.validateField(field)
Iterates all fields validators contained in `data-validators` attribute.

If validator returns `valid: false`, validation stops immediately and sets `invalid` class to the field element. If there's a `label` with proper `for` attribute, it gets `data-hint` attribute containing validator `hint` (if any). The `label` also gets `invalid` class.

Validation is executed just once until field value changes.
##### field |`element`

#### Form.resetValidation()
Clears validation cache for field values.

### Read/edit mode
Form is useful when you want to have your form in two states - read only (for record representation) and edit (for record editing). By accessing the edit mode (by clicking `.edit-button` or whole `form` in case of `editOnClick` is `true`) the `<form>` element gets `active` class.

You may also add more control buttons for save, delete, cancel or adding new record.
```html
<form id="myForm">
	<label for="myInput">My input</label>
	<input type="text" name="myInput" id="myInput" class="field" data-validators="required myValidator"/>

	<input type="button" value="Edit" class="edit-button"/>
	<input type="button" value="Save" class="save-button"/>
	<input type="button" value="Cancel" class="cancel-button"/>
	<input type="button" value="Delete" class="delete-button"/>
</form>
```
