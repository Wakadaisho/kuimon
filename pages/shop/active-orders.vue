<template>
    <div>
        <h1 class="uppercase tracking-wide font-bold text-2xl">Active Orders ({{ orders.length }})</h1>
        <UTable :columns="columns" :rows="orders">
            <template #created_at-data="{ row }">
                <ClientOnly>
                    {{ new Date(row.created_at).toLocaleString() }}
                </ClientOnly>
            </template>
            <template #items-data="{ row }">
                <div class="flex gap-1">
                    <div class="flex gap-1 items-center">
                        <UIcon @click="activeOrderRef = row; showDetailsModal = true" name="i-carbon-popup" dynamic />
                        <span v-for="item in row.order_menu_items">
                            {{ `${item.menu_item.name} x ${item.quantity}` }}
                        </span>
                    </div>
                </div>
            </template>
            <template #actions-data="{ row }">
                <ActionsPopover :data="row" :actions="actionLinks" />
            </template>I
        </UTable>
        <UModal v-model="showDetailsModal">
            <UCard>
                <template #header>
                    <p class="uppercase tracking-wide font-bold text-lg">Order Details</p>
                </template>
                {{
                    activeOrderRef?.order_menu_items?.map((item) => {
                        return `${item.menu_item.name} x ${item.quantity}`
                    }).join(', ')
                }}
            </UCard>
        </UModal>
    </div>
</template>

<script setup>
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const activeOrderRef = ref({})
const showDetailsModal = ref(false)

const { data, refresh } = await useAsyncData('incomplete_orders_GET', async () => {
    return await supabase.from('order')
        .select(`
        id,
        created_at,
        order_menu_items(
            quantity,
            price,
            menu_item(
                name,
                image
            )
        )
    `).eq('user_id', user.value.id).eq('completed', false).eq('cancelled', false).then(data => data.data)
},);

const orders = ref(data)

const channel = await supabase
    .channel('customer_orders')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'order', filter: `user_id=eq.${user.value.id}` }, payload => {
        refresh()
    }).subscribe()

onUnmounted(() => {
    channel.unsubscribe()
})

const actionLinks = [
    {
        label: 'View Details',
        icon: 'i-mdi-information-outline',
        click: (data) => {
            activeOrderRef.value = data;
            showDetailsModal.value = true
        }
    },
    {
        label: 'Mark Completed',
        icon: 'i-mdi-checkbox-marked-circle-outline',
        click: async (data) => {
            activeOrderRef.value = data;
            await supabase.from('order').update({ completed: true }).eq('id', data.id);
            refresh()
        }
    },
    {
        label: 'Cancel',
        icon: 'i-mdi-close-octagon-outline',
        click: async (data) => {
            activeOrderRef.value = data;
            await supabase.from('order').update({ cancelled: true, cancelled_by: user.value.id }).eq('id', data.id);
            refresh()
        }
    }
]

const columns = [
    {
        label: 'ID',
        key: 'id',
        sortable: true,
    },
    {
        label: 'Items',
        key: 'items',
        sortable: true,
    },
    {
        label: 'Order Date',
        key: 'created_at',
        sortable: true,
    },
    {
        label: '',
        key: 'actions',
        sortable: false,
    },
]
</script>
