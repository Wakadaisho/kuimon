<template>
    <UForm class="flex flex-col gap-5" :schema="schema" :state="state" @submit="updateUser">
        <UFormGroup label="Display Name" name="display_name" hint="Defaults to email">
            <UInput v-model="state.display_name" placeholder="Your persona to customers" type="text" />
        </UFormGroup>

        <div class="flex flex-col gap-4 md:flex-row justify-around">
            <UCheckbox v-model="state.is_restaurant" name="is_restaurant" label="Is a restaurant?"
                help="Menus can be seen by customers" />
            <UCheckbox v-model="state.allow_orders" name="allow_orders" label="Allow orders to be placed?"
                help="Customers can place in-house orders" />
            <UCheckbox v-model="state.discoverable" name="discoverable" label="Discovarable through search?"
                help="Appear on searches (must be restaurant? as well)" />
        </div>

        <div class="self-end">
            <UButton type="submit" :loading="submitting">Update</UButton>
        </div>
    </UForm>
</template>
<script setup>
import { z } from "zod";
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const submitting = ref(false)

let state = reactive({
    display_name: "",
    is_restaurant: false,
    allow_orders: false,
    discoverable: false
})

const schema = z.object({
    display_name: z.string().optional(),
    is_restaurant: z.boolean(),
    allow_orders: z.boolean(),
    discoverable: z.boolean()
})

const { data } = await useFetch("/api/profile/me");

state = reactive({
    display_name: data.value.display_name,
    is_restaurant: data.value.is_restaurant,
    allow_orders: data.value.allow_orders,
    discoverable: data.value.discoverable
})

const updateUser = async (event) => {
    submitting.value = true
    const { data } = await supabase.from('profiles').update({
        ...event.data
    }).eq('id', user.value.id)
    submitting.value = false
}

definePageMeta({
    layout: 'shop-menus',
    name: 'Shop Settings',
})
</script>