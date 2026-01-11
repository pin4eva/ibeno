// Shim to expose VueUse and re-export Vue's `toValue` for consumers that import it from @vueuse/core
export * from 'vueuse-core-original';
export * as default from 'vueuse-core-original';
// Re-export toValue from Vue so legacy imports from @vueuse/core/toValue work
export { toValue } from 'vue';
