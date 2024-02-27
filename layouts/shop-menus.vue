<template>
    <div>
        <NavBar />
        <div class="container mx-auto px-5">
            <h1 class="uppercase tracking-wide font-bold text-2xl">Menu Management</h1>

            <UHorizontalNavigation :links="links"
                class="border-b border-gray-200 dark:border-gray-800 tracking-wider uppercase text-xs font-semibold my-5 hidden md:block" />


            <UVerticalNavigation :links="links"
                class="border-b border-gray-200 dark:border-gray-800 tracking-wider uppercase text-xs font-semibold my-5 block md:hidden" />
            <slot />


        </div>
    </div>
</template>
<script setup>
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const { data } = await useLazyAsyncData('stats', async () => {
    const menuCount = await supabase.from('menu').select('*', { count: 'exact' }).eq('user_id', user.value.id).then(data => data.count)
    const menuItemsCount = await supabase.from('menu_item').select('*', { count: 'exact' }).eq('user_id', user.value.id).then(data => data.count)
    const ingredientsCount = await supabase.from('ingredient').select('*', { count: 'exact' }).or(`user_id.eq.${user.value.id},user_id.is.null`).then(data => data.count)
    return Promise.all([menuCount, menuItemsCount, ingredientsCount])
});

let menuCount = data?.value?.[0] ?? 0;
let menuItemsCount = data?.value?.[1] ?? 0;
let ingredientsCount = data?.value?.[2] ?? 0;

if (menuCount >= 1000) {
    menuCount = '999+'
}
if (menuItemsCount >= 1000) {
    menuItemsCount = '999+'
}
if (ingredientsCount >= 1000) {
    ingredientsCount = '999+'
}

const links = [{
    label: 'Shop',
    icon: 'i-simple-icons-homeassistantcommunitystore',
    to: { name: 'Shop Settings' },
},
{
    label: 'Menus',
    icon: 'i-mdi-book-open',
    to: { name: 'Menus' },
    badge: menuCount
}, {
    label: 'Menu Items',
    icon: 'i-mdi-pasta',
    to: { name: 'Menu Items' },
    badge: menuItemsCount
}, {
    label: 'Ingredients',
    icon: 'i-mdi-barley',
    to: { name: 'Ingredients' },
    badge: ingredientsCount

},]
</script>
