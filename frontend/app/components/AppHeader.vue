<script setup lang="ts">
const items = [
  {
    label: 'About Us',
    icon: 'i-lucide-info',
    children: [
      {
        label: 'IHCDT',
        to: '/about/IHCDT',
        description: 'Ibeno Host Community Development Trust'
      },
      {
        label: 'Ibeno People',
        to: '/about',
        description: 'Learn about our history and culture'
      }
    ]
  },
  {
    label: 'Procurement',
    to: '/contracts',
    icon: 'i-lucide-briefcase'
  },
  {
    label: 'Support Programs',
    to: '/#programs',
    icon: 'i-lucide-heart-handshake'
  }
]
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/">
        <AppLogo class="w-auto h-10 shrink-0" />
      </NuxtLink>
    </template>

    <UNavigationMenu
      :items="items"
      variant="link"
    />

    <template #right>
      <UColorModeButton />

      <UButton
        to="/auth/login"
        label="Login"
        color="primary"
        variant="outline"
        icon="i-lucide-log-in"
      />
    </template>
  </UHeader>
</template>
