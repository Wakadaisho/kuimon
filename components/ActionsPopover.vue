<template>
    <UPopover :popper="{ placement: 'bottom-end' }" :disabled="disabled">
        <UIcon :class="{ 'cursor-not-allowed': disabled }" name="i-mdi-dots-vertical" />
        <template #panel="{ close }">
            <UButtonGroup size="xs" orientation="vertical">
                <UButton variant="ghost" v-for=" action  in  actions " :icon="action.icon" 
                    @click="action.click(data); close()" color="orange" :label="action.label" />
            </UButtonGroup>
        </template>
    </UPopover>
</template>

<script setup>
const { data, actions, disabled } = defineProps(['data', 'actions', 'disabled'])
</script>
