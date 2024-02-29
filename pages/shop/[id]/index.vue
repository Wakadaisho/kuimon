<template>
    <div class="mb-20">
        <div class="flex justify-between">
            <h1 class="uppercase tracking-wide font-bold text-2xl">Menus</h1>
            <div class="items-center gap-1 hidden md:flex">
                <span>Cards</span>
                <UToggle v-model="cardOrList" />
                <span>List</span>
            </div>
        </div>
        <div class="hidden md:block">
            <Menu :showOrder="true" :items="menu" :view="cardOrList ? 'list' : 'card'" />
        </div>
        <div class="md:hidden">
            <Menu :showOrder="true" :items="menu" view="card" />
        </div>

    </div>
</template>

<script setup>
const supabase = useSupabaseClient();
const cardOrList = ref(false)
const route = useRoute();

const { data } = await useLazyAsyncData('menus', async () => {
    const { data } = await supabase.from('menu')
        .select(`
        id,
        name,
        description,
        menu_item (
            id,
            name,
            description,
            price,
            image,
            vegan,
            halal,
            spiciness,
            user_id,
            ingredient (
                id,
                name,
                allergen
            )
        )
    `).eq('user_id', route.params.id)
    return data
});


const menu = computed(() => {
    return data.value?.map((item) => {
        return ({
            ...item,
            label: item.name,
            defaultOpen: true,
        })
    })
})

</script>

<style></style>