<template>
    <div class="mx-auto">
        <div class="mb-20">
            <div class="flex justify-center md:justify-between items-center">
                <div class="flex flex-col md:flex-row gap-1">
                    <h1 class="uppercase tracking-wide font-bold text-2xl">Pending orders</h1>
                    <UButton v-if="getAllOrdersCount" icon="i-heroicons-trash" color="gray" @click="showDeleteModal = true">
                        Delete</UButton>
                    <UButton v-if="getAllOrdersCount" icon="i-mdi-basket-check" color="gray"
                        @click="showCreateModal = true">Make Order</UButton>
                </div>
            </div>
        </div>

        <div v-if="getAllOrdersCount" v-for="item in getAllOrders" :key="item.id"
            class="flex justify-center md:grid place-self-center grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 ">
            <MenuCard v-if="!cardOrList" class="m-1" :item="item" :showOrder="true" />
            <MenuLineItem v-else class="m-1 my-2" :item="item" :showOrder="true" />
        </div>
        <div v-else class="text-center">
            <span class="text-sm uppercase tracking-wide">No pending orders</span>
        </div>
    </div>

    <UModal v-model="showCreateModal">
        <UCard>
            <template #header>
                Finalize Order?
            </template>
            <template #footer>
                <div class="flex justify-between">
                    <UButton variant="solid" @click="createOrder(); showCreateModal = false">Create</UButton>
                    <UButton variant="ghost" @click="showCreateModal = false">Cancel
                    </UButton>
                </div>
            </template>
        </UCard>

    </UModal>

    <UModal v-model="showDeleteModal">
        <UCard>
            <template #header>
                Are you sure you delete <span class="uppercase font-bold font-lg">all</span> orders?
            </template>
            <template #footer>
                <div class="flex justify-between">
                    <UButton variant="solid" @click="clearOrders(); showDeleteModal = false">Delete</UButton>
                    <UButton variant="ghost" @click="showDeleteModal = false">Cancel
                    </UButton>
                </div>
            </template>
        </UCard>
    </UModal>
</template>

<script setup>
import { useCustomerOrderStore } from '#imports';
const cardOrList = ref(false)
const showDeleteModal = ref(false)
const showCreateModal = ref(false)
const customerOrderStore = useCustomerOrderStore()
const { clearOrders, createOrder } = customerOrderStore
const { getAllOrders, getAllOrdersCount } = storeToRefs(customerOrderStore);
</script>