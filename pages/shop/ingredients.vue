<template>
    <UCard class="container">
        <template #header>
            <div class="flex flex-col w-full sm:flex-row justify-between sm:gap-5">
                <div class="flex items-center justify-center px-3 py-3.5">
                    <UInput v-model="q" placeholder="Filter ingredients..." />
                </div>
                <div class="flex justify-around flex-row items-center gap-2">
                    <UDropdown v-if="selectedRows.length > 1" :items="actions">
                        <UButton icon="i-heroicons-chevron-down" trailing color="gray" size="xs">
                            Actions
                        </UButton>
                    </UDropdown>
                    <UButton icon="i-heroicons-plus-circle" @click="showAddModal = true">Add Ingredient</UButton>
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
                    <UTooltip text="Cannot select default ingredients">
                        <UCheckbox :disabled="true" />
                    </UTooltip>
                </div>
                <div v-else>
                    <UCheckbox :checked="!!selectedRows.find(_row => _row.id === row.id)" @click="select(row)" />
                </div>

            </template>
            <template #allergen-data="{ row }">
                <UBadge class="rounded-full" :variant="'subtle'">{{ row.allergen ? 'Yes' : 'No' }}</UBadge>

            </template>
            <template #actions-data="{ row }">
                <ActionsPopover :data="row" :actions="actionLinks" :disabled="!row.user_id" />
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
        <UForm ref="form" :schema="schema" :state="state" @submit="addIngredient">
            <UCard>
                <template #header>
                    <p class="text-sm uppercase font-semibold text-center">Add Ingredient</p>
                </template>
                <div class="flex flex-col space-y-5">
                    <UFormGroup label="Name" name="name" required>
                        <UInput v-model="state.name" />
                    </UFormGroup>
                    <UFormGroup label="Description" name="description" hint="Optional">
                        <UTextarea v-model="state.description" />
                    </UFormGroup>
                    <UFormGroup label="Allergen" name="allergen">
                        <UToggle v-model="state.allergen" />
                    </UFormGroup>
                </div>
                <template #footer>
                    <UButton :loading="submitting" type="submit">Add</UButton>
                </template>
            </UCard>
        </UForm>
    </UModal>

    <UModal v-model="showUpdateModal">
        <UForm ref="form" :schema="schema" :state="state" @submit="updateIngredient">
            <UCard>
                <template #header>
                    <p class="text-sm uppercase font-semibold text-center">Update Ingredient {{ activeIngredientRef.name }}
                    </p>
                </template>
                <div class="flex flex-col space-y-5">
                    <UFormGroup label="Name" name="name" required>
                        <UInput v-model="state.name" />
                    </UFormGroup>
                    <UFormGroup label="Description" name="description" hint="Optional">
                        <UTextarea v-model="state.description" />
                    </UFormGroup>
                    <UFormGroup label="Allergen" name="allergen">
                        <UToggle v-model="state.allergen" />
                    </UFormGroup>
                </div>
                <template #footer>
                    <UButton :loading="submitting" type="submit">Update</UButton>
                </template>
            </UCard>
        </UForm>
    </UModal>

    <UModal v-model="showDeleteModal">
        <UForm ref="form" :schema="schema" :state="state" @submit="addIngredient">
            <UCard>
                <template #header>
                    <p class="text-sm font-semibold text-center">Delete {{ activeIngredientRef?.name }}? </p>
                </template>
                Are you sure you want to delete <span class="font-semibold">{{ activeIngredientRef?.name }}</span>?

                <template #footer>
                    <div class="flex justify-between">
                        <UButton variant="solid" @click="deleteIngredient">Delete</UButton>
                        <UButton variant="ghost" @click="showDeleteModal = false">Cancel
                        </UButton>
                    </div>
                </template>
            </UCard>
        </UForm>
    </UModal>

    <UModal v-model="showDeleteAllModal">
        <UForm ref="form" :schema="schema" :state="state" @submit="addIngredient">
            <UCard>
                <template #header>
                    <p class="text-sm font-semibold text-center">Delete ingredients? </p>
                </template>
                <div class="flex flex-col items-start">
                    <p>
                        Are you sure you want to delete all <span class="font-semibold">{{ selectedRows.length }}</span>
                        ingredients?</p>
                    <UButton variant="link" class="pl-0" @click="showIngredients = !showIngredients">
                        {{ showIngredients ? "Hide" : "Show" }} ingredients
                    </UButton>
                    <p v-if="showIngredients">
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
const user = useSupabaseUser();
const form = ref()
const submitting = ref(false);

const showAddModal = ref(false);
const showUpdateModal = ref(false);
const showDeleteModal = ref(false);
const showDeleteAllModal = ref(false);
const activeIngredientRef = ref(null);
const showIngredients = ref(false)

watch(activeIngredientRef, (value) => {
    if (value) {
        state = reactive({ ...value })
    }
})

const q = ref('')
const filteredRows = computed(() => {
    if (!q.value) {
        return ingredients.value
    }

    return ingredients?.value?.filter((ingredient) => {
        let obj = { ...ingredient }
        delete obj['id'];
        delete obj['user_id'];
        delete obj['allergen'];

        return Object.values(obj).some((value) => {
            return String(value).toLowerCase().includes(q.value.toLowerCase())
        })
    })
})

const searchTimeout = ref(null)
const ingredients = ref([])
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

    const { error } = await supabase.from('ingredient').delete().in('id', ids)

    if (error) {
        alert("An error occurred while deleting the selected ingredients")
    }
    selectedRows.value = []
    showDeleteAllModal.value = false
    refreshIngredients()
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

const actionLinks = [
    {
        label: 'Edit',
        icon: 'i-heroicons-pencil',
        click: (data) => { activeIngredientRef.value = data; showUpdateModal.value = true }
    },
    {
        label: 'Delete',
        icon: 'i-heroicons-trash',
        click: (data) => { activeIngredientRef.value = data; showDeleteModal.value = true },
    },
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

const { data, pending, refresh: refreshIngredients } =
    await useLazyAsyncData('ingredient', async () => {
        return await supabase.from('ingredient')
            .select('id, name, description, allergen, user_id', { count: 'exact' })
            .order('name')
            .or(`user_id.eq.${user.value.id},user_id.is.null`)
            .range(pageFrom.value - 1, pageTo.value - 1)
    }, { default: () => [], watch: [page, pageCount] });

const { data: dataSearch, pending: pendingSearch, execute: performSearch } =
    await useLazyAsyncData('ingredient_search', async () => {
        return await supabase.from('ingredient')
            .select('id, name, description, allergen, user_id', { count: 'exact' })
            .or(`user_id.eq.${user.value.id},user_id.is.null`)
            .filter('name', 'ilike', `%${q.value}%`)
    });

watch(data, (_data) => {
    ingredients.value = _data.data ?? []
    pageTotal.value = _data.count ?? 100
}, { immediate: true, deep: true })

watch(dataSearch, (_data) => {
    if (!q.value) return;
    ingredients.value = _data.data ?? []
})

watch(q, () => {
    if (q.value) {
        if (searchTimeout.value) {
            clearTimeout(searchTimeout.value)
        }
        searchTimeout.value = setTimeout(() => performSearch(), 500)
    } else {
        refreshIngredients()
    }
})

const columns = [
    { key: 'selected', label: '' },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'description', label: 'Description' },
    { key: 'allergen', label: 'Allergen' },
    { key: 'actions', label: '' }
]

const schema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    allergen: z.boolean()
})

const stateTemplate = {
    name: '',
    description: '',
    allergen: false
}

let state = reactive({ ...stateTemplate })

async function addIngredient(event) {
    submitting.value = true;

    const { error, } = await useAsyncData('ingredient_POST', async () => {
        return await supabase.from('ingredient').insert([{ ...event.data, }])
    }, { transform: result => { if (result.error) throw result.error; } });

    submitting.value = false;

    activeIngredientRef.value = null
    if (error?.value?.message.includes("duplicate")) {
        form.value.setErrors([{ message: "Ingredient already exists", "path": "name" }])
        return;
    }
    state = reactive({ ...stateTemplate })

    showAddModal.value = false
    refreshIngredients()
}

async function updateIngredient(event) {
    submitting.value = true;
    const { error } = await useAsyncData('ingredient_PUT', async () => {

        return await supabase.from('ingredient').update(event.data).eq('id', activeIngredientRef.value.id)
    }, { transform: result => { if (result.error) throw result.error; } });

    submitting.value = false;
    activeIngredientRef.value = null

    if (error?.value?.message.includes("duplicate")) {
        form.value.setErrors([{ message: "Ingredient already exists", "path": "name" }])
        return;
    }

    showUpdateModal.value = false
    refreshIngredients()
}

async function deleteIngredient() {
    const id = activeIngredientRef.value?.id;
    submitting.value = true;

    const { error } = await useAsyncData('ingredient_DELETE', async () => {
        return await supabase.from('ingredient').delete().eq('id', id)
    }, { transform: result => { if (result.error) throw result.error; } });


    activeIngredientRef.value = null
    submitting.value = false;
    if (error?.value?.message) {
        alert("An error occurred while deleting the ingredient")
    }

    showDeleteModal.value = false
    refreshIngredients()
}

definePageMeta({
    layout: 'shop-menus',
    name: 'Ingredients'
})
</script>