<script setup lang="ts">
import { editorToolbarItems } from '~/utils/toolbar-items';

const modelValue = defineModel<string>("modelValue");

</script>

<template>
  <UEditor
    v-slot="{ editor }"
    v-model="modelValue"
    content-type="markdown"
    placeholder="Start typing..."
    :ui="{ base: 'min-h-[200px] p-4 prose prose-sm max-w-none bg-red-500' }"
    class="w-full"
  >
    <UEditorToolbar :editor="editor" :items="editorToolbarItems" layout="fixed" />
  </UEditor>
</template>
