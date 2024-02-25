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
                    :indeterminate="!!(selectedRows.length && selectedRows.length < selectableRows?.length)"
                    @click="toggleSelectedPageRows" />

            </template>
            <template #selected-data="{ row }">
                <div v-if="!row.user_id?.length">
                    <UTooltip text="Cannot select default items">
                        <UCheckbox :disabled="true" />
                    </UTooltip>
                </div>
                <div v-else>
                    <UCheckbox :checked="!!selectedRows.find(_row => _row.id === row.id)" @click="select(row)" />
                </div>

            </template>
            <template #vegan-data="{ row }">
                <UBadge class="rounded-full" :variant="'subtle'">{{ row.vegan ? 'Yes' : 'No' }}</UBadge>

            </template>
            <template #halal-data="{ row }">
                <UBadge class="rounded-full" :variant="'subtle'">{{ row.halal ? 'Yes' : 'No' }}</UBadge>

            </template>
            <template #actions-data="{ row }">
                <!-- Cannot edit system items -->
                <div v-if="!!row.user_id" class="flex gap-4">
                    <UButton icon="i-heroicons-pencil" size="2xs" color="orange" variant="ghost" square
                        @click="activeItemRef = row; showUpdateModal = true" />
                    <UButton icon="i-heroicons-trash" size="2xs" color="red" variant="soft" square
                        @click="activeItemRef = row; showDeleteModal = true" />
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

                <UPagination  v-model="page" :page-count="pageCount" :total="pageTotal" :ui="{
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
        <UForm ref="form" :schema="schema" :state="state" @submit="addItem">
            <UCard>
                <template #header>
                    <p class="text-sm uppercase font-semibold text-center">Add Item</p>
                </template>
                <div class="flex flex-col space-y-5">
                    <UFormGroup label="Name" name="name" required>
                        <UInput v-model="state.name" />
                    </UFormGroup>
                    <UFormGroup label="Description" name="description" hint="Optional">
                        <UTextarea v-model="state.description" />
                    </UFormGroup>
                    <UFormGroup label="Vegan" name="vegan">
                        <UToggle v-model="state.vegan" />
                    </UFormGroup>
                </div>
                <template #footer>
                    <UButton :loading="submitting" type="submit">Add</UButton>
                </template>
            </UCard>
        </UForm>
    </UModal>

    <UModal v-model="showUpdateModal">
        <UForm ref="form" :schema="schema" :state="state" @submit="updateItem">
            <UCard>
                <template #header>
                    <p class="text-sm uppercase font-semibold text-center">Update Item {{ activeItemRef.name }}
                    </p>
                </template>
                <div class="flex flex-col space-y-5">
                    <UFormGroup label="Name" name="name" required>
                        <UInput v-model="state.name" />
                    </UFormGroup>
                    <UFormGroup label="Description" name="description" hint="Optional">
                        <UTextarea v-model="state.description" />
                    </UFormGroup>
                    <UFormGroup label="Vegan" name="vegan">
                        <UToggle v-model="state.vegan" />
                    </UFormGroup>
                    <UFormGroup label="Halal" name="halal">
                        <UToggle v-model="state.halal" />
                    </UFormGroup>

                </div>
                <template #footer>
                    <UButton :loading="submitting" type="submit">Update</UButton>
                </template>
            </UCard>
        </UForm>
    </UModal>

    <UModal v-model="showDeleteModal">
        <UForm ref="form" :schema="schema" :state="state" @submit="addItem">
            <UCard>
                <template #header>
                    <p class="text-sm font-semibold text-center">Delete {{ activeItemRef?.name }}? </p>
                </template>
                Are you sure you want to delete <span class="font-semibold">{{ activeItemRef?.name }}</span>?

                <template #footer>
                    <div class="flex justify-between">
                        <UButton variant="solid" @click="deleteItem">Delete</UButton>
                        <UButton variant="ghost" @click="showDeleteModal = false">Cancel
                        </UButton>
                    </div>
                </template>
            </UCard>
        </UForm>
    </UModal>

    <UModal v-model="showDeleteAllModal">
        <UForm ref="form" :schema="schema" :state="state" @submit="addItem">
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
const form = ref()
const submitting = ref(false);

const showAddModal = ref(false);
const showUpdateModal = ref(false);
const showDeleteModal = ref(false);
const showDeleteAllModal = ref(false);
const activeItemRef = ref(null);
const showItems = ref(false)

const q = ref('')
const filteredRows = computed(() => {
    if (!q.value) {
        return items.value
    }

    return items?.value?.filter((item) => {
        let obj = { ...item }
        delete obj['id'];
        delete obj['user_id'];
        delete obj['vegan'];
        delete obj['halal'];

        return Object.values(obj).some((value) => {
            return String(value).toLowerCase().includes(q.value.toLowerCase())
        })
    })
})

const searchTimeout = ref(null)
const items = ref([])
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

    const { error } = await supabase.from('menu_item').delete().in('id', ids)

    if (error) {
        alert("An error occurred while deleting the selected items")
    }
    selectedRows.value = []
    showDeleteAllModal.value = false
    await refreshItems()
}

const selectableRows = computed(() => filteredRows.value?.filter((row) => !!row.user_id))

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

const { data, pending, refresh: refreshItems } =
    await useLazyAsyncData('item', async () => {
        return await supabase.from('menu_item')
            .select('id, name, description, vegan, halal, user_id', { count: 'exact' })
            .order('name')
            .range(pageFrom.value - 1, pageTo.value - 1)
    }, { default: () => [], watch: [page, pageCount] });

const { data: dataSearch, pending: pendingSearch, execute: performSearch } =
    await useLazyAsyncData('item_search', async () => {
        return await supabase.from('menu_item')
            .select('id, name, description, vegan, halal, user_id', { count: 'exact' })
            .filter('name', 'ilike', `%${q.value}%`)
    });

watch(data, (_data) => {
    items.value = _data.data ?? []
    pageTotal.value = _data.count ?? 100
}, { immediate: true, deep: true})

watch(dataSearch, (_data) => {
    if(!q.value) return;
    items.value = _data.data ?? []
})

watch(q, () => {
    if (q.value) {
        if (searchTimeout.value) {
            clearTimeout(searchTimeout.value)
        }
        searchTimeout.value = setTimeout(() => performSearch(), 500)
    } else {
        refreshItems()
    }
})

const columns = [
    { key: 'selected', label: '' },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'description', label: 'Description' },
    { key: 'vegan', label: 'Vegan' },
    { key: 'halal', label: 'Halal' },
    { key: 'actions', label: 'Actions' }
]

const schema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    vegan: z.boolean()
})

const stateTemplate = {
    name: '',
    description: '',
    vegan: false,
    halal: false
}

let state = reactive({ ...stateTemplate })

async function addItem(event) {
    submitting.value = true;

    const { error, } = await useAsyncData('item_POST', async () => {
        return await supabase.from('menu_item').insert([{ ...event.data, }])
    }, { transform: result => { if (result.error) throw result.error; } });

    submitting.value = false;

    activeItemRef.value = null
    if (error?.value?.message.includes("duplicate")) {
        form.value.setErrors([{ message: "Item already exists", "path": "name" }])
        return;
    }
    state = { ...stateTemplate }

    showAddModal.value = false
    await refreshItems()
}

async function updateItem(event) {
    submitting.value = true;
    const { error } = await useAsyncData('item_PUT', async () => {

        return await supabase.from('menu_item').update(event.data).eq('id', activeItemRef.value.id)
    }, { transform: result => { if (result.error) throw result.error; } });

    submitting.value = false;
    activeItemRef.value = null

    if (error?.value?.message.includes("duplicate")) {
        form.value.setErrors([{ message: "Item already exists", "path": "name" }])
        return;
    }

    showUpdateModal.value = false
    await refreshItems()
}

async function deleteItem() {
    const id = activeItemRef.value?.id;
    submitting.value = true;

    const { error } = await useAsyncData('item_DELETE', async () => {
        return await supabase.from('menu_item').delete().eq('id', id)
    }, { transform: result => { if (result.error) throw result.error; } });

    submitting.value = false;
    if (error?.value?.message) {
        alert("An error occurred while deleting the item")
    }

    showDeleteModal.value = false
    await refreshItems()
}

definePageMeta({
    layout: 'shop-menus',
    name: 'Menu Items'
})
</script>