<script setup>
import {ref, watch, onMounted, inject, reactive} from "vue";

defineOptions({name: 'backupRestore'})
const isRequestPending = ref(false);
const uploadedFonts = inject('uploadedFonts');
const translate = inject('translate');
const backupContent = ref(null);
const restoreContent = ref(null);
const tab = inject('tab');

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

/** Watches for changes in 'tab' and calls 'fetchBackupData' if the new value is 2 */
watch(tab, (newValue) => { if (newValue === 2) fetchBackupData(); });

onMounted(() => {
	fetchBackupData();
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
 * Fetches backup data from the server via an AJAX request.
 * Updates `backupContent` upon success and manages request state.
 *
 * @returns {Promise<void>} Resolves on success, rejects on failure.
 */

/**
 * Fetches backup data from the server.
 * Uses async/await for better readability and error handling.
 */
const fetchBackupData = async () => {

	if (isRequestPending.value) return; // Prevent multiple requests

	isRequestPending.value = true;

	try {
		const formData = new FormData();
		formData.append("action", "lfuFetchBackup");
		formData.append("_nonce", localfuAdminConfig.nonce);

		const response = await fetch(localfuAdminConfig.ajaxUrl, {
			method: "POST",
			body: formData,
		});

		const results = await response.json();
		if (results.success) {
			backupContent.value = JSON.stringify(results.data, null, 2);
		} else {
			throw new Error(results.data || "Failed to fetch backup data.");
		}
	} catch (error) {
		console.error("Error fetching backup data:", error);
	} finally {
		isRequestPending.value = false; // Reset loading state
	}
};

/**
 * Handles the restoration of backup data.
 *
 * This function validates the input data, ensures it is in JSON format,
 * and submits it to the server for processing. It also provides user feedback
 * via snackbar notifications.
 *
 * @async
 * @function handleRestoreData
 * @returns {Promise<void>} - Resolves when the restore process completes.
 */
const handleRestoreData = async () => {

	let jsonContent;
	if (!restoreContent.value) {
		showSnackbar({
			icon: 'mdi-alert-circle-outline',
			message: translate.emptyRestoreData,
			className: 'lfu-snackbar is-error',
		});
		return;
	}

	try {
		jsonContent = JSON.stringify(JSON.parse(restoreContent.value)); // Ensures valid JSON format
	} catch (error) {
		showSnackbar({
			icon: "mdi-alert-circle-outline",
			message: translate.invalidRestoreData,
			className: "lfu-snackbar is-error",
		});
		isRequestPending.value = false;
		return;
	}

	if (isRequestPending.value) return; // Prevent multiple requests

	isRequestPending.value = true;

	try {
		const formData = new FormData();
		formData.append("action", "lfuRestoreData");
		formData.append("_nonce", localfuAdminConfig.nonce);
		formData.append("data", jsonContent);

		const response = await fetch(localfuAdminConfig.ajaxUrl, {
			method: "POST",
			body: formData,
		});
		const results = await response.json();
		if (results.success) {
			showAlertDialog({
				title: translate.restoreSuccessTitle,
				message: translate.restoreSuccessDescription,
				icon: 'mdi-database-import-outline',
				onOkClick: () => {
					alertDialog.show = false;
					location.reload(); // Reload the page
				}
			})
		} else {
			throw new Error(results.data);
		}
	} catch (error) {
		console.error("Restore error:", error);
	} finally {
		isRequestPending.value = false;
	}
};

/**
 * Copies the backup content to the clipboard and shows a snackbar notification.
 */
const copyDataTrigger = () => {
	navigator.clipboard.writeText(backupContent.value)
		.then(() => {
			showSnackbar({
				icon: 'mdi-content-copy',
				message: translate.copySuccessMessage,
				className: 'lfu-snackbar',
			});
		})
		.catch(() => {
			showSnackbar({
				icon: 'mdi-alert-circle-outline',
				message: translate.copyErrorMessage,
				className: 'lfu-snackbar is-error',
			});
		});
};

/**
 * Reads content from the clipboard and assigns it to `restoreContent`.
 * Shows a snackbar notification based on success or failure.
 */
const pasteContentTrigger = async () => {
	const text = await navigator.clipboard.readText();
	if (!text) {
		showSnackbar({
			icon: 'mdi-alert-circle-outline',
			message: translate.pasteEmptyMessage,
			className: 'lfu-snackbar is-error',
		});
		return;
	}
	restoreContent.value = text;
	showSnackbar({
		message: translate.pasteSuccessMessage,
		className: 'lfu-snackbar',
	});
};

/**
 * Triggers the data restore process.
 * Prevents multiple requests if one is already in progress.
 */
const restoreDataTrigger = () => {
	if (isRequestPending.value) {
		return; // Prevent duplicate requests while another is in progress
	}

	handleRestoreData(); // Calls the function to restore data
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
	
	<v-row>
		<v-col>
			<v-card class="lfu-card" elevation="0">
				<div class="lfu-card-heading">
					<div class="lfu-card-title no-border">
						<v-icon>mdi-import</v-icon>
						{{ translate.importSettings }}
					</div>
				</div>
				<textarea v-model="restoreContent" :placeholder="translate.restorePlaceHolder" class="lfu-text-area lfu-text-area lfu-text-area-sync-data" rows="5"></textarea>
				<div class="lfu-sync-data-btn-group">
					<button class="lfu-btn lfu-white-btn lfu-transition" @click="pasteContentTrigger">
						<v-icon>mdi-content-paste</v-icon>
						{{ translate.paste }}
					</button>
					<button :disabled="isRequestPending" class="lfu-btn lfu-transition lfu-black-btn lfu-access-btn" @click="restoreDataTrigger">
						<v-icon>mdi-content-save-move-outline</v-icon>
						{{ translate.import }}
					</button>
				</div>
			</v-card>
		</v-col>
	</v-row>
	<v-row>
		<v-col>
			<v-card class="lfu-card" elevation="0">
				<div class="lfu-card-heading">
					<div class="lfu-card-title no-border">
						<v-icon>mdi-export</v-icon>
						{{ translate.exportSettings }}
					</div>
				</div>
				<textarea v-model="backupContent" :placeholder="translate.fetchBackupPlaceHolder" class="lfu-text-area lfu-text-area-sync-data" readonly rows="10"></textarea>
				<div class="lfu-sync-data-btn-group">
					<button :disabled="isRequestPending" class="lfu-white-btn lfu-transition" @click="copyDataTrigger">
						<v-icon>mdi-content-copy</v-icon>
						{{ translate.copy }}
					</button>
				</div>
			</v-card>
		</v-col>
	</v-row>
</template>

