import '../css/app.css'
import { createApp, h } from 'vue'
import { createInertiaApp } from '@inertiajs/vue3'
import { InertiaProgress } from '@inertiajs/progress';

// @ts-ignore
const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'AdonisJS';

createInertiaApp({
	id: 'app',
	title: (title) => `${appName} - ${title}`,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	resolve: (name) => require(`./Pages/${name}.vue`),
	setup({ el, App, props, plugin }) {
		createApp({ render: () => h(App, props) })
			.use(plugin)
			.mount(el)
	},
})

InertiaProgress.init({
	// The delay after which the progress bar will
	// appear during navigation, in milliseconds.
	delay: 250,

	// The color of the progress bar.
	color: '#fcba19',

	// Whether to include the default NProgress styles.
	includeCSS: true,

	// Whether the NProgress spinner will be shown.
	showSpinner: true,
});
