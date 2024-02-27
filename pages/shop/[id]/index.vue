<template>
    <div>
        {{ JSON.stringify(data) }}
    </div>
</template>

<script setup>
const supabase = useSupabaseClient();

const { data } = useLazyAsyncData('menus', async () => {
    const { data, error } = await supabase.from('menu').select('*').eq('user_id', user.value.id)
    return data
});

</script>

<style></style>