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
                    <UButton icon="i-heroicons-plus-circle" @click="showAddModal = true">Add Item</UButton>
                </div>
            </div>
        </template>

        <UTable :rows="filteredRows" :columns="columns" :loading="pending || pendingSearch">
            <template #selected-header>

                <UCheckbox :checked="!!selectedRows.length"
                    :indeterminate="!!(selectedRows.length && selectedRows.length < filteredRows?.length)"
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

            <template #ingredientsList-data="{ row }" :class="`w-64 overflow-auto whitespace-nowrap`">
                <div class="cursor-help w-36 whitespace-nowrap overflow-hidden overflow-ellipsis" @click="toast.add({
                    title: row.ingredient.map(item => item.name).join(', '),
                    color: 'gray'
                })">
                    {{ row.ingredient.map(item => item.name).join(', ') }}
                </div>
            </template>

            <template #badges-data="{ row }">
                <div class="flex gap-1">
                    <UBadge v-if="row.vegan" class="rounded-full" color="green" variant="solid">
                        <span class="uppercase font-extralight text-xs"> Vegan</span>
                    </UBadge>
                    <UBadge v-if="row.halal" class="rounded-full" color="lime" variant="solid"><span
                            class="uppercase font-extralight text-xs"> Halal</span>
                    </UBadge>
                    <UBadge v-if="row.spiciness !== 'none'" class="flex items-center rounded-full"
                        :color="colors[steps.indexOf(row.spiciness)]" variant="solid">
                        <UIcon :name="`i-mdi-chili-${row.spiciness}`" />
                        <span class="uppercase font-extralight text-xs">{{ row.spiciness }}</span>
                    </UBadge>
                </div>
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
                    <UCard>
                        <template #footer>
                            <UCommandPalette class="min-h-min" :empty-state="{ icon: null, label: null }" selected-icon=""
                                :ui="{ emptyState: { wrapper: '' } }" command-attribute="name" :debounce="500"
                                :placeholder="`Add ingredients...`" v-model="selectedIngredients" multiple
                                :autoselect="false" :groups="ingredients"
                                :fuse="{ resultLimit: 5, fuseOptions: { threshold: 0.1, includeMatches: true, keys: ['name', 'description'] } }">
                            </UCommandPalette>
                        </template>

                        <template #header>
                            <div class="flex gap-2">
                                <UTooltip v-for="selectedIngredient in selectedIngredients" text="Click to delete">
                                    <UBadge class="rounded-full cursor-pointer"
                                        @click.self="removeSelectedIngredient(selectedIngredient)" variant='outline'>
                                        {{ selectedIngredient.name }}
                                    </UBadge>
                                </UTooltip>
                            </div>
                        </template>
                    </UCard>

                    <div class="flex flex-col sm:flex-row justify-around h-32">
                        <UFormGroup class="sm:w-1/2  relative" label="Spiciness" name="spiciness">
                            <div class="absolute w-full top-1">
                                <UProgress :value="spiciness" :max="steps">
                                    <template #step-0="{ step }">
                                        <span class="flex justify-end text-lg items-center text-lime-500">
                                            <UIcon name="i-mdi-chili-off" /> {{ step }}
                                        </span>
                                    </template>

                                    <template #step-1="{ step }">

                                        <span class="flex justify-end text-lg items-center text-amber-500">
                                            <UIcon name="i-mdi-chili-mild" /> {{ step }}
                                        </span>

                                    </template>

                                    <template #step-2="{ step }">
                                        <span class="flex justify-end text-lg items-center text-orange-500">
                                            <UIcon name="i-mdi-chili-medium" /> {{ step }}
                                        </span>
                                    </template>

                                    <template #step-3="{ step }">
                                        <span class="flex justify-end text-lg items-center text-red-500">
                                            <UIcon name="i-mdi-chili-hot" /> {{ step }}
                                        </span>
                                    </template>
                                </UProgress>
                            </div>
                            <div class="absolute w-full">
                                <URange v-model="spiciness" :min="0" :max="3" name="spiciness" :color="color" />
                            </div>
                        </UFormGroup>
                        <div class="w-full flex justify-around">
                            <UFormGroup label="Vegan" name="vegan">
                                <UToggle on-icon="i-heroicons-check-20-solid" off-icon="i-heroicons-x-mark-20-solid"
                                    v-model="state.vegan" />
                            </UFormGroup>
                            <UFormGroup label="Halal" name="halal">
                                <UToggle on-icon="i-heroicons-check-20-solid" off-icon="i-heroicons-x-mark-20-solid"
                                    v-model="state.halal" />
                            </UFormGroup>
                        </div>
                    </div>
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
        <UForm ref="form" :schema="schema" :state="state" @submit="updateItem">
            <UCard>
                <template #header>
                    <p class="text-sm uppercase font-semibold text-center">Update Item {{ activeItemRef?.name }}
                    </p>
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
                            <UCommandPalette class="min-h-min" :empty-state="{ icon: null, label: null }" selected-icon=""
                                :ui="{ emptyState: { wrapper: '' } }" command-attribute="name" :debounce="500"
                                :placeholder="`Add ingredients...`" v-model="selectedIngredients" multiple
                                :autoselect="false" :groups="ingredients"
                                :fuse="{ resultLimit: 5, fuseOptions: { threshold: 0.1, includeMatches: true, keys: ['name', 'description'] } }">
                            </UCommandPalette>
                        </template>

                        <template #header>
                            <div class="flex gap-2">
                                <UTooltip v-for="selectedIngredient in selectedIngredients" text="Click to delete">
                                    <UBadge class="rounded-full cursor-pointer"
                                        @click.self="removeSelectedIngredient(selectedIngredient)" variant='outline'>
                                        {{ selectedIngredient.name }}
                                    </UBadge>
                                </UTooltip>
                            </div>
                        </template>
                    </UCard>
                    <div class="flex flex-col sm:flex-row justify-around h-32">
                        <UFormGroup class="sm:w-1/2  relative" label="Spiciness" name="spiciness">
                            <div class="absolute w-full top-1">
                                <UProgress :value="spiciness" :max="steps">
                                    <template #step-0="{ step }">
                                        <span class="flex justify-end text-lg items-center text-lime-500">
                                            <UIcon name="i-mdi-chili-off" /> {{ step }}
                                        </span>
                                    </template>

                                    <template #step-1="{ step }">
                                        <span class="flex justify-end text-lg items-center text-amber-500">
                                            <UIcon name="i-mdi-chili-mild" /> {{ step }}
                                        </span>

                                    </template>

                                    <template #step-2="{ step }">
                                        <span class="flex justify-end text-lg items-center text-orange-500">
                                            <UIcon name="i-mdi-chili-medium" /> {{ step }}
                                        </span>
                                    </template>

                                    <template #step-3="{ step }">
                                        <span class="flex justify-end text-lg items-center text-red-500">
                                            <UIcon name="i-mdi-chili-hot" /> {{ step }}
                                        </span>
                                    </template>
                                </UProgress>
                            </div>
                            <div class="absolute w-full">
                                <URange v-model="spiciness" :min="0" :max="3" name="spiciness" :color="color" />
                            </div>
                        </UFormGroup>
                        <div class="w-full flex justify-around">
                            <UFormGroup label="Vegan" name="vegan">
                                <UToggle on-icon="i-heroicons-check-20-solid" off-icon="i-heroicons-x-mark-20-solid"
                                    v-model="state.vegan" />
                            </UFormGroup>
                            <UFormGroup label="Halal" name="halal">
                                <UToggle on-icon="i-heroicons-check-20-solid" off-icon="i-heroicons-x-mark-20-solid"
                                    v-model="state.halal" />
                            </UFormGroup>
                        </div>
                    </div>

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
const user = useSupabaseUser()
const form = ref()
const submitting = ref(false);
const showAddModal = ref(false);
const showUpdateModal = ref(false);
const showDeleteModal = ref(false);
const showDeleteAllModal = ref(false);
const activeItemRef = ref(null);
const showItems = ref(false)
const q = ref('')
const filter = ref('')
const selectedIngredients = ref([])
const spiciness = ref(0)
const toast = useToast()

const steps = [
    'none',
    'mild',
    'medium',
    'hot'
]

const colors = [
    'lime',
    'amber',
    'orange',
    'red'
]

const color = computed(() => {
    return colors[spiciness.value]
})

watch(filter, () => {
    if (filter.value) {
        q.value = filter.value
    }
})

watch(activeItemRef, (item) => {
    if (item) {
        state = reactive({ ...item })
        selectedIngredients.value = item.ingredient
        spiciness.value = steps.indexOf(item.spiciness)
    }
})

const ingredients = [
    {
        key: 'ingredients',
        label: q => q && `Ingredients matching “${q}”...`,
        search: async (q) => {
            if (!q) {
                return []
            }

            const { data } = await useFetch('/api/search/ingredients', { params: { q } })
            return data.value.data
        }
    }]

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

function removeSelectedIngredient(ingredient) {
    selectedIngredients.value = selectedIngredients.value.filter((v) => v.id != ingredient.id)
}

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
    refreshItems()
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

const actionLinks = [
    {
        label: 'Edit',
        icon: 'i-heroicons-pencil',
        click: (data) => { activeItemRef.value = data; showUpdateModal.value = true }
    },
    {
        label: 'Delete',
        icon: 'i-heroicons-trash',
        click: (data) => { activeItemRef.value = data; showDeleteModal.value = true },
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

const { data, pending, refresh: refreshItems } =
    await useLazyAsyncData('item', async () => {
        return await supabase.from('menu_item')
            .select(`id,
                    name,
                    description,
                    vegan,
                    halal,
                    user_id,
                    spiciness,
                    ingredient (
                        id,
                        name,
                        description,
                        allergen
                    )`, { count: 'exact' })
            .order('name')
            .eq('user_id', user.value.id)
            .range(pageFrom.value - 1, pageTo.value - 1)
    }, { default: () => [], watch: [page, pageCount] });

const { data: dataSearch, pending: pendingSearch, execute: performSearch } =
    await useLazyAsyncData('item_search', async () => {
        return await supabase.from('menu_item')
            .select('id, name, description, vegan, halal, user_id', { count: 'exact' })
            .eq('user_id', user.value.id)
            .filter('name', 'ilike', `%${q.value}%`)
    });

watch(data, (_data) => {
    items.value = _data.data ?? []
    pageTotal.value = _data.count ?? 100
}, { immediate: true, deep: true })

watch(dataSearch, (_data) => {
    if (!q.value) return;
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
    { key: 'ingredientsList', label: 'Ingredients' },
    { key: 'badges', label: 'Dietary' },
    { key: 'actions', label: 'Actions' }
]

const schema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    vegan: z.boolean(),
    halal: z.boolean()
})

const stateTemplate = {
    name: '',
    description: '',
    spiciness: 'none',
    vegan: false,
    halal: false
}

let state = reactive({ ...stateTemplate })

async function addItem(event) {
    let submitData = { ...event.data, spiciness: steps[spiciness.value].toLowerCase() }
    let submitIngredients = selectedIngredients.value.map(ingredient => ingredient.id)

    submitting.value = true;

    const { data, error, } = await useAsyncData('item_POST', async () => {
        return await supabase.from('menu_item').insert([{ ...submitData, }]).select('id')
    },);

    submitIngredients = submitIngredients.map(ingredient => {
        return { menu_item_id: data.value.data[0].id, ingredient_id: ingredient }
    })

    const { error: errorItems } = await useAsyncData('menu_item_ingredients_POST', async () => {
        return await supabase.from('menu_item_ingredients').insert(submitIngredients)
    },);

    submitting.value = false;

    activeItemRef.value = null

    if (errorItems?.value?.message.includes("duplicate")) {
        form.value.setErrors([{ message: "Item already exists", "path": "name" }])
        return;
    }
    state = reactive({ ...stateTemplate })
    selectedIngredients.value = []
    spiciness.value = 0

    showAddModal.value = false
    refreshItems()
}

async function updateItem(event) {
    let submitData = { ...event.data, spiciness: steps[spiciness.value].toLowerCase() }
    let submitIngredients = selectedIngredients.value.map(ingredient => ingredient.id)

    submitting.value = true;

    delete submitData['id']
    delete submitData['user_id']
    delete submitData['ingredient']

    const { error } = await useAsyncData('item_PATCH', async () => {
        return await supabase.from('menu_item').update(submitData).eq('id', activeItemRef.value.id)
    },);

    submitIngredients = submitIngredients.map(ingredient => {
        return { menu_item_id: activeItemRef.value.id, ingredient_id: ingredient }
    })

    const { error: errorDeleteItems } = await useAsyncData('menu_item_ingredients_DELETE', async () => {
        return await supabase.from('menu_item_ingredients').delete().eq('menu_item_id', activeItemRef.value.id)
    });

    const { error: errorUpdateItems } = await useAsyncData('menu_item_ingredients_POST', async () => {
        return await supabase.from('menu_item_ingredients').upsert(submitIngredients, { onConflict: ['menu_item_id', 'ingredient_id'] })
    });

    submitting.value = false;

    showUpdateModal.value = false

    state = reactive({ ...stateTemplate })

    selectedIngredients.value = []
    spiciness.value = 0
    activeItemRef.value = null

    refreshItems()
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

    activeItemRef.value = null
    showDeleteModal.value = false
    refreshItems()
}

onUnmounted(() => {
    clearTimeout(searchTimeout.value)
})

definePageMeta({
    layout: 'shop-menus',
    name: 'Menu Items'
})
</script>