<script setup>
import {onMounted, inject} from "vue";

defineOptions({name: 'helps'})
const translate = inject('translate');

onMounted(() => {

});

const documentationTrigger = () => {
	window.open(
		'https://docs.themeruby.com/local-fonts-uploader/',
		'_blank'
	)
}

</script>
<template>
	<div class="lfontsup-fullwidth">
		<v-card class="lfontsup-card" elevation="0">
			<div class="lfontsup-tips">
				<h3 class="lfontsup-tips-headline"><v-icon>mdi-lightbulb-on-outline</v-icon>{{ translate.tips }}</h3>
					<div class="lfontsup-tips-description">{{ translate.assignTips }}</div>
			</div>
			<div class="doc-helper">
				<h3>
					<v-icon>mdi-book-open-variant</v-icon>
					{{ translate.fullDocumentation }}
				</h3>
				<button
						class="lfontsup-black-btn lfontsup-transition lfontsup-access-btn lfontsup-docs-btn"
						@click="documentationTrigger"
				>
					<v-icon>mdi-open-in-new</v-icon>
					{{ translate.learnMore }}
				</button>
			</div>
			<p class="lfontsup-settings-title">
				<v-icon>mdi-wordpress</v-icon>
				{{ translate.premiumTitle }}
			</p>
			<div class="lfontsup-rec-cards">
				<div class="lfontsup-rec-card">
					<a
							class="lfontsup-rec-image"
							href="//1.envato.market/MXYjYo"
							rel="nofollow"
							target="_blank"
					>
						<img
								alt="Foxiz Theme"
								height="300"
								src="//api.themeruby.com/images/foxiz.jpg"
								width="590"
						/>
					</a>
					<div class="lfontsup-rec-content">
						<h2>{{ translate.foxizThemeTitle }}</h2>
						<p class="lfontsup-rec-tagline">{{ translate.foxizTagline }}</p>
						<a
								class="lfontsup-black-btn lfontsup-transition lfontsup-access-btn"
								href="//1.envato.market/MXYjYo"
								rel="nofollow"
								target="_blank"
						>
							{{ translate.learnMore }}
							<v-icon>mdi-arrow-right-thin</v-icon>
						</a>
					</div>
				</div>
				<div class="lfontsup-rec-card">
					<a
							class="lfontsup-rec-image"
							href="//1.envato.market/Z25Rz"
							rel="nofollow"
							target="_blank"
					>
						<img
								alt="Pixwell Theme"
								height="300"
								src="//api.themeruby.com/images/pixwell.jpg"
								width="590"
						/>
					</a>
					<div class="lfontsup-rec-content">
						<h2>{{ translate.pixwellThemeTitle }}</h2>
						<p class="lfontsup-rec-tagline">{{ translate.pixwellTagline }}</p>
						<a
								class="lfontsup-black-btn lfontsup-transition lfontsup-access-btn"
								href="//1.envato.market/Z25Rz"
								rel="nofollow"
								target="_blank"
						>
							{{ translate.learnMore }}
							<v-icon>mdi-arrow-right-thin</v-icon>
						</a>
					</div>
				</div>
			</div>
		</v-card>
	</div>
</template>