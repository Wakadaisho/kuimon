<template>
    <div class="h-26 grid grid-cols-12 rounded-lg shadow-lg hover:shadow-xl">
        <div class="col-span-2 truncate mr-2">
                <img v-if="imageUrl" class="h-full object-cover rounded-l-lg" :src="imageUrl" :alt="item.name">
                <img v-else class="h-full object-cover rounded-l-lg" src="/img/fallback_menu_item_image.jpg"
                    alt="Menu item fallback image">
        </div>

        <div class="col-span-6 flex flex-col justify-evenly">
            <span class="uppercase tracking-wide text-sm font-semibold max-h-5 truncate">
                {{ item.name }}
            </span>
            <p class="m-1 ml-0 pb-5  my-auto flex flex-col overflow-hidden">
                <span class="text-xs truncate">{{ item.description }}</span>
            </p>
            <div class="text-xs uppercase">
                <span class="text-xs self-end">Price:</span> {{ item.price ?? '--' }} /=
            </div>

            <div class="flex justify-between gap-5">
                <div class="flex gap-1 my-1">
                    <UBadge v-if="item.vegan" class="rounded-full px-1" color="green" variant="solid">
                        <span class="uppercase font-bold text-xs"> Vegan</span>
                    </UBadge>
                    <UBadge v-if="item.halal" class="rounded-full px-1" color="lime" variant="solid"><span
                            class="uppercase font-bold text-xs"> Halal</span>
                    </UBadge>
                    <UBadge v-if="item.spiciness !== 'none'" class="flex items-center rounded-full px-1"
                        :color="colors[steps.indexOf(item.spiciness)]" variant="solid">
                        <UIcon :name="`i-mdi-chili-${item.spiciness}`" />
                        <span class="uppercase font-extralight text-xs">{{ item.spiciness }}</span>
                    </UBadge>
                </div>
                <div class="mr-1 flex items-center gap-1">
                    <UIcon class="text-xs" name="i-mdi-store-clock" />
                    <span class="text-xs">--:--</span>
                </div>
            </div>
        </div>

        <div class="col-span-3 mr-3">
            <div v-show="(item?.ingredient?.length ?? 0) !== 0" class="flex justify-end">
                <button @click="showIngredientsModal = true" class="text-primary">
                    <UTooltip
                        :text="item?.ingredient?.map((item) => item.allergen ? `${item.name}*` : item.name).join(', ')">
                        <div>
                            <span class=" text-xs tracking-wide uppercase">Ingredients ({{ item?.ingredient?.length ?? 0
                            }})</span>
                            <UIcon name="i-carbon-popup" dynamic />
                        </div>
                    </UTooltip>
                </button>
            </div>
            <div v-if="showOrder" class="flex h-full justify-end items-center gap-1">
                <span>Qty: </span>
                <OrderInput :item="item" />
            </div>
        </div>

        <UModal v-model="showIngredientsModal">
            <UCard>
                <template #header>
                    <p class="text-sm uppercase font-semibold text-center">{{ item.name }} ingredients({{
                        item?.ingredient?.length }})</p>
                </template>
                <div class="flex gap-5">
                    {{ item?.ingredient?.map((item) => item.allergen ? `${item.name}*` : item.name).join(', ') }}
                </div>
                <template #footer>
                    <p class="text-sm font-semibold">*: possible allergen</p>
                </template>
            </UCard>
        </UModal>
    </div>
</template>

<script setup>
const supabase = useSupabaseClient()
const { item, showOrder, hideIngredients } = defineProps(['item', 'showOrder'])
const showIngredientsModal = ref(false)
const { data } = supabase.storage.from('menu_items').getPublicUrl('public/4ce75558-294c-4858-8d49-5247b6cd2ecc.jpg')
const imageUrl = data.publicUrl
const steps = ['none', 'mild', 'medium', 'hot']
const colors = ['lime', 'amber', 'orange', 'red']

</script>
