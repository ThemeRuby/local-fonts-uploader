<script setup>
import {ref, reactive, onMounted, inject} from "vue";
import {setStorage, getStorage, deleteStorage} from "../../js/localStorageHelper";

defineOptions({
	name: "fontsOverview",
});

const emit = defineEmits(['open-variants-tab']);
const isRequestPending = ref(false);
const uploadedFonts = inject('uploadedFonts');
const translate = inject('translate');
const displayNewFontCreation = ref(false);
const newFontName = ref(null);
const selectedFont = inject('selectedFont');

const snackbar = reactive({
	show: false,
	className: 'lfontsup-snackbar',
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
	className: 'lfontsup-popup-box',
	icon: 'mdi-delete-empty-outline',
	title: '',
	message: '',
	onConfirm: () => {},
	onCancel: () => confirmationDialog.show = false
});

onMounted(() => {
});

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
 * Adds a new post by sending an AJAX request to the server.
 * Ensures proper error handling and provides user feedback.
 */
const addNewFont = async () => {

	// check duplicate title
	if (isFontNameTaken()) {
		showAlertDialog({
			title: translate.duplicateNameErrorTitle,
			message: translate.duplicateNameErrorDesc,
			className: 'lfontsup-red',
			icon: 'mdi-information-outline',
		})
		return;
	}

	try {
		isRequestPending.value = true;
		const formData = new FormData();
		formData.append("action", "lfontsupCreateFont");
		formData.append("_nonce", lfontsupAdminConfig.nonce);
		formData.append("data", JSON.stringify({name: newFontName.value}));

		const response = await fetch(lfontsupAdminConfig.ajaxUrl, {
			method: "POST",
			body: formData,
		});

		const results = await response.json();
		if (results.success) {
			uploadedFonts.value = results.data
			showSnackbar({
				message: translate.addFontSuccessMessage.replace('%s', newFontName.value),
				className: 'lfontsup-snackbar',
			});
		} else {
			showAlertDialog({
				title: translate.errorTitle,
				message: results.data,
				className: 'lfontsup-red',
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
 * Delete a font by its ID and name.
 * @param {string} fontID - The unique identifier of the font to delete.
 * @param {string} fontName - The name of the font to delete.
 */
const deleteFont = async (fontID, fontName) => {

	if (!fontName) {
		showAlertDialog({
			title: translate.errorTitle,
			message: translate.errorDesc,
			className: 'lfontsup-red',
			icon: 'mdi-information-outline',
		})
		return;
	}

	try {
		isRequestPending.value = true;
		const formData = new FormData();
		formData.append("action", "lfontsupRemoveFont");
		formData.append("_nonce", lfontsupAdminConfig.nonce);
		formData.append("data", JSON.stringify({font_name: fontName}));

		const response = await fetch(lfontsupAdminConfig.ajaxUrl, {
			method: "POST",
			body: formData,
		});
		const results = await response.json();

		if (results.success) {
			uploadedFonts.value = results.data;

		// Unset selected font if it is deleted
		if (fontName === selectedFont.value?.name) {
			selectedFont.value = {}; // Use null
		}
		
		showSnackbar({
				message: translate.deleteFontSuccessMessage.replace('%s', fontName),
				className: 'lfontsup-snackbar',
			});

		} else {
			showAlertDialog({
				title: translate.errorTitle,
				message: results.data,
				className: 'lfontsup-red',
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
 * Checks if the given font name already exists in the uploaded fonts list.
 *
 * @returns {boolean} True if the font name is already taken, otherwise false.
 */
const isFontNameTaken = () => {
	return uploadedFonts.value.some((font) => font.name === newFontName.value);

};

/**
 * Triggers the new font creation process.
 * If the font creation form is not displayed, it will be shown.
 * Otherwise, it proceeds with adding a new font.
 */
const addNewFontTrigger = () => {
	if (!displayNewFontCreation.value) {
		displayNewFontCreation.value = true;
	} else {
		if (isRequestPending.value) {
			return;
		}
		addNewFont();
	}
}

/**
 * Triggers the font deletion process.
 *
 * This function checks if a valid font ID and name are provided before attempting deletion.
 * If the name is missing, it displays an error dialog instead of proceeding.
 *
 * @param {string} fontID - The unique identifier of the font to delete.
 * @param {string} fontName - The name of the font to delete.
 */
const deleteFontTrigger = (fontID, fontName) => {
	openDeleteConfirmation({
		title: translate.confirmDeleteTitle,
		message: translate.confirmDeleteDescription,
		onConfirm: () => deleteFont(fontID, fontName)
	});
}

/**
 * Function to trigger the edit variants event.
 * @param {number|string} fontID - The ID of the font to edit.
 */
const editVariantsTrigger = (id, name) => {
	setStorage('lfontsupSavedFont', {id, name});
	emit('open-variants-tab', id, name); // Emit the event with fontID and name
};

/**
 * Cancels the new font creation process.
 *
 * effectively hiding or stopping the new font creation UI or process.
 */
const cancelNewFontTrigger = () => {
	displayNewFontCreation.value = false;
};

</script>
<template>
	
	<!-- Snackbar Notification -->
	<v-snackbar v-model="snackbar.show" :class="snackbar.className" :timeout="3000" location="bottom right">
		<v-icon class="pr-2">{{ snackbar.icon }}</v-icon>
		{{ snackbar.message }}
	</v-snackbar>
	
	<!-- Alert Dialog -->
	<v-dialog v-model="alertDialog.show" :class="alertDialog.className" class="lfontsup-popup-box" persistent>
		<v-card>
			<v-card-title>
				<v-icon>{{ alertDialog.icon }}</v-icon>
				{{ alertDialog.title }}
			</v-card-title>
			<v-card-text>{{ alertDialog.message }}</v-card-text>
			<v-card-actions>
				<v-btn class="lfontsup-ok-btn" @click="alertDialog.onOkClick">{{ translate.ok }}</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
	
	<!-- Confirmation Dialog -->
	<v-dialog v-model="confirmationDialog.show" :class="confirmationDialog.className" class="lfontsup-popup-box" persistent>
		<v-card>
			<v-card-title>
				<v-icon>{{ confirmationDialog.icon }}</v-icon>
				{{ confirmationDialog.title }}
			</v-card-title>
			<v-card-text>{{ confirmationDialog.message }}</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn class="lfontsup-cancel-btn" @click="confirmationDialog.onConfirm">{{ translate.delete }}</v-btn>
				<v-btn @click="confirmationDialog.onCancel">{{ translate.cancel }}</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
	
	<!-- Font Creation Form -->
	<v-row class="ma-0 pa-0">
		<v-col class="ma-0 pa-0" cols="12">
			<v-card class="lfontsup-card lfontsup-card-center" elevation="0">
				<h2 class="lfontsup-card-title-center">
					<v-icon>mdi-format-font</v-icon>
					{{ translate.createNewFont }}
				</h2>
				<p class="lfontsup-tagline">{{ translate.createNewFontDesc }}</p>
				<div class="lfontsup-create-form-wrap">
					<div v-if="displayNewFontCreation" class="lfontsup-big-input-wrap">
						<input
								v-model="newFontName"
								:placeholder="translate.createFontPlaceHolder"
								class="lfontsup-big-input"
								type="text"
						/>
					</div>
					<button class="lfontsup-creation-btn lfontsup-btn lfontsup-transition lfontsup-access-btn" @click="addNewFontTrigger">
						<v-icon>{{ displayNewFontCreation ? 'mdi-content-save' : 'mdi-plus' }}</v-icon>
						{{ displayNewFontCreation ? translate.saveNewFont : translate.addNewFont }}
					</button>
					<button v-if="displayNewFontCreation" class="lfontsup-btn lfontsup-creation-btn is-cancel" @click="cancelNewFontTrigger">
						<v-icon>mdi-cancel</v-icon>
						{{ translate.cancel }}
					</button>
				</div>
			</v-card>
		</v-col>
	</v-row>
	
	<!-- Uploaded Fonts List -->
	<template v-if="uploadedFonts && uploadedFonts.length > 0">
		<v-card class="lfontsup-card" elevation="0">
			<div class="lfontsup-form-list-title">
				<div class="lfontsup-icon-title">
					<v-icon>mdi-format-list-bulleted</v-icon>
					{{ translate.fontsListing }}
				</div>
			</div>
			<div class="lfontsup-listing">
				<template v-for="(font, index) in uploadedFonts" :key="index">
					<div class="lfontsup-list">
						<div class="lfontsup-name-container">
							<h2 class="lfontsup-name">
								<v-icon>mdi-credit-card-chip-outline</v-icon>
								{{ font.name }}
							</h2>
							<span class="lfontsup-variant-amount-text"><v-icon>mdi-file-tree-outline</v-icon>
								{{
									font?.amount > 0
											? `${font.amount} ${font.amount === 1 ? 'variant' : 'variants'}`
											: translate.noVariantInfo
								}}
					</span>
						</div>
						<div class="lfontsup-uploaded-font-btn-container">
							<button
									:disabled="isRequestPending"
									class="lfontsup-black-btn lfontsup-transition lfontsup-access-btn"
									@click="editVariantsTrigger(font.id, font.name)"
							>
								<v-icon>mdi-cards-outline</v-icon>
								{{ translate.editVariants }}
							</button>
							<button
									:disabled="isRequestPending"
									class="lfontsup-btn-red lfontsup-white-btn lfontsup-transition lfontsup-cancel-btn"
									@click="deleteFontTrigger(font.id, font.name)"
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
</template>
