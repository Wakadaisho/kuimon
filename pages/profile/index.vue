<template>
    <div>
        <h1 class="uppercase tracking-wide font-bold text-2xl mb-5">Contact Details</h1>
        <UForm class="flex flex-col gap-5 p-10 sm:p-0" :schema="schema" :state="state" @submit="updateContact">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <UFormGroup label="First Name" name="first_name">
                    <UInput v-model="state.first_name" type="text" />
                </UFormGroup>
                <UFormGroup label="Middle Name" name="middle_name">
                    <UInput v-model="state.middle_name" type="text" />
                </UFormGroup>
                <UFormGroup label="Last Name" name="last_name">
                    <UInput v-model="state.last_name" type="text" />
                </UFormGroup>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <UFormGroup label="Phone 1" name="phone_1">
                    <UInput v-model="state.phone_1" type="text" />
                </UFormGroup>
                <UFormGroup label="Phone 2" name="phone_2">
                    <UInput v-model="state.phone_2" type="text" />
                </UFormGroup>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <UFormGroup label="Address Line 1" name="address_line_1">
                    <UInput v-model="state.address_line_1" type="text" />
                </UFormGroup>
                <UFormGroup label="Address Line 2" name="address_line_2">
                    <UInput v-model="state.address_line_2" type="text" />
                </UFormGroup>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <UFormGroup class="col-span-1 sm:col-span-2" label="Website" name="website">
                    <UInput v-model="state.website" type="text" />
                </UFormGroup>
            </div>
            <div class="self-end">
                <UButton type="submit" :loading="submitting">Update</UButton>
            </div>
        </UForm>
    </div>
</template>
<script setup>
import { z } from "zod";
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const submitting = ref(false)

let state = reactive({
    first_name: "",
    middle_name: "",
    last_name: "",
    phone_1: "",
    phone_2: "",
    address_line_1: "",
    address_line_2: "",
    website: "",
})

const schema = z.object({
    first_name: z.string().optional(),
    middle_name: z.string().optional(),
    last_name: z.string().optional(),
    phone_1: z.string().optional(),
    phone_2: z.string().optional(),
    address_line_1: z.string().optional(),
    address_line_2: z.string().optional(),
    website: z.string().optional()
})

const { data } = await useFetch("/api/profile/me");

state = reactive({
    first_name: data.value.first_name ?? "",
    middle_name: data.value.middle_name ?? "",
    last_name: data.value.last_name ?? "",
    phone_1: data.value.phone_1 ?? "",
    phone_2: data.value.phone_2 ?? "",
    address_line_1: data.value.address_line_1 ?? "",
    address_line_2: data.value.address_line_2 ?? "",
    website: data.value.website ?? "",
})

const updateContact = async (event) => {
    submitting.value = true
    const { data } = await supabase.from('contact').update({
        ...event.data
    }).eq('user_id', user.value.id)
    submitting.value = false
}

</script>