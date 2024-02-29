<template>
    <div v-if="!!getAllOrdersCount" class="w-10 h-10">
        <UChip :text="getAllOrdersCount" position="bottom-right" size="2xl" inset color="gray">
            <UButton color="gray" variant="ghost" class="w-10 h-10 rounded-full bg-primary hover:bg-primary"
                @click="pendingOrdersModal = true">
                <UIcon class="w-full h-full" name="i-mdi-food" />
            </UButton>
        </UChip>
    </div>
    <UModal v-model="pendingOrdersModal"  fullscreen prevent-close="">
        <div class="flex justify-end m-2">
            <UButton color="gray" variant="soft" class="w-8 h-8 p-0 rounded-full"
                @click="pendingOrdersModal = false">
                <UIcon class="w-full h-full" name="i-heroicons-x-mark" />
            </UButton>
        </div>

        <div class="m-10">
            <PendingOrders />
        </div>
    </UModal>
</template>

<script setup>
const pendingOrdersModal = ref(false)
import { useCustomerOrderStore } from '#imports';
const { getAllOrdersCount } = storeToRefs(useCustomerOrderStore())
</script>
