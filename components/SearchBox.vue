<template>
    <div class="container mx-auto px-5 sm:w-10/12">
        <UCard>
            <template #header>
                <div class="w-full">
                    <h1 id="card-header" class="font- uppercase tracking-wide font-bold text-lg text-center">Let's find some
                        grub</h1>
                </div>
            </template>
            <UCommandPalette class="min-h-min" :empty-state="{ icon: null, label: null }" selected-icon=""
                 :debounce="500" :placeholder="`Search`" :autoselect="false"
                :groups="search" :fuse="{ resultLimit: 5, fuseOptions: { threshold: 0.1, } }">
                <template #search-command="{ command }">
                    <ULink class="truncate" :to="`/shop/${command.shop_id}`">
                        <MenuLineItem :item="{
                            image: command.image,
                            name: command.item_name,
                            description: command.item_description,
                            price: command.price,
                            vegan: command.vegan,
                            halal: command.halal,
                            spiciness: command.spiciness
                        }" :disabled="true"/>
                    </ULink>
                </template>
            </UCommandPalette>
            <template #footer>
                <div class="flex sm:justify-end gap-5">
                    <UPopover :popper="{ placement: 'bottom-start' }">
                        <UButton :variant="`${personalFilterSelected ? 'solid' : 'outline'}`" label="Filters"
                            class="rounded-lg" icon="i-mdi-tune" />
                        <template #panel>
                            <div class="flex flex-col gap-3 p-4">
                                <UCheckbox v-model="personalFilter.vegan" label="Vegan" />
                                <UCheckbox v-model="personalFilter.halal" label="Halal" />
                                <USelect v-model="personalFilter.spiciness" color="primary" variant="outline"
                                    leading-icon="i-mdi-chili-mild" :options="['Any', 'None', 'Mild', 'Medium', 'Hot']" />
                            </div>
                        </template>
                    </UPopover>
                </div>
            </template>
        </UCard>
    </div>
</template>

<script setup>
const personalFilter = reactive({ vegan: false, halal: false, spiciness: 'Any' })

const personalFilterSelected = computed(() => {
    if (personalFilter.vegan || personalFilter.halal) {
        return true
    }
    if (personalFilter.spiciness && personalFilter.spiciness !== 'Any') {
        return true
    }
    return false

})

const search = [
    {
        key: 'search',
        label: q => q && `Results for “${q}”...`,
        search: async (q) => {
            if (!q) {
                return []
            }
            let opts = { params: { q } }

            if (personalFilter.vegan) {
                opts.params.vegan = '1'
            }
            if (personalFilter.halal) {
                opts.params.halal = '1'
            }
            if (personalFilter.spiciness && personalFilter.spiciness !== 'Any') {
                opts.params.spiciness = personalFilter.spiciness.toLowerCase()
            }

            const { data } = await useFetch('/api/search', opts)

            return data.value.data
        }
    }]

</script>