<template>
    <div class="max-w-28 flex gap-1">
        <UButtonGroup orientation="horizontal">
            <UButton icon="i-heroicons-minus" color="gray" @click="decrementOrderItem(item)" />
            <UInput id="orderCount" :model-value="getItemOrderCount(item)" type="number" @blur="changeValue" />
            <UButton icon="i-heroicons-plus" color="gray" @click="incrementOrderItem(item)" />
        </UButtonGroup>
    </div>
    <UButton icon="i-heroicons-trash" color="gray" @click="showDeleteModal = true" />
    <UModal v-model="showDeleteModal">
        <UCard>
            <template #header>
                Are you sure you want to clear this order?
            </template>
            <template #footer>
                <div class="flex justify-between">
                    <UButton variant="solid" @click="deleteOrderItem(item); showDeleteModal = false">Clear</UButton>
                    <UButton variant="ghost" @click="showDeleteModal = false">Cancel
                    </UButton>
                </div>
            </template>
        </UCard>
    </UModal>
</template>

<script setup>
import { useCustomerOrderStore } from '#imports';
const { item } = defineProps(['item'])
const customerOrderStore = useCustomerOrderStore()
const { incrementOrderItem, decrementOrderItem, setOrderItem, getItemOrderCount, deleteOrderItem } = customerOrderStore

const showDeleteModal = ref(false)

const changeValue = (e) => {
    item.qty = +e.target.value
    setOrderItem({ id: item.id, name: item.name, qty: item.qty })
}
</script>

<style>
/* Chrome, Safari, Edge, Opera */
#orderCount::-webkit-outer-spin-button,
#orderCount::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* Firefox */
#orderCount[type=number] {
    appearance: textfield;
    -moz-appearance: textfield;
}

#orderCount {
    text-align: center;
}
</style>