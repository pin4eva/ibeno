// Shim to expose Vue's toValue for dependencies expecting it from @vueuse/core
export * from 'vueuse-core-original';
export * as default from 'vueuse-core-original';
export { toValue } from 'vue';
