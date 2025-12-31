<script setup lang="ts">
import { type UserRoleEnum } from '~/interfaces/user.interface';

const props = defineProps<{ roles: UserRoleEnum[] }>();

const { isPermitted } = useAuth();
</script>

<template>
  <slot v-if="isPermitted(props.roles)" />
</template>
