<template>
  <div class="max-w-screen-sm mx-auto v-auto-animate h-screen">
    <UCard class="m-10 mt-36">
      <template #header>
        <h1 class="text-center text-lg tracking-wide">Register with Kuimon</h1>
      </template>

      <UAlert v-if="showError"
        :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'gray', variant: 'link', padded: false }" color="red"
        variant="subtle" title="An error occurred while creating the account" @close="showError = false" class="mb-4" />

      <UForm class="flex flex-col gap-5" :schema="schema" :state="state" @submit="signUp">
        <UFormGroup label="Email" name="email">
          <UInput v-model="state.email" />
        </UFormGroup>

        <UFormGroup label="Password" name="password">
          <UInput v-model="state.password" type="password" />
        </UFormGroup>

        <div class="flex justify-evenly">
          <UButton size="lg" label="Sign Up" color="gray" type="submit" />
        </div>
      </UForm>

      <!-- <UDivider class="my-5" label="OR" />

      <div class="flex justify-evenly">
        <UButton color="black" label="Continue with Google" icon="i-simple-icons-google" size="lg" block />
      </div> -->

      <template class="flex justify-evenly" #footer>
        <p class="text-center text-sm">
          Already have an account? <ULink to="/login" class="ml-1 text-primary">Sign in here</ULink>
        </p>
      </template>
    </UCard>
  </div>
</template>

<script setup>
import { z } from 'zod'
const supabase = useSupabaseClient()
const showError = ref(false)
const router = useRouter()
const state = reactive({
  email: undefined,
  password: undefined
})

const schema = z.object({
  email: z.string({ required_error: "Please fill in email" }).email(),
  password: z.string({ required_error: "Please fill in password" }).min(6, "Should be at least 6 characters long")
})

const signUp = async (event) => {
  const { error: err } = await supabase.auth.signUp({
    ...event.data
  });

  if (err) {
    showError.value = true;
    return
  }

  router.push('/')
}
</script>
