<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';

const props = defineProps<{
  modelValue: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const editor = useEditor({
  content: props.modelValue,
  editable: !props.disabled,
  extensions: [StarterKit],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML());
  },
});

watch(
  () => props.modelValue,
  (value) => {
    const current = editor.value?.getHTML();
    if (!editor.value) return;
    if (current === value) return;
    editor.value.commands.setContent(value || '', false);
  },
);

watch(
  () => props.disabled,
  (disabled) => {
    editor.value?.setEditable(!disabled);
  },
);

onBeforeUnmount(() => {
  editor.value?.destroy();
});

function btnVariant(active: boolean) {
  return active ? 'soft' : 'ghost';
}
</script>

<template>
  <div class="space-y-2">
    <div
      v-if="editor"
      class="flex flex-wrap items-center gap-1 rounded-md border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800"
    >
      <UButton
        type="button"
        size="xs"
        color="gray"
        :variant="btnVariant(editor.isActive('bold'))"
        icon="i-lucide-bold"
        :disabled="disabled"
        @click="editor.chain().focus().toggleBold().run()"
      />
      <UButton
        type="button"
        size="xs"
        color="gray"
        :variant="btnVariant(editor.isActive('italic'))"
        icon="i-lucide-italic"
        :disabled="disabled"
        @click="editor.chain().focus().toggleItalic().run()"
      />
      <UButton
        type="button"
        size="xs"
        color="gray"
        :variant="btnVariant(editor.isActive('strike'))"
        icon="i-lucide-strikethrough"
        :disabled="disabled"
        @click="editor.chain().focus().toggleStrike().run()"
      />

      <div class="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-600" />

      <UButton
        type="button"
        size="xs"
        color="gray"
        :variant="btnVariant(editor.isActive('heading', { level: 1 }))"
        icon="i-lucide-heading-1"
        :disabled="disabled"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
      />
      <UButton
        type="button"
        size="xs"
        color="gray"
        :variant="btnVariant(editor.isActive('heading', { level: 2 }))"
        icon="i-lucide-heading-2"
        :disabled="disabled"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      />
      <UButton
        type="button"
        size="xs"
        color="gray"
        :variant="btnVariant(editor.isActive('heading', { level: 3 }))"
        icon="i-lucide-heading-3"
        :disabled="disabled"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      />

      <div class="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-600" />

      <UButton
        type="button"
        size="xs"
        color="gray"
        :variant="btnVariant(editor.isActive('bulletList'))"
        icon="i-lucide-list"
        :disabled="disabled"
        @click="editor.chain().focus().toggleBulletList().run()"
      />
      <UButton
        type="button"
        size="xs"
        color="gray"
        :variant="btnVariant(editor.isActive('orderedList'))"
        icon="i-lucide-list-ordered"
        :disabled="disabled"
        @click="editor.chain().focus().toggleOrderedList().run()"
      />
      <UButton
        type="button"
        size="xs"
        color="gray"
        :variant="btnVariant(editor.isActive('blockquote'))"
        icon="i-lucide-quote"
        :disabled="disabled"
        @click="editor.chain().focus().toggleBlockquote().run()"
      />

      <div class="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-600" />

      <UButton
        type="button"
        size="xs"
        color="gray"
        variant="ghost"
        icon="i-lucide-undo"
        :disabled="disabled || !editor.can().undo()"
        @click="editor.chain().focus().undo().run()"
      />
      <UButton
        type="button"
        size="xs"
        color="gray"
        variant="ghost"
        icon="i-lucide-redo"
        :disabled="disabled || !editor.can().redo()"
        @click="editor.chain().focus().redo().run()"
      />
    </div>

    <EditorContent
      v-if="editor"
      :editor="editor"
      class="min-h-80 max-w-none rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-900 outline-none prose prose-sm dark:prose-invert dark:border-gray-700 dark:bg-gray-900 dark:text-white"
    />
  </div>
</template>
