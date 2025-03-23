<script setup>
import {ref, watch, provide, onMounted} from 'vue';
import {setStorage, getStorage} from "../js/localStorageHelper";
import fontsOverview from './components/overview.vue';
import fontVariants from './components/variants.vue';
import backupRestore from './components/backup.vue';
import helps from './components/helps.vue';

const translate = lfontsupAdminConfig?.translate || {};
const tab = ref(Number(localStorage.getItem('lfontsupAdminTab')) || 0);
const uploadedFonts = ref(lfontsupAdminConfig?.uploadedFonts || {});
const selectedFont = ref(Object(getStorage('lfontsupSavedFont')) || {});

provide("uploadedFonts", uploadedFonts);
provide("translate", translate);
provide("selectedFont", selectedFont);
provide("tab", tab);

watch(tab, (newValue) => {
	setStorage('lfontsupAdminTab', newValue);
});

onMounted(() => {
	const savedTab = getStorage('lfontsupAdminTab');
	if (savedTab !== null) {
		tab.value = Number(savedTab);
	}
});

const openVariants = (id, name) => {
	tab.value = 1;
	selectedFont.value = {id, name};
}

const openOverviews = () => {
	tab.value = 0;
}

const  documentationTrigger = () => {
	window.open(
		'https://docs.themeruby.com/local-fonts-uploader/',
		'_blank'
	)
}

</script>
<template>
	<v-app class="lfontsup-app">
		<v-container class="lfontsup-container">
			<v-row class="ma-0 pa-0">
				<v-col class="ma-0 pa-0" cols="12">
					<v-card id="lfontsup-title-card" class="lfontsup-card d-flex justify-space-between" elevation="0">
						<div class="lfontsup-introduce-left">
							<div class="d-flex">
								<h2 class="lfontsup-admin-title">{{ translate.appTitle }}</h2>
								<button
										class="lfontsup-white-btn lfontsup-transition lfontsup-docs-btn"
										@click="documentationTrigger">
									<v-icon>mdi-file-document</v-icon>
									{{ translate.documentation }}
								</button>
							</div>
							<p class="lfontsup-tagline">{{ translate.appDescription }}</p>
						</div>
						<div class="lfontsup-introduce-right">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 502 502">
								<defs>
									<linearGradient id="ifont-path-a" x1="151.567" x2="151.567" y1="280.837" y2="-1.561" gradientUnits="userSpaceOnUse">
										<stop stop-color="#f65dff" offset="0"/>
										<stop stop-color="#586aff" offset="1"/>
									</linearGradient>
									<linearGradient id="ifont-path-b" x1="318.875" x2="318.875" y1="472.437" y2="145.45" gradientUnits="userSpaceOnUse">
										<stop stop-color="#d0dada" offset="0"/>
										<stop stop-color="#ffcf74" offset="1"/>
									</linearGradient>
								</defs>
								<path fill="url(#ifont-path-a)" d="M227.755 300.552H75.378C34.46 300.552 1.291 267.382 1.291 226.465V74.087C1.291 33.17 34.46 0 75.378 0h152.378c40.917 0 74.087 33.17 74.087 74.087v152.378c0 40.917-33.17 74.087-74.088 74.087z"/>
								<path fill="#000" d="M258.339 143.43c-6.834-6.834-17.915-6.834-24.749 0l-99.598 99.599c-15.902 15.902-26.283 35.851-30.196 57.523h114.44l40.103-132.373c6.834-6.834 6.834-17.915 0-24.749z"/>
								<path fill="#fff" d="M236.618 234.555 166.594 49.002a15.709 15.709 0 0 0-14.704-10.082h-.016a15.71 15.71 0 0 0-14.68 10.058l-70.667 185.545c-2.261 5.934.719 12.579 6.654 14.84 5.93 2.257 12.579-.718 14.84-6.654l14.779-38.804h97.667l14.631 38.771c2.243 5.943 8.876 8.94 14.82 6.699 5.943-2.243 8.942-8.878 6.7-14.82zM111.56 180.904l40.298-105.807 39.929 105.807z"/>
								<path fill="url(#ifont-path-b)" d="M266.487 480.3 158.74 372.553c-28.933-28.933-28.933-75.842 0-104.775L266.487 160.03c28.933-28.933 75.842-28.933 104.775 0L479.01 267.778c28.933 28.933 28.933 75.842 0 104.775L371.262 480.3c-28.932 28.933-75.842 28.933-104.775 0z"/>
								<path fill="#000" d="M401.765 313.23c-4.492-4.49-11.771-4.49-16.264 0l-7.893 7.892c-1.231-15.422-7.811-29.76-18.871-40.819-25.425-25.425-66.794-25.425-92.219 0-25.486 25.484-25.486 66.734 0 92.218 11.377 11.376 25.946 17.646 40.85 18.841l-7.922 7.922c-4.491 4.491-4.491 11.772 0 16.264 4.493 4.491 11.771 4.491 16.264 0l86.055-86.055c4.491-4.49 4.491-11.771 0-16.263zm-59.291 43.028c-16.457 16.457-43.234 16.457-59.691 0-16.497-16.495-16.497-43.195 0-59.69 16.457-16.457 43.234-16.457 59.691 0 16.497 16.494 16.497 43.195 0 59.69z"/>
								<path fill="#000" d="M455.35 358.86a9.97 9.97 0 0 1-7.071-2.929c-3.905-3.905-3.905-10.237 0-14.143l5.441-5.44c3.906-3.904 10.236-3.904 14.142 0 3.905 3.905 3.905 10.237 0 14.143l-5.44 5.44a9.972 9.972 0 0 1-7.072 2.929zM403.49 410.72a9.97 9.97 0 0 1-7.071-2.929c-3.905-3.905-3.905-10.237 0-14.143l23.86-23.86c3.906-3.904 10.236-3.904 14.143 0 3.905 3.905 3.905 10.237 0 14.143l-23.86 23.86a9.975 9.975 0 0 1-7.072 2.929z"/>
							</svg>
						</div>
					</v-card>
				</v-col>
			</v-row>
			<v-tabs v-model="tab" class="lfontsup-v-tabs">
				<v-card id="lfontsup-tab-title-card">
					<v-tab
							v-for="(tabItem, index) in [
				        { label: translate.fontsOverview, icon: 'mdi-format-list-bulleted' },
				        { label: translate.variants, icon: 'mdi-cards' },
				        { label: translate.backupRestore, icon: 'mdi-restore' },
				        { label: translate.helps, icon: 'mdi-lifebuoy' }
				      ]"
							:key="index"
							:value="index"
							class="lfontsup-vtab-title"
					>
						<v-icon>{{ tabItem.icon }}</v-icon>
						{{ tabItem.label }}
					</v-tab>
				</v-card>
			</v-tabs>
			<v-tabs-window v-model="tab">
				<v-tabs-window-item v-for="(Component, index) in [fontsOverview, fontVariants, backupRestore, helps]" :key="index" :value="index">
					<component
							:is="Component"
							v-bind="{
			            ...(Component === fontVariants ? { 'onOpenOverviewsTab': openOverviews } : {}),
			            ...(Component === fontsOverview ? { 'onOpenVariantsTab': openVariants } : {})
			        }"
					/>
				</v-tabs-window-item>
			</v-tabs-window>
		</v-container>
	</v-app>
</template>