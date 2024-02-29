<template>
    <UAccordion open-icon="i-heroicons-plus" close-icon="i-heroicons-minus" :items="items">
        <template #default="{ item, index, open }">
            <UButton color="gray" variant="ghost" class="border-b border-gray-200 dark:border-gray-700 w-full"
                :ui="{ rounded: 'rounded-none', padding: { sm: 'p-3' } }">
                <template #leading>
                    <div class="w-6 h-6 rounded-full flex items-center justify-center -my-1">
                        <UIcon name="i-mdi-book-open" class="w-4 h-4" />
                    </div>
                </template>

                <div class="w-11/12 flex justify-between items-center gap-5">
                    <span class="text-lg uppercase tracking-wider">{{ item.label }}</span>
                    <span class="truncate font-extralight">{{ item.description }} </span>
                </div>

                <template #trailing>
                    <UIcon :name="open ? 'i-heroicons-minus' : 'i-heroicons-plus'"
                        class="w-5 h-5 ms-auto transform transition-transform duration-200" />
                </template>
            </UButton>
        </template>
        <template #item="{ item }">
            <div>
                <div v-if="view === 'card'"
                    class="grid place-self-center grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 ">
                    <MenuCard class="m-1" :key="menu_item.id" v-for="menu_item in item.menu_item" :item="menu_item"
                        :showOrder="showOrder" />
                </div>
                <div v-else>
                    <MenuLineItem class="m-1 my-2" :key="menu_item.id" v-for="menu_item in item.menu_item" :item="menu_item"
                        :showOrder="showOrder" />
                </div>
            </div>
        </template>
    </UAccordion>
</template>

<script setup>
const { items, view, showOrder = false } = defineProps(['items', 'view', 'showOrder'])
</script>

<style scoped></style>