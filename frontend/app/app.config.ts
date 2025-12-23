export default defineAppConfig({
  ui: {
    colors: {
      primary: 'green',
      neutral: 'slate',
      orange: 'orange',
      black: 'black',
      indigo: 'indigo',
      blue: 'blue',
    },
    // Form Elements
    input: {
      slots: {
        root: 'w-full',
        base: 'rounded shadow-none transition-colors duration-200',
      },
      variants: {
        size: {
          xs: { base: 'px-2.5 py-1.5 text-xs' },
          sm: { base: 'px-3 py-1.5 text-sm' },
          md: { base: 'px-3.5 py-2 text-sm' },
          lg: { base: 'px-4 py-2.5 text-base' },
          xl: { base: 'px-5 py-3 text-base' },
        },
      },
    },
    textarea: {
      slots: {
        root: 'w-full',
        base: 'rounded shadow-none transition-colors duration-200',
      },
    },
    select: {
      slots: {
        base: 'w-full rounded shadow-none transition-colors duration-200',
      },
    },
    selectMenu: {
      slots: {
        base: 'w-full',
        trigger: 'rounded shadow-none transition-colors duration-200',
      },
    },
    // Data Display
    table: {
      slots: {
        root: 'border border-gray-200 dark:border-gray-800 rounded overflow-hidden',
        header: 'bg-gray-50 dark:bg-gray-800/50',
        th: 'px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider',
        td: 'px-4 py-4 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap',
        tr: 'border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors',
      },
    },
    card: {
      slots: {
        root: 'rounded-lg  dark:border-gray-800 bg-white dark:bg-gray-900 shadow-none',
        header: 'px-6 py-4 border-b border-gray-100 dark:border-gray-800',
        body: 'p-6',
        footer:
          'px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50',
      },
    },
    // Feedback
    badge: {
      slots: {
        base: 'font-medium inline-flex items-center rounded',
        label: 'truncate',
        leadingIcon: 'shrink-0',
        leadingAvatar: 'shrink-0',
        leadingAvatarSize: '',
        trailingIcon: 'shrink-0',
      },
      variants: {
        fieldGroup: {
          horizontal:
            'not-only:first:rounded-e-none not-only:last:rounded-s-none not-last:not-first:rounded-none focus-visible:z-[1]',
          vertical:
            'not-only:first:rounded-b-none not-only:last:rounded-t-none not-last:not-first:rounded-none focus-visible:z-[1]',
        },
        color: {
          primary: '',
          secondary: '',
          success: '',
          info: '',
          warning: '',
          error: '',
          neutral: '',
        },
        variant: {
          solid: '',
          outline: '',
          soft: '',
          subtle: '',
        },
        size: {
          xs: {
            base: 'text-[10px]/3 px-1.5 py-0.5 gap-1',
            leadingIcon: 'size-3',
            leadingAvatarSize: '3xs',
            trailingIcon: 'size-3',
          },
          sm: {
            base: 'text-xs px-2 py-1 gap-1',
            leadingIcon: 'size-3',
            leadingAvatarSize: '3xs',
            trailingIcon: 'size-3',
          },
          md: {
            base: 'text-sm px-2.5 py-1 gap-1.5',
            leadingIcon: 'size-4',
            leadingAvatarSize: '3xs',
            trailingIcon: 'size-4',
          },
          lg: {
            base: 'text-sm px-3 py-1.5 gap-1.5',
            leadingIcon: 'size-5',
            leadingAvatarSize: '2xs',
            trailingIcon: 'size-5',
          },
          xl: {
            base: 'text-base px-3.5 py-1.5 gap-1.5',
            leadingIcon: 'size-6',
            leadingAvatarSize: '2xs',
            trailingIcon: 'size-6',
          },
        },
        square: {
          true: '',
        },
      },
      compoundVariants: [
        {
          color: 'primary',
          variant: 'solid',
          class: 'bg-primary-600 text-white shadow-none',
        },
        {
          color: 'primary',
          variant: 'outline',
          class: 'text-primary-600 ring-1 ring-inset ring-primary-600/20 bg-primary-50/50',
        },
        {
          color: 'primary',
          variant: 'soft',
          class: 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
        },
        {
          color: 'primary',
          variant: 'subtle',
          class:
            'bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-600/20 dark:bg-primary-900/30 dark:text-primary-400 dark:ring-primary-400/30',
        },
        {
          color: 'neutral',
          variant: 'solid',
          class: 'text-white bg-gray-900 dark:bg-white dark:text-gray-900 shadow-none',
        },
        {
          color: 'neutral',
          variant: 'outline',
          class:
            'ring-1 ring-inset ring-gray-300 text-gray-700 bg-white dark:bg-gray-900 dark:text-gray-300 dark:ring-gray-700',
        },
        {
          color: 'neutral',
          variant: 'soft',
          class: 'text-gray-700 bg-gray-100 dark:bg-gray-800 dark:text-gray-300',
        },
        {
          color: 'neutral',
          variant: 'subtle',
          class:
            'ring-1 ring-inset ring-gray-300 text-gray-700 bg-gray-50 dark:bg-gray-800/50 dark:text-gray-300 dark:ring-gray-700',
        },
        {
          size: 'xs',
          square: true,
          class: 'p-0.5',
        },
        {
          size: 'sm',
          square: true,
          class: 'p-1',
        },
        {
          size: 'md',
          square: true,
          class: 'p-1',
        },
        {
          size: 'lg',
          square: true,
          class: 'p-1',
        },
        {
          size: 'xl',
          square: true,
          class: 'p-1',
        },
      ],
      defaultVariants: {
        color: 'primary',
        variant: 'soft',
        size: 'sm',
      },
    },
    // Navigation
    button: {
      slots: {
        base: 'rounded font-medium transition-colors duration-200 shadow-none',
      },
      variants: {
        size: {
          xs: { base: 'px-2.5 py-1.5 text-xs' },
          sm: { base: 'px-3 py-1.5 text-sm' },
          md: { base: 'px-3.5 py-2 text-sm' },
          lg: { base: 'px-4 py-2.5 text-base' },
          xl: { base: 'px-5 py-3 text-base' },
        },
      },
    },
  },
});
