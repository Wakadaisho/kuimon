<template>
    <div class="min-w-48 max-w-64 overflow-hidden border rounded-lg shadow-lg  hover:shadow-2xl">
        <div class="border-b-2 min-h-20">
                <img v-if="imageUrl" class="object-cover rounded-l-lg" :src="imageUrl" :alt="item.name">
                <img v-else class="object-cover rounded-l-lg" src="/img/fallback_menu_item_image.jpg"
                    alt="Menu item fallback image">
        </div>
        <div class="flex flex-col border-b-2 min-h-16 justify-evenly mx-1">
            <div class="flex justify-between items-baseline max-h-5">
                <div class="uppercase tracking-wide text-sm font-semibold max-h-5 truncate">
                    {{ item.name }}
                </div>
                <div class="mr-1 flex items-center gap-1">
                    <UIcon class="text-xs" name="i-mdi-store-clock" />
                    <span class="text-xs">--:--</span>
                </div>
            </div>
            <div class="text-xs uppercase">
                <span class="text-xs">Price:</span> {{ item.price ?? '--' }} /=
            </div>
        </div>
        <div class="flex flex-col">
            <button @click="showIngredientsModal = true" class="mr-1 flex items-center self-end gap-1 text-primary">
                <UTooltip :text="item?.ingredient.map((item) => item.allergen ? `${item.name}*` : item.name).join(', ')">
                    <span class=" text-xs tracking-wide uppercase">Ingredients ({{ item?.ingredient.length }})</span>
                    <UIcon name="i-carbon-popup" dynamic />
                </UTooltip>
            </button>
            <p class="m-1 h-10 my-auto flex flex-col overflow-hidden">
                <span class="text-xs truncate">{{ item.description }}</span>
            </p>
            <div class="m-1 overflow-hidden">
                <div class="flex gap-1">
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
            </div>
            <div v-if="showOrder" class="flex justify-around items-center m-2">
                <span>Qty:</span>
                <OrderInput :item="item" />
            </div>
        </div>
        <UModal v-model="showIngredientsModal">
            <UCard>
                <template #header>
                    <p class="text-sm uppercase font-semibold text-center">{{ item?.name }} ingredients ({{
                        item?.ingredient.length }})</p>
                </template>
                <div class="flex gap-5">
                    {{ item?.ingredient.map((item) => item.allergen ? `${item.name}*` : item.name).join(', ') }}
                </div>
                <template #footer>
                    <p class="text-sm font-semibold">*: possible allergen</p>
                </template>
            </UCard>
        </UModal>
    </div>
</template>

<script setup>
const { item, showOrder } = defineProps(['item', 'showOrder'])
const supabase = useSupabaseClient()
const showIngredientsModal = ref(false)

const { data } = supabase.storage.from('menu_items').getPublicUrl('public/4ce75558-294c-4858-8d49-5247b6cd2ecc.jpg')

const imageUrl = data.publicUrl
const steps = ['none', 'mild', 'medium', 'hot']
const colors = [
    'lime',
    'amber',
    'orange',
    'red'
]

</script>
