<template>
    <div class="flex flex-col justify-between space-y-10 w-1/3 m-10 ml-4">
        <UForm :state="state" @submit="onSubmit">
            <div class="flex space-x-4">
                <UButton @click="sortBy = 'name'" :variant="sortBy === 'name' ? 'solid' : 'outline'">
                    Sort by name</UButton>
                <UButton @click="sortBy = 'qty'" :variant="sortBy === 'qty' ? 'solid' : 'outline'">
                    Sort by qty</UButton>
            </div>
            <div class="mt-10 flex justify-between">
                <UInput placeholder="Name" v-model="state.name" />
                <UInput placeholder="Quantity" v-model="state.qty" type="number" />
                <UButton type="submit">
                    Add order
                </UButton>
            </div>
        </UForm>

        <div v-for="order in getOrders" :key="order.id" class="flex space-x-1 items-center">
            <!-- <UButton icon="i-heroicons-trash" variant="ghost" @click="deleteOrder(order.id)" /> -->
            <div class="hover:text-primary cursor-pointer" @click.middle="deleteOrder(order.id)">{{ order.name }} - x{{
                order.qty }}</div>
        </div>

    </div>
</template>

<script setup>
import { useOrderStore } from '@/stores/orderStore';
const orderStore = useOrderStore();

const { sortBy, getOrders } = storeToRefs(orderStore);
const { deleteOrder, addOrder } = orderStore;

const state = reactive({ name: undefined, qty: undefined })

const onSubmit = async (event) => {
    const name = event.data.name ?? "";
    if (!name.length) return;

    addOrder({ ...event.data });
};

</script>