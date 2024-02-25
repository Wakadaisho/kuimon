<template>
    <div class="flex flex-col justify-between space-y-10 w-1/3 m-10 ml-4">
        <UForm :state="state" @submit="onSubmit">
            <div class="flex space-x-4" v-auto-animate>
                <UButton @click="sortBy = 'name'" :variant="sortBy === 'name' ? 'solid' : 'outline'">
                    Sort by name</UButton>
                <UButton @click="sortBy = 'qty'" :variant="sortBy === 'qty' ? 'solid' : 'outline'">
                    Sort by qty</UButton>
            </div>
            <div class="mt-10 flex justify-between">
                <UInput placeholder="Name" v-model="state.name" ref="nameInput" />
                <UInput placeholder="Quantity" v-model="state.qty" type="number" />
                <UButton type="submit">
                    Add order
                </UButton>
            </div>
        </UForm>

        <ul class="flex flex-col space-y-1" v-auto-animate>
            <!-- <UButton icon="i-heroicons-trash" variant="ghost" @click="deleteOrder(order.id)" /> -->
            <li v-for="order in getOrders" :key="order.id" class="hover:text-primary cursor-pointer block">{{ order.name }}
                - x{{
                    order.qty }}</li>
        </ul>


        <div>
            <UTable :columns="columns" :rows="people" />
        </div>

    </div>
</template>

<script setup>
import { useOrderStore } from '@/stores/currentOrder';

const orderStore = useOrderStore();
const nameInput = ref < HTMLInputElement | null > (null);

const { sortBy, getOrders } = storeToRefs(orderStore);
const { deleteOrder, addOrder } = orderStore;

const state = reactive({ id: '', name: '', qty: undefined })

const onSubmit = async (event) => {
    const name = event.data.name ?? "";
    if (!name.length) return;

    addOrder({ ...event.data });
    state.name = '';
    state.qty = undefined;

};

const columns = [{
    key: 'id',
    label: 'ID'
}, {
    key: 'name',
    label: 'Name',
    sortable: true
}, {
    key: 'title',
    label: 'Title',
    sortable: true
}, {
    key: 'email',
    label: 'Email',
    sortable: true,
    direction: 'desc'
}, {
    key: 'role',
    label: 'Role'
}]

const people = [{
    id: 1,
    name: 'Lindsay Walton',
    title: 'Front-end Developer',
    email: 'lindsay.walton@example.com',
    role: 'Member'
}, {
    id: 2,
    name: 'Courtney Henry',
    title: 'Designer',
    email: 'courtney.henry@example.com',
    role: 'Admin'
}, {
    id: 3,
    name: 'Tom Cook',
    title: 'Director of Product',
    email: 'tom.cook@example.com',
    role: 'Member'
}, {
    id: 4,
    name: 'Whitney Francis',
    title: 'Copywriter',
    email: 'whitney.francis@example.com',
    role: 'Admin'
}, {
    id: 5,
    name: 'Leonard Krasner',
    title: 'Senior Designer',
    email: 'leonard.krasner@example.com',
    role: 'Owner'
}, {
    id: 6,
    name: 'Floyd Miles',
    title: 'Principal Designer',
    email: 'floyd.miles@example.com',
    role: 'Member'
}]
</script>

