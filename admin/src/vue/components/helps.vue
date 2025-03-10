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
	<div class="lfu-fullwidth">
		<v-card class="lfu-card" elevation="0">
			<div class="lfu-tips">
				<h3 class="lfu-tips-headline"><v-icon>mdi-lightbulb-on-outline</v-icon>{{ translate.tips }}</h3>
					<div class="lfu-tips-description">{{ translate.assignTips }}</div>
			</div>
			<div class="doc-helper">
				<h3>
					<v-icon>mdi-book-open-variant</v-icon>
					{{ translate.fullDocumentation }}
				</h3>
				<button
						class="lfu-black-btn lfu-transition lfu-access-btn lfu-docs-btn"
						@click="documentationTrigger"
				>
					<v-icon>mdi-open-in-new</v-icon>
					{{ translate.learnMore }}
				</button>
			</div>
			<p class="lfu-settings-title">
				<v-icon>mdi-wordpress</v-icon>
				{{ translate.premiumTitle }}
			</p>
			<div class="lfu-rec-cards">
				<div class="lfu-rec-card">
					<a
							class="lfu-rec-image"
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
					<div class="lfu-rec-content">
						<h2>{{ translate.foxizThemeTitle }}</h2>
						<p class="lfu-rec-tagline">{{ translate.foxizTagline }}</p>
						<a
								class="lfu-black-btn lfu-transition lfu-access-btn"
								href="//1.envato.market/MXYjYo"
								rel="nofollow"
								target="_blank"
						>
							{{ translate.learnMore }}
							<v-icon>mdi-arrow-right-thin</v-icon>
						</a>
					</div>
				</div>
				<div class="lfu-rec-card">
					<a
							class="lfu-rec-image"
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
					<div class="lfu-rec-content">
						<h2>{{ translate.pixwellThemeTitle }}</h2>
						<p class="lfu-rec-tagline">{{ translate.pixwellTagline }}</p>
						<a
								class="lfu-black-btn lfu-transition lfu-access-btn"
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