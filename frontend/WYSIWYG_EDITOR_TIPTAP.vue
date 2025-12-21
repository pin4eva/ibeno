<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3';
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
    const isSame = editor.value?.getHTML() === value;
    if (!isSame && editor.value) {
      editor.value.commands.setContent(value, false);
    }
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
</script>

<template>
  <div class="space-y-2">
    <div v-if="editor" class="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700">
      <UButton
        type="button"
        size="xs"
        color="gray"
        variant="ghost"
        icon="i-lucide-bold"
        :disabled="disabled"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('bold') }"
        @click="editor.chain().focus().toggleBold().run()"
      />
      <UButton
        type="button"
        size="xs"
        color="gray"
        variant="ghost"
        icon="i-lucide-italic"
        :disabled="disabled"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()"
      />
      <UButton
        type="button"
        size="xs"
        color="gray"
        variant="ghost"
        icon="i-lucide-strikethrough"
        :disabled="disabled"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('strike') }"
        @click="editor.chain().focus().toggleStrike().run()"
      />
      <div class="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
      <UButton
        type="button"
        size="xs"
        color="gray"
        variant="ghost"
        icon="i-lucide-heading-1"
        :disabled="disabled"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('heading', { level: 1 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
      />
      <UButton
        type="button"
        size="xs"
        color="gray"
        variant="ghost"
        icon="i-lucide-heading-2"
        :disabled="disabled"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('heading', { level: 2 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      />
      <UButton
        type="button"
        size="xs"
        color="gray"
        variant="ghost"
        icon="i-lucide-heading-3"
        :disabled="disabled"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('heading', { level: 3 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      />
      <div class="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
      <UButton
        type="button"
        size="xs"
        color="gray"
        variant="ghost"
        icon="i-lucide-list"
        :disabled="disabled"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('bulletList') }"
        @click="editor.chain().focus().toggleBulletList().run()"
      />
      <UButton
        type="button"
        size="xs"
        color="gray"
        variant="ghost"
        icon="i-lucide-list-ordered"
        :disabled="disabled"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('orderedList') }"
        @click="editor.chain().focus().toggleOrderedList().run()"
      />
      <UButton
        type="button"
        size="xs"
        color="gray"
        variant="ghost"
        icon="i-lucide-quote"
        :disabled="disabled"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('blockquote') }"
        @click="editor.chain().focus().toggleBlockquote().run()"
      />
      <div class="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
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
      :editor="editor"
      class="min-h-40 rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-900 outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white prose prose-sm dark:prose-invert max-w-none"
    />

    <p class="text-xs text-gray-500 dark:text-gray-400">This field supports formatted text.</p>
  </div>
</template>

<style>
.tiptap {
  outline: none;
}

.tiptap p.is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

.tiptap ul,
.tiptap ol {
  padding: 0 1rem;
  margin: 0.5rem 0;
}

.tiptap h1,
.tiptap h2,
.tiptap h3,
.tiptap h4,
.tiptap h5,
.tiptap h6 {
  line-height: 1.1;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.tiptap blockquote {
  padding-left: 1rem;
  border-left: 3px solid rgba(13, 13, 13, 0.1);
  margin: 0.5rem 0;
}

.tiptap code {
  background-color: rgba(97, 97, 97, 0.1);
  border-radius: 0.25rem;
  color: #616161;
  font-size: 0.9rem;
  padding: 0.15em 0.3em;
}
</style>
