<script setup>
import {ref, watch, onMounted, inject, computed, reactive} from "vue";
import {setStorage, getStorage, deleteStorage} from "../../js/localStorageHelper";

defineOptions({name: 'fontVariants'})

const emit = defineEmits(['open-overviews-tab']);

const isRequestPending = ref(false);
const translate = inject('translate');
const uploadedFonts = inject('uploadedFonts');
const selectedFont = inject('selectedFont');
const variantsData = ref(null);
const selectedVariant = ref(null);
const assignedClassNames = ref(null);

// store add font id
const addVariant = ref({
	variant: selectedVariant?.value?.id || '',
	font_name: '',
	file_url: '',
	file_id: '',
	assign_to: ''
});

const snackbar = reactive({
	show: false,
	className: 'lfu-snackbar',
	message: "",
	icon: "mdi-message-reply-outline",
});

const alertDialog = reactive({
	show: false,
	className: "",
	icon: "mdi-information",
	title: "",
	message: "",
	onOkClick: () => {
		alertDialog.show = false;
	}
});

const confirmationDialog = reactive({
	show: false,
	className: 'lfu-popup-box',
	icon: 'mdi-delete-empty-outline',
	title: '',
	message: '',
	onConfirm: () => {},
	onCancel: () => confirmationDialog.show = false
});

const assignVariantDialog = reactive({
	show: false,
	onConfirm: () => {},
	onCancel: () => assignVariantDialog.show = false
});

const defaultVariantConfig = [
	{id: "100", label: "Thin (100)"},
	{id: "100italic", label: "Thin Italic (100 Italic)"},
	{id: "200", label: "Extra Light (200)"},
	{id: "200italic", label: "Extra Light Italic (200 Italic)"},
	{id: "300", label: "Light (300)"},
	{id: "300italic", label: "Light Italic (300 Italic)"},
	{id: "400", label: "Regular (400)"},
	{id: "400italic", label: "Regular Italic (400 Italic)"},
	{id: "500", label: "Medium (500)"},
	{id: "500italic", label: "Medium Italic (500 Italic)"},
	{id: "600", label: "Semi Bold (600)"},
	{id: "600italic", label: "Semi Bold Italic (600 Italic)"},
	{id: "700", label: "Bold (700)"},
	{id: "700italic", label: "Bold Italic (700 Italic)"},
	{id: "800", label: "Extra Bold (800)"},
	{id: "800italic", label: "Extra Bold Italic (800 Italic)"},
	{id: "900", label: "Black (900)"},
	{id: "900italic", label: "Black Italic (900 Italic)"}
];

/**
 * Computes a list of font variant options that are not already present in `variantsData`.
 *
 * This function ensures that the default font variants are filtered based on the existing
 * variants in `variantsData`, preventing duplicates.
 *
 * @constant {ComputedRef<Array<Object>>} fontVariantOptions
 * @returns {Array<Object>} An array of font variant objects that are not already in `variantsData`.
 */
const fontVariantOptions = computed(() => {

	// Ensure variantsData.value exists before accessing it to avoid errors
	if (!variantsData.value) return defaultVariantConfig;

	// Convert variantsData into a Set for faster lookups
	const existingVariants = new Set(variantsData.value.map(v => v.variant));

	// Filter out font variants that already exist
	return defaultVariantConfig.filter(option => !existingVariants.has(option.id));

});

/**
 * Computes a sorted list of font variants based on the predefined default order.
 *
 * This function ensures that `variantsData` follows the order defined in `defaultVariantConfig`
 * by mapping each variant ID to its index in `defaultVariantConfig` and sorting accordingly.
 *
 * @constant {ComputedRef<Array<Object>>} sortedVariantsData
 * @returns {Array<Object>} A sorted array of font variant objects, maintaining the order
 *          defined in `defaultVariantConfig`. Variants not found in `defaultVariantConfig`
 *          will appear at the end.
 */
const sortedVariantsData = computed(() => {
	if (!variantsData.value) return [];

	// Create a map for fast lookup of index in defaultVariantConfig
	const orderMap = new Map(defaultVariantConfig.map((item, index) => [item.id, index]));

	// Sort variantsData based on defaultVariantConfig order
	return [...variantsData.value].sort((a, b) => {
		return (orderMap.get(a.variant) ?? Infinity) - (orderMap.get(b.variant) ?? Infinity);
	});
});


/**
 * Formats a font variant ID to its corresponding label.
 *
 * This function takes a variant ID (e.g., "200italic") and returns the corresponding label
 * from `defaultVariantConfig`. If the ID does not exist in the configuration, it returns
 * the original variant ID as a fallback.
 *
 * @function formattedVariant
 * @param {string} variant - The font variant ID to format (e.g., "200italic").
 * @returns {string} The formatted font variant label (e.g., "Extra Light Italic (200 Italic)"),
 * or the original ID if not found.
 */
const formattedVariant = (variant) => {
	const variantObj = defaultVariantConfig.find(
		(option) => option.id === variant
	);
	return variantObj ? variantObj.label : variant;
};

/**
 * Emits an event to open the overview tab.
 *
 * This function triggers the 'open-overviews-tab' event using the `emit` function,
 * allowing parent components to listen and handle the event accordingly.
 *
 * @function openOverviewTabTrigger
 * @fires open-overviews-tab
 */
const openOverviewTabTrigger = () => {
	emit('open-overviews-tab');
};

/**
 * Function to open the snackbar dialog with dynamic data.
 * @param {Object} newData - The data to update the snackbar dialog.
 */
const showSnackbar = (newData) => {
	if (snackbar.show) {
		snackbar.show = false; // Force close before setting new data
	}
	Object.assign(snackbar, newData, {show: true});
};

/**
 * List of valid HTML tag names to exclude from adding a dot.
 */
const htmlTags = new Set([
	"a", "abbr", "address", "area", "article", "aside", "audio", "b", "base", "bdi", "bdo", "blockquote", "body",
	"br", "button", "canvas", "caption", "cite", "code", "col", "colgroup", "data", "datalist", "dd", "del", "details",
	"dfn", "dialog", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "footer", "form",
	"h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hr", "html", "i", "iframe", "img", "input", "ins",
	"kbd", "label", "legend", "li", "link", "main", "map", "mark", "meta", "meter", "nav", "noscript", "object",
	"ol", "optgroup", "option", "output", "p", "param", "picture", "pre", "progress", "q", "rp", "rt", "ruby",
	"s", "samp", "script", "section", "select", "small", "source", "span", "strong", "style", "sub", "summary",
	"sup", "svg", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "title", "tr",
	"track", "u", "ul", "var", "video", "wbr"
]);

/**
 * Checks if a selector is valid.
 *
 * @param {string} selector - The selector to validate.
 * @returns {boolean} - Returns true if the selector is valid, otherwise false.
 */
const isValidSelector = (selector) => {
	const regex = /^([.#]?[a-zA-Z_][a-zA-Z0-9_-]*|\*)?(?:\s*[>+~]?\s*[.#]?[a-zA-Z_][a-zA-Z0-9_-]*)*$/;
	return regex.test(selector.trim());
};

/**
 * Ensures a selector has a dot prefix if it's not a valid HTML tag.
 *
 * @param {string} selector - The selector to fix.
 * @returns {string} - The corrected selector.
 */
const fixSelector = (selector) => {
	return selector
		.split(/(\s*[>+~]\s*|\s+)/) // Keep combinators (> + ~) and whitespace intact
		.map(part => {
			const trimmed = part.trim();
			if (trimmed === "" || trimmed.match(/^[>+~]$/)) return part; // Preserve combinators
			if (!htmlTags.has(trimmed) && !trimmed.startsWith(".") && !trimmed.startsWith("#") && !trimmed.startsWith(":")) {
				return `.${trimmed}`; // Add `.` if it's not an HTML tag
			}
			return trimmed;
		})
		.join(""); // Avoid adding extra spaces
};

/**
 * Auto-fixes a selector list by trimming spaces, adding dots where necessary, and ensuring proper format.
 *
 * @param {string} selectorList - A comma-separated list of selectors.
 * @returns {string} - A cleaned and formatted selector list.
 */
const autoFixSelectorList = (selectorList) => {
	return selectorList
		.split(',')
		.map(selector => selector.trim()) // Trim spaces
		.map(fixSelector) // Fix each selector
		.filter(selector => isValidSelector(selector)) // Remove invalid selectors
		.join(', '); // Reconstruct the cleaned-up string
};

/**
 * Validates whether the currently selected font exists in the uploadedFonts list.
 * If the font does not exist or is invalid, it returns false.
 *
 * @returns {boolean} True if the selected font exists in the uploadedFonts list, otherwise false.
 */
const isValidSelectedFont = () => {
	return !!(selectedFont.value.name && uploadedFonts.value.some(({name}) => name === selectedFont.value.name));
};

/**
 * Watches for changes in `selectedFont` and fetches font variants asynchronously.
 *
 * @param {Object} selectedFont - The currently selected font object.
 * @param {Object} newValue - The updated selected font object.
 * @returns {Promise<void>} - A promise that resolves after fetching font variants.
 */
watch(selectedFont,
	async (newValue) => {
		if (newValue?.name) {
			await fetchFontVariants(newValue.name);  // Fetch font variants asynchronously
		}
	},
	{deep: true} // Ensure reactivity when nested properties change
);

/**
 * Watches for changes in `selectedVariant` and updates `addVariant.variant`.
 *
 * @param {string} newValue - The updated selected variant.
 */
watch(selectedVariant, (newValue) => {
	addVariant.value.variant = newValue || ''; // Ensure it's always a string
});

/**
 * Watches for changes in the variantsData and updates the amount of a selected font
 * in the uploadedFonts array.
 *
 * @param {Array|any} variantsData - The data containing font variants, can be an array or other types.
 * @param {Function} watch - Vue's watch function to observe changes in variantsData.
 */
watch(variantsData, (newValue) => {

	if (!Array.isArray(newValue)) {
		return;
	}

	// Determine the number of variants
	const newCount = newValue.length

	// Find the index of the selected font in uploadedFonts
	const fontIndex = uploadedFonts.value.findIndex(font => font.id === selectedFont.value.id);

	// Update the font's amount if it exists in the uploadedFonts array
	if (fontIndex !== -1) {
		uploadedFonts.value[fontIndex].amount = newCount;
	}

});

onMounted(() => {

	// Validate the selected font
	if (!isValidSelectedFont()) {
		deleteStorage('localfuSavedFont'); // Remove invalid entry
		selectedFont.value = {}; // Reset selection
	}

	// fetch current various of selected font
	selectedFont.value.name && fetchFontVariants(selectedFont.value.name);
});

/**
 * Resets the `addVariant` object while optionally updating `font_name`.
 *
 * This function clears all values in the `addVariant` object. If a `fontName` is provided,
 * it updates the `font_name`; otherwise, the existing `font_name` remains unchanged.
 *
 * @param {string|null} [fontName=null] - (Optional) The name of the font to assign.
 *                                        If not provided, `font_name` is not modified.
 */
const clearAddVariant = (fontName = null) => {
	addVariant.value.variant = '';
	if (fontName !== null) {
		addVariant.value.font_name = fontName;
	}
	addVariant.value.file_url = '';
	addVariant.value.file_id = '';
	addVariant.value.assign_to = '';
};

/**
 * Function to open the alert dialog with dynamic data.
 * @param {Object} newData - The data to update the alert dialog.
 */
const showAlertDialog = (newData) => {
	Object.assign(alertDialog, newData, {show: true});
};

/**
 * Function to open the confirmation dialog with dynamic data.
 * @param {Object} newData - The data to update the confirmation dialog.
 */
const openDeleteConfirmation = (newData) => {
	Object.assign(confirmationDialog, newData, {
		show: true,
		onConfirm: () => {
			newData.onConfirm?.();
			confirmationDialog.show = false;
		},
		onCancel: () => {
			newData.onCancel?.();
			confirmationDialog.show = false;
		}
	});
};

/**
 * Fetches font variants for a specific font name via an AJAX request.
 *
 * This function sends a `POST` request with `FormData` containing the necessary action,
 * nonce, and font name. The response updates the `variantsData` state if successful.
 *
 * @param {string} fontName - The name of the font to fetch variants for.
 *
 * @returns {Promise<void>} - A promise that resolves when the data is fetched and processed.
 *
 * @example
 * await fetchFontVariants("Roboto"); // Fetch variants for the font "Roboto"
 *
 * @throws {Error} Logs a warning if the request fails or returns an unsuccessful response.
 */
const fetchFontVariants = async (fontName) => {

	// clear addVariant
	clearAddVariant(fontName);

	try {
		const formData = new FormData();

		formData.append("action", "localfuGetVariants");
		formData.append("_nonce", localfuAdminConfig.nonce);
		formData.append("data", JSON.stringify({font_name: fontName}));

		const response = await fetch(localfuAdminConfig.ajaxUrl, {
			method: "POST",
			body: formData,
		});

		const results = await response.json();
		if (results.success) {
			variantsData.value = results.data
		} else {
			showAlertDialog({
				title: translate.errorTitle,
				message: results.data,
				className: 'lfu-red',
				icon: 'mdi-information-outline',
			})
		}
	} catch (error) {
		console.warn(translate.ajaxRequestFailed, error);
	}
}

/**
 * Handles the font upload process using the WordPress media uploader.
 * This function opens a media frame for selecting font files and validates the selected file type.
 *
 * @param {Event} event - The event object from the triggering action.
 */
const uploadFontFrameTrigger = (event) => {

	event.preventDefault();

	// Check if wp.media is available
	if (typeof wp === 'undefined' || typeof wp.media === 'undefined') {
		console.error('Error: wp.media is not loaded.');
		return;
	}

	// If the media frame already exists, reopen it.
	if (window.fontUploaderFrame) {
		window.fontUploaderFrame.open();
		return;
	}

	// Create a new media frame
	window.fontUploaderFrame = wp.media({
		title: translate.uploadFontButton,
		button: {text: translate.useThisFile,},
		multiple: false, // Set to f to allow multiple files to be selected
	});

	// When a font file is selected in the media frame...
	window.fontUploaderFrame.on('select', function () {
		// Get file font
		const getFile = window.fontUploaderFrame.state().get('selection').map((font) => font.toJSON());

		// Allowed font file extensions
		const validFontExtensions = ['.ttf', '.otf', '.woff', '.woff2', '.eot'];

		if (getFile[0]) {
			const item = getFile[0];
			const fontUrl = item.url.toLowerCase();
			const fileExtension = fontUrl.substring(fontUrl.lastIndexOf('.'));
			if (validFontExtensions.includes(fileExtension)) {
				addVariant.value.file_url = item.url;
				addVariant.value.file_id = item.id;
			} else {
				showAlertDialog({
					title: translate.fontTypeAlertTitle,
					message: translate.fontTypeAlertDesc,
					className: 'lfu-red',
					icon: 'mdi-file-cancel-outline',
				});
			}
		}
	});

	// Open the font selection modal
	window.fontUploaderFrame.open();
};

/**
 * Validate the variant data before submitting.
 * Checks if required fields (font_id, variant, file_id, file_url) are provided.
 * If any field is missing, it displays an alert and returns false.
 *
 * @returns {boolean} Returns true if all required fields are present, otherwise false.
 */
const validateVariantData = () => {

	if (!addVariant.value.font_name) {
		showAlertDialog({
			title: translate.missingFontTitle,
			message: translate.missingFontDesc,
			className: 'lfu-red',
			icon: 'mdi-card-bulleted-off-outline',
		});
		return false;
	}

	if (!addVariant.value.variant) {
		showAlertDialog({
			title: translate.missingVariantTitle,
			message: translate.missingVariantDesc,
			className: 'lfu-red',
			icon: 'mdi-cards-outline',
		});
		return false;
	}

	if (!addVariant.value.file_id || !addVariant.value.file_url) {
		showAlertDialog({
			title: translate.missingFileTitle,
			message: translate.missingFileDesc,
			className: 'lfu-red',
			icon: 'mdi-file-alert-outline',
		});
		return false;
	}

	return true;
};

/**
 * Asynchronously adds a new font variant via an AJAX request.
 *
 * This function sends font variant data to the server using a POST request.
 * It constructs a FormData object, appends necessary fields, and submits the data.
 * If the request is successful, it updates the variants list and shows a success message.
 * If the request fails, it logs an error message.
 *
 */
const addFontVariant = async () => {
	try {
		isRequestPending.value = true;
		const formData = new FormData();
		formData.append("action", "localfuAddVariant");
		formData.append("_nonce", localfuAdminConfig.nonce);
		formData.append("data", JSON.stringify(addVariant.value));

		const response = await fetch(localfuAdminConfig.ajaxUrl, {
			method: "POST",
			body: formData,
		});
		const results = await response.json();

		if (results.success) {
			variantsData.value = results.data;
			resetVariantForm();

			showSnackbar({
				message: translate.addVariantSuccessMessage.replace('%s', addVariant.value.variant),
				className: 'lfu-snackbar',
			});

		} else {
			showAlertDialog({
				title: translate.errorTitle,
				message: results.data,
				className: 'lfu-red',
				icon: 'mdi-information-outline',
			})
		}
	} catch (error) {
		console.warn(translate.ajaxRequestFailed, error);
	} finally {
		isRequestPending.value = false; // Reset loading state
	}
}

/**
 * Deletes a font variant via an AJAX request.
 *
 * This function sends a request to remove the specified variant from the database.
 * If successful, it updates the `variantsData` and displays a success notification.
 * If an error occurs, it logs a warning.
 *
 * @param {number|string} variantID - The ID of the variant to delete.
 * @param {string} variantName - The name of the variant to display in the success message.
 * @returns {Promise<void>} Resolves when the request completes.
 */
const deleteFontVariant = async (variantID, variantName) => {
	try {
		isRequestPending.value = true;
		const formData = new FormData();
		formData.append("action", "localfuDeleteVariant");
		formData.append("_nonce", localfuAdminConfig.nonce);
		formData.append("data", JSON.stringify({'variant_id': variantID}));

		const response = await fetch(localfuAdminConfig.ajaxUrl, {
			method: "POST",
			body: formData,
		});
		const results = await response.json();

		if (results.success) {
			variantsData.value = results.data;

			showSnackbar({
				message: translate.deleteVariantSuccessMessage.replace('%s', variantName),
				className: 'lfu-snackbar',
			});
		} else {
			showAlertDialog({
				title: translate.errorTitle,
				message: results.data,
				className: 'lfu-red',
				icon: 'mdi-information-outline',
			})
		}
	} catch (error) {
		console.warn(translate.ajaxRequestFailed, error);
	} finally {
		isRequestPending.value = false; // Reset loading state
	}
};

/**
 * Submits the variant data to the server.
 * First, it validates the data using `validateVariantData()`.
 * If validation passes, it sends an AJAX request to submit the data.
 */
const submitVariantTrigger = (event) => {
	event.preventDefault();

	// Validate data before sending request
	if (!validateVariantData() || isRequestPending.value) {
		return;
	}
	// add new font variant to database
	addFontVariant();
}

/**
 * Opens the assign variant dialog and sets up confirm and cancel actions.
 *
 * @param {string|number} variantID - The ID of the variant to be assigned.
 * @param {any} assignTo - The target to which the variant is assigned.
 */
const assignVariantTrigger = (variantID) => {

	// Find the index of the selected variant
	const variantIndex = variantsData.value.findIndex(variant => variant.id === variantID);

	// Update the assignedClassNames
	assignedClassNames.value = (variantIndex !== -1) ? variantsData.value[variantIndex].assign_to : '';

	Object.assign(assignVariantDialog, {
		show: true,
		onConfirm: async () => {
			try {
				isRequestPending.value = true;
				const assignTo = autoFixSelectorList(assignedClassNames.value);

				if (!variantID) {
					showSnackbar({
						message: translate.assignedEmptyMessage,
						className: 'lfu-red'
					});
					return;
				}

				const formData = new FormData();
				formData.append("action", "localfuVariantAssign");
				formData.append("_nonce", localfuAdminConfig.nonce);
				formData.append("data", JSON.stringify({
					'variant_id': variantID,
					'assign_to': assignTo
				}));

				const response = await fetch(localfuAdminConfig.ajaxUrl, {
					method: "POST",
					body: formData,
				});
				const results = await response.json();

				if (results.success) {
					variantsData.value[variantIndex].assign_to = assignTo;

					showSnackbar({
						message: assignTo ? translate.assignVariantSuccessMessage : translate.clearVariantSuccessMessage,
						className: 'lfu-snackbar',
					});

					assignVariantDialog.show = false;
				} else {
					showAlertDialog({
						title: translate.errorTitle,
						message: results.data,
						className: 'lfu-red',
						icon: 'mdi-information-outline',
					})
				}
			} catch (error) {
				console.warn(translate.ajaxRequestFailed, error);
			} finally {
				isRequestPending.value = false; // Reset loading state
			}
		},
		onCancel: () => {
			assignVariantDialog.show = false;
		}
	});
};

/**
 * Resets the variant form by clearing the selected variant and file-related data.
 *
 * This function sets `selectedVariant` to an empty string and clears the file URL and file ID
 * in `addVariant`, ensuring a fresh state for new variant entries.
 */
const resetVariantForm = () => {
	selectedVariant.value = null; // Use null instead of an empty string for better clarity
	addVariant.value.file_url = '';
	addVariant.value.file_id = '';
};

/**
 * Handles the cancellation of the variant creation process.
 *
 * This function prevents the default event behavior, validates the variant data,
 * and clears the variant form if validation passes and no request is pending.
 *
 * @param {Event} event - The event object from the triggered action (e.g., button click or form submission).
 */
const cancelVariantTrigger = (event) => {
	event.preventDefault();

	// Validate data before sending request
	if (isRequestPending.value) {
		return;
	}

	// reset form
	resetVariantForm();
};

/**
 * Triggers the deletion confirmation for a font variant.
 *
 * This function opens a confirmation dialog before proceeding with the deletion.
 * If the user confirms, it calls `deleteFontVariant()` to remove the specified variant.
 *
 * @param {number|string} variantID - The ID of the variant to delete.
 * @param {string} variantName - The name of the variant to display in the confirmation message.
 * @returns {void}
 */
const deleteVariantTrigger = (variantID, variantName) => {
	// Open confirmation dialog before deleting the font variant
	openDeleteConfirmation({
		title: translate.confirmDeleteTitle,
		message: translate.confirmDeleteDescription,
		onConfirm: () => deleteFontVariant(variantID, variantName),
	});
};

</script>
<template>
	
	<!-- Snackbar Notification -->
	<v-snackbar v-model="snackbar.show" :class="snackbar.className" :timeout="3000" location="bottom right">
		<v-icon class="pr-2">{{ snackbar.icon }}</v-icon>
		{{ snackbar.message }}
	</v-snackbar>
	
	<!-- Alert Dialog -->
	<v-dialog v-model="alertDialog.show" :class="alertDialog.className" class="lfu-popup-box" persistent>
		<v-card>
			<v-card-title>
				<v-icon>{{ alertDialog.icon }}</v-icon>
				{{ alertDialog.title }}
			</v-card-title>
			<v-card-text>{{ alertDialog.message }}</v-card-text>
			<v-card-actions>
				<v-btn class="lfu-ok-btn" @click="alertDialog.onOkClick">{{ translate.ok }}</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
	
	<!-- Confirmation Dialog -->
	<v-dialog v-model="confirmationDialog.show" :class="confirmationDialog.className" class="lfu-popup-box" persistent>
		<v-card>
			<v-card-title>
				<v-icon>{{ confirmationDialog.icon }}</v-icon>
				{{ confirmationDialog.title }}
			</v-card-title>
			<v-card-text>{{ confirmationDialog.message }}</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn class="lfu-cancel-btn" @click="confirmationDialog.onConfirm">{{ translate.delete }}</v-btn>
				<v-btn @click="confirmationDialog.onCancel">{{ translate.cancel }}</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
	
	<!-- Assign HTML Class Dialog -->
	<v-dialog v-model="assignVariantDialog.show" :class="assignVariantDialog.className" class="lfu-popup-box is-assign-variant" persistent>
		<v-card>
			<v-card-title>
				<v-icon>mdi mdi-language-css3</v-icon>
				{{ translate.assignSelectorsHeadline }}
			</v-card-title>
			<div class="lfu-assign-help-text">{{ translate.assignVariantHelp }}</div>
			<textarea v-model="assignedClassNames" :placeholder="translate.assignedPlaceHolder" class="lfu-assign-input"></textarea>
			<v-spacer></v-spacer>
			<v-card-actions>
				<v-btn class="lfu-access-btn" @click="assignVariantDialog.onConfirm">{{ translate.saveChanges }}</v-btn>
				<v-btn @click="assignVariantDialog.onCancel">{{ translate.cancel }}</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
	
	
	<!-- selectedFont not found --->
	<div v-if="!selectedFont.name" class="localfu-setting-container">
		<v-row class="ma-0 pa-0">
			<v-col class="ma-0 pa-0" cols="12">
				<v-card class="lfu-card lfu-card-center" elevation="0">
					<h2 class="lfu-card-title-center">
						<v-icon>mdi mdi-heart-broken-outline</v-icon>
						{{ translate.notFoundFontTitle }}
					</h2>
					<p class="lfu-tagline">{{ translate.notFoundFontDesc }}</p>
					<div class="lfu-create-form-wrap">
						<button class="lfu-btn lfu-transition lfu-big-btn" @click="openOverviewTabTrigger">
							<v-icon>mdi mdi-arrow-left-top</v-icon>
							{{ translate.goToOverview }}
						</button>
					</div>
				</v-card>
			</v-col>
		</v-row>
	</div>
	
	<div v-else class="localfu-setting-container">
		<v-row v-if="fontVariantOptions && fontVariantOptions.length > 0" class="ma-0 pa-0">
			<v-col class="ma-0 pa-0" cols="12">
				<v-card class="lfu-card lfu-card-center" elevation="0">
					<h2 class="lfu-card-title-center">
						<v-icon color="icon-variants">mdi mdi-cards</v-icon>
						{{ translate.uploadVariantHeading.replace('%s', selectedFont.name) }}
					</h2>
					<p class="lfu-tagline">{{ translate.uploadVariantDesc }}</p>
					<div class="lfu-variant-form-wrap">
						<div class="flu-file-upload">
							<div class="flu-file-holder">
								<i v-if="!addVariant.file_id" class="flu-file-upload-icon mdi mdi-file-hidden"></i>
								<i v-else class="mdi mdi-file-check flu-file-upload-icon"></i>
								<div v-if="addVariant.file_url" class="flu-file-url">{{ addVariant.file_url }}</div>
							</div>
							<div class="lfu-description">{{ translate.fontFileSupported }}</div>
							<button class="lfu-btn lfu-transition lfu-white-btn lfu-file-btn" @click="uploadFontFrameTrigger($event)">
								<v-icon>mdi mdi-upload</v-icon>
								{{ translate.uploadFile }}
							</button>
						</div>
						<v-select
								v-model="selectedVariant"
								:items="fontVariantOptions"
								:label="translate.selectVariant"
								:placeholder="translate.variantPlaceHolder"
								class="lfu-select lfu-select-variant"
								density="comfortable"
								item-title="label"
								item-value="id"
								required
								variant="outlined"
						/>
						<div class="lfu-variant-actions">
							<button :disabled="isRequestPending" class="lfu-btn lfu-transition lfu-white-btn lfu-cancel-btn" @click="cancelVariantTrigger($event)">
								{{ translate.cancel }}
							</button>
							<button :disabled="isRequestPending" class="lfu-btn lfu-transition lfu-black-btn lfu-access-btn" @click="submitVariantTrigger($event)">
								{{ translate.saveChanges }}
							</button>
						</div>
					
					</div>
				</v-card>
			</v-col>
		</v-row>
		<v-row v-else class="ma-0 pa-0">
			<v-col class="ma-0 pa-0" cols="12">
				<v-card class="lfu-card lfu-card-center lfu-all-variants-info" elevation="0">
					<h2 class="lfu-card-title-center">
						<v-icon color="icon-variants">mdi mdi-creation</v-icon>
						{{ translate.allVariantsAvailable }}
					</h2>
					<p class="lfu-tagline">{{ translate.allVariantsAvailableDecs }}</p>
				</v-card>
			</v-col>
		</v-row>
		
		<!-- Variant Fonts List -->
		<template v-if=" variantsData && variantsData.length > 0" class="localfu-card">
			<v-card class="lfu-card" elevation="0">
				<div class="lfu-form-list-title">
					<div class="lfu-icon-title">
						<div class="lfu-icon-title">
							<v-icon>mdi-format-list-bulleted</v-icon>
							{{ selectedFont.name }} - {{ translate.variantsListing }}
						</div>
					</div>
				</div>
				<div class="lfu-listing">
					<template v-for="(variant, index) in sortedVariantsData" :key="index">
						<div class="localfu-list">
							<div class="localfu-name-container">
								<h2 class="localfu-name">
									<v-icon>mdi-format-font</v-icon>
									{{ formattedVariant(variant.variant) }}
								</h2>
								<div class="localfu-file">
									<v-icon>mdi-folder-check-outline</v-icon>
									{{ variant.file_url }}
								</div>
								<div v-if="variant.assign_to" class="localfu-assign">
									<v-chip-group class="lfu-assigned-preview">
										<v-chip v-for="className in variant.assign_to.split(',')" :key="className" disabled>
											{{ className }}
										</v-chip>
									</v-chip-group>
								</div>
							</div>
							<div class="localfu-uploaded-font-btn-container">
								<button
										:disabled="isRequestPending"
										class="lfu-btn lfu-transition lfu-black-btn lfu-access-btn"
										@click="assignVariantTrigger(variant.id)"
								>
									<v-icon>mdi-code-brackets</v-icon>
									{{ translate.cssSelectors }}
								</button>
								<button
										:disabled="isRequestPending"
										class="lfu-btn-red lfu-btn lfu-transition lfu-white-btn lfu-cancel-btn"
										@click="deleteVariantTrigger(variant.id, variant.variant)"
								>
									<v-icon>mdi-delete-outline</v-icon>
									{{ translate.delete }}
								</button>
							</div>
						</div>
					</template>
				</div>
			</v-card>
		</template>
	</div>
</template>
