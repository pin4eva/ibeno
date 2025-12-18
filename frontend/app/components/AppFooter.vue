<template>
  <UFooter>
    <template #left>
      <p class="text-sm text-muted">
        IBENO System • © {{ new Date().getFullYear() }}
      </p>
    </template>

    <template #right>
      <div class="flex gap-4">
        <UButton
          to="#"
          icon="i-simple-icons-facebook"
          color="neutral"
          variant="ghost"
          aria-label="Facebook"
        />
        <UButton
          to="#"
          icon="i-simple-icons-twitter"
          color="neutral"
          variant="ghost"
          aria-label="Twitter"
        />
        <UButton
          to="#"
          icon="i-simple-icons-linkedin"
          color="neutral"
          variant="ghost"
          aria-label="LinkedIn"
        />
      </div>
    </template>
  </UFooter>
</template>
