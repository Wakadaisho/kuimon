<template>
    <UCard class="container">
        <template #header>
            <div class="flex flex-col w-full sm:flex-row justify-between sm:gap-5">
                <div class="flex items-center justify-center px-3 py-3.5">
                    <UInput v-model="q" placeholder="Filter items..." />
                </div>
                <div class="flex justify-around flex-row items-center gap-2">
                    <UDropdown v-if="selectedRows.length > 1" :items="actions">
                        <UButton icon="i-heroicons-chevron-down" trailing color="gray" size="xs">
                            Actions
                        </UButton>
                    </UDropdown>
                    <UButton icon="i-heroicons-plus-circle px-1" @click="showAddModal = true">Add Item</UButton>
                </div>
            </div>
        </template>

        <UTable :rows="filteredRows" :columns="columns" :loading="pending || pendingSearch">
            <template #selected-header>

                <UCheckbox :checked="!!selectedRows.length"
                    :indeterminate="!!(selectedRows.length && selectedRows.length < filteredRows?.length)"
                    @click="toggleSelectedPageRows" />

            </template>

            <template #itemList-data="{ row }" :class="`w-64 overflow-auto whitespace-nowrap`">
                <div class="cursor-help w-36 whitespace-nowrap overflow-hidden overflow-ellipsis" @click="toast.add({
                    title: row.menu_item.map(item => item.name).join(', '),
                    color: 'gray'
                })">
                    {{ row.menu_item.map(item => item.name).join(', ') }}
                </div>
            </template>

            <template #selected-data="{ row }">
                <div v-if="!row.user_id?.length">
                    <UTooltip text="Cannot select default menus">
                        <UCheckbox :disabled="true" />
                    </UTooltip>
                </div>
                <div v-else>
                    <UCheckbox :checked="!!selectedRows.find(_row => _row.id === row.id)" @click="select(row)" />
                </div>
            </template>

            <template #actions-data="{ row }">
                <div v-if="!!row.user_id" class="flex gap-4">
                    <UButton icon="i-heroicons-pencil" size="2xs" color="orange" variant="ghost" square
                        @click="activeMenuRef = row; showUpdateModal = true" />
                    <UButton icon="i-heroicons-trash" size="2xs" color="red" variant="soft" square
                        @click="activeMenuRef = row; showDeleteModal = true" />
                </div>
                <div v-else>
                    <UTooltip text="Cannot be edited or removed">
                        <UBadge variant="subtle">Default</UBadge>
                    </UTooltip>
                </div>
            </template>
        </UTable>

        <template v-if="!q.length" #footer>
            <div class="flex flex-wrap justify-between items-center">
                <div>
                    <span class="text-sm leading-5">
                        Showing
                        <span class="font-medium">{{ pageFrom }}</span>
                        to
                        <span class="font-medium">{{ pageTo }}</span>
                        of
                        <span class="font-medium">{{ pageTotal }}</span>
                        results
                    </span>
                </div>

                <UPagination v-model="page" :page-count="pageCount" :total="pageTotal" :ui="{
                    wrapper: 'flex items-center gap-1',
                    rounded: '!rounded-full min-w-[32px] justify-center',
                    default: {
                        activeButton: {
                            variant: 'outline'
                        }
                    }
                }" />
            </div>
        </template>
    </UCard>

    <UModal v-model="showAddModal">
        <UForm ref="form" :schema="schema" :state="state" @submit="addMenu">
            <UCard>
                <template #header>
                    <p class="text-sm uppercase font-semibold text-center">Add Menu</p>
                </template>
                <div class="flex flex-col space-y-5">
                    <UFormGroup label="Name" name="name" required>
                        <UInput v-model="state.name" />
                    </UFormGroup>
                    <UFormGroup label="Description" name="description" hint="Optional">
                        <UTextarea v-model="state.description" />
                    </UFormGroup>
                    <UCard>
                        <template #footer>
                            <UCommandPalette class="min-h-min" :empty-state="{ icon: null, label: null }"
                                :ui="{ emptyState: { wrapper: '' } }" command-attribute="name" :debounce="500"
                                :placeholder="`Add items...`" v-model="selectedItems" multiple :autoselect="false"
                                :groups="items"
                                :fuse="{ resultLimit: 5, fuseOptions: { threshold: 0.1, includeMatches: true, keys: ['name', 'description'] } }">
                            </UCommandPalette>
                        </template>

                        <template #header>
                            <div class="flex gap-2">
                                <UTooltip v-for="selectedItem in selectedItems" text="Click to delete">
                                    <UBadge class="rounded-full cursor-pointer"
                                        @click.self="removeSelectedItem(selectedItem)" variant='outline'>
                                        {{ selectedItem.name }}
                                    </UBadge>
                                </UTooltip>
                            </div>
                        </template>
                    </UCard>
                </div>
                <template #footer>
                    <div class="flex justify-end w-full">
                        <UButton :loading="submitting" type="submit">Add</UButton>
                    </div>
                </template>
            </UCard>
        </UForm>
    </UModal>

    <UModal v-model="showUpdateModal">
        <UForm ref="form" :schema="schema" :state="state" @submit="updateMenu">
            <UCard>
                <template #header>
                    <p class="text-sm uppercase font-semibold text-center">Update Menu</p>
                </template>
                <div class="flex flex-col space-y-5">
                    <UFormGroup label="Name" name="name" required>
                        <UInput v-model="state.name" />
                    </UFormGroup>
                    <UFormGroup label="Description" name="description" hint="Optional">
                        <UTextarea v-model="state.description" />
                    </UFormGroup>
                    <UCard>
                        <template #footer>
                            <UCommandPalette class="min-h-min" :empty-state="{ icon: null, label: null }"
                                :ui="{ emptyState: { wrapper: '' } }" command-attribute="name" :debounce="500"
                                :placeholder="`Add items...`" v-model="selectedItems" multiple :autoselect="false"
                                :groups="items"
                                :fuse="{ resultLimit: 5, fuseOptions: { threshold: 0.1, includeMatches: true, keys: ['name', 'description'] } }">
                            </UCommandPalette>
                        </template>

                        <template #header>
                            <div class="flex gap-2">
                                <UTooltip v-for="selectedItem in selectedItems" text="Click to delete">
                                    <UBadge class="rounded-full cursor-pointer"
                                        @click.self="removeSelectedItem(selectedItem)" variant='outline'>
                                        {{ selectedItem.name }}
                                    </UBadge>
                                </UTooltip>
                            </div>
                        </template>
                    </UCard>
                </div>
                <template #footer>
                    <div class="flex justify-end w-full">
                        <UButton :loading="submitting" type="submit">Update</UButton>
                    </div>
                </template>
            </UCard>
        </UForm>
    </UModal>

    <UModal v-model="showDeleteModal">
        <UForm ref="form" :schema="schema" :state="state" @submit="addMenu">
            <UCard>
                <template #header>
                    <p class="text-sm font-semibold text-center">Delete {{ activeMenuRef?.name }}? </p>
                </template>
                Are you sure you want to delete <span class="font-semibold">{{ activeMenuRef?.name }}</span>?

                <template #footer>
                    <div class="flex justify-between">
                        <UButton variant="solid" @click="deleteMenu">Delete</UButton>
                        <UButton variant="ghost" @click="showDeleteModal = false">Cancel
                        </UButton>
                    </div>
                </template>
            </UCard>
        </UForm>
    </UModal>

    <UModal v-model="showDeleteAllModal">
        <UForm ref="form" :schema="schema" :state="state" @submit="addMenu">
            <UCard>
                <template #header>
                    <p class="text-sm font-semibold text-center">Delete items? </p>
                </template>
                <div class="flex flex-col items-start">
                    <p>
                        Are you sure you want to delete all <span class="font-semibold">{{ selectedRows.length }}</span>
                        items?</p>
                    <UButton variant="link" class="pl-0" @click="showItems = !showItems">
                        {{ showItems ? "Hide" : "Show" }} items
                    </UButton>
                    <p v-if="showItems">
                        {{ selectedRows.map(row => row.name).join(", ") }}
                    </p>
                </div>
                <template #footer>
                    <div class="flex justify-between">
                        <UButton variant="solid" @click="deleteSelectedRows">Delete</UButton>
                        <UButton variant="ghost" @click="showDeleteAllModal = false">Cancel
                        </UButton>
                    </div>
                </template>
            </UCard>
        </UForm>
    </UModal>
</template>

<script setup>
import { z } from 'zod'

const supabase = useSupabaseClient();
const user = useSupabaseUser()
const form = ref()
const submitting = ref(false);
const showAddModal = ref(false);
const showUpdateModal = ref(false);
const showDeleteModal = ref(false);
const showDeleteAllModal = ref(false);
const activeMenuRef = ref(null);
const showItems = ref(false)
const q = ref('')
const filter = ref('')
const selectedItems = ref([])
const menus = ref([])
const toast = useToast()

watch(filter, () => {
    if (filter.value) {
        q.value = filter.value
    }
})

watch(activeMenuRef, (item) => {
    if (item) {
        state = reactive({ ...item })
        selectedItems.value = item.menu_item
    }
})

const items = [
    {
        key: 'items',
        label: q => q && `Items matching “${q}”...`,
        search: async (q) => {
            if (!q) {
                return []
            }

            const { data } = await useFetch('/api/search/menu_items', { params: { q } })
            return data.value.data
        }
    }]

const filteredRows = computed(() => {
    if (!q.value) {
        return menus.value
    }

    return menus?.value?.filter((item) => {
        let obj = { ...item }
        delete obj['id'];
        delete obj['user_id'];

        return Object.values(obj).some((value) => {
            return String(value).toLowerCase().includes(q.value.toLowerCase())
        })
    })
})

function removeSelectedItem(item) {
    selectedItems.value = selectedItems.value.filter((v) => v.id != item.id)
}

const searchTimeout = ref(null);
const page = ref(1)
const pageCount = ref(5)
const pageTotal = ref(100) // This value should be dynamic coming from the API
const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1)
const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value))

// Selected Rows
const selectedRows = ref([])

async function deleteSelectedRows() {
    if (selectedRows.value.length === 0) return;
    const ids = selectedRows.value.filter(row => !!row.user_id).map(row => row.id)

    const { error } = await supabase.from('menu').delete().in('id', ids)

    if (error) {
        alert("An error occurred while deleting the selected items")
    }
    selectedRows.value = []
    showDeleteAllModal.value = false
    refreshMenus()
}

// Actions
const actions = [
    [{
        key: 'delete',
        label: 'Delete',
        icon: 'i-heroicons-trash',
        click: () => showDeleteAllModal.value = true,
    }]
]

function select(row) {
    const index = selectedRows.value.findIndex((item) => item.id === row.id)
    if (index === -1) {
        selectedRows.value.push(row)
    } else {
        selectedRows.value.splice(index, 1)
    }
}

function toggleSelectedPageRows() {
    if (selectedRows.value.length) {
        selectedRows.value = []
    }
    else {
        selectedRows.value = filteredRows.value?.filter(row => !!row.user_id)
    }
}

const { data, pending, refresh: refreshMenus } =
    await useLazyAsyncData('menu', async () => {
        return await supabase.from('menu')
            .select(`id,
                    name,
                    description,
                    user_id, 
                    menu_item (
                        id,
                        name,
                        description
                    )`,
                { count: 'exact' })
            .order('name')
            .eq('user_id', user.value.id)
            .range(pageFrom.value - 1, pageTo.value - 1)
    }, { default: () => [], watch: [page, pageCount] });

const { data: dataSearch, pending: pendingSearch, execute: performSearch } =
    await useLazyAsyncData('menu_search', async () => {
        return await supabase.from('menu')
            .select('id, name, description, user_id', { count: 'exact' })
            .eq('user_id', user.value.id)
            .filter('name', 'ilike', `%${q.value}%`)
    });

watch(data, (_data) => {
    menus.value = _data.data ?? []
    pageTotal.value = _data.count ?? 100
}, { immediate: true, deep: true })

watch(dataSearch, (_data) => {
    if (!q.value) return;
    menus.value = _data.data ?? []
})

watch(q, () => {
    if (q.value) {
        if (searchTimeout.value) {
            clearTimeout(searchTimeout.value)
        }
        searchTimeout.value = setTimeout(() => performSearch(), 500)
    } else {
        refreshMenus()
    }
})

const columns = [
    { key: 'selected', label: '' },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'itemList', label: 'Items' },
    { key: 'description', label: 'Description' },
    { key: 'actions', label: 'Actions' }
]

const schema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional()
})

const stateTemplate = {
    name: '',
    description: '',
}

let state = reactive({ ...stateTemplate })

async function addMenu(event) {
    let submitData = { ...event.data }
    let submitItems = selectedItems.value.map(item => item.id)

    submitting.value = true;

    const { data, error, } = await useAsyncData('item_POST', async () => {
        return await supabase.from('menu').insert([{ ...submitData, }]).select('id')
    },);

    submitItems = submitItems.map(item => {
        return { menu_id: data.value.data[0].id, menu_item_id: item }
    })

    const { error: errorItems } = await useAsyncData('menu_menu_items_POST', async () => {
        return await supabase.from('menu_menu_items').insert(submitItems)
    },);

    submitting.value = false;

    activeMenuRef.value = null

    if (errorItems?.value?.message.includes("duplicate")) {
        form.value.setErrors([{ message: "Item already exists", "path": "name" }])
        return;
    }
    state = reactive({ ...stateTemplate })
    selectedItems.value = []

    showAddModal.value = false
    refreshMenus()
}

async function updateMenu(event) {
    let submitData = { ...event.data }
    let submitItems = selectedItems.value.map(item => item.id)

    submitting.value = true;

    delete submitData['id']
    delete submitData['user_id']
    delete submitData['menu_item']

    const { error } = await useAsyncData('menu_PATCH', async () => {
        return await supabase.from('menu').update(submitData).eq('id', activeMenuRef.value.id)
    },);

    submitItems = submitItems.map(item => {
        return { menu_id: activeMenuRef.value.id, menu_item_id: item }
    })

    const { error: errorDeleteItems } = await useAsyncData('menu_menu_items_delete', async () => {
        return await supabase.from('menu_menu_items').delete().eq('menu_id', activeMenuRef.value.id)
    });

    const { error: errorUpdateItems } = await useAsyncData('menu_menu_items_POST', async () => {
        return await supabase.from('menu_menu_items').upsert(submitItems, { onConflict: ['menu_item_id', 'menu_id'] })
    });

    submitting.value = false;
    showUpdateModal.value = false

    activeMenuRef.value = null
    state = reactive({ ...stateTemplate })
    selectedItems.value = []

    refreshMenus()
}

async function deleteMenu() {
    const id = activeMenuRef.value?.id;
    submitting.value = true;

    const { error } = await useAsyncData('menu_DELETE', async () => {
        return await supabase.from('menu').delete().eq('id', id)
    }, { transform: result => { if (result.error) throw result.error; } });

    submitting.value = false;

    activeMenuRef.value = null
    if (error?.value?.message) {
        alert("An error occurred while deleting the item")
    }

    showDeleteModal.value = false
    refreshMenus()
}

onUnmounted(() => {
    clearTimeout(searchTimeout.value)
})

definePageMeta({
    layout: 'shop-menus',
    name: 'Menus'
})
</script>