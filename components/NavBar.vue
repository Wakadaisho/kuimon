<template>
    <header>
        <nav class="mb-10">
            <div class="flex justify-between items-center h-18 shadow-lg py-2 px-4">
                <div id="logo" class="w-10 h-10">
                    <span class="sr-only">Kuimon</span>
                    <div class="flex flex-col items-center justify-center">
                        <UButton to="/" variant="solid" label="飯" class="rounded-full border-0" color="orange" />
                        <p class="uppercase text-xs tracking-widest">kuimon</p>
                    </div>
                </div>
                <div class="flex items-center">
                    <div class="flex gap-10">
                        <ul class="hidden sm:flex items-center gap-4">
                            <ULink v-if="user" v-for="link in links.filter((v) => v.show !== false)" :key="link.to"
                                :to="link.to">
                                <UChip v-if="link.label === 'My Orders' && getAllOrdersCount" :text="getAllOrdersCount"
                                    size="xl">
                                    <span
                                        class="border-b-2 border-transparent hover:text-primary hover:border-primary font-semibold text-xs uppercase tracking-wider">
                                        {{ link.label }}</span>
                                </UChip>
                                <span v-else
                                    class="border-b-2 border-transparent hover:text-primary hover:border-primary font-semibold text-xs uppercase tracking-wider">
                                    {{ link.label }}
                                </span>
                            </Ulink>
                        </ul>
                        <div class="flex items-center  gap-5">
                            <ColorModeIcon class="hidden sm:block" />
                            <UPopover v-if="user">
                                <!-- <UButton color="white" label="Open" trailing-icon="i-heroicons-chevron-down-20-solid" /> -->
                                <UAvatar size="sm" :alt="user.email.toUpperCase()[0]" :src="user.avatar_url" />
                                <template #panel>
                                    <div class="p-4">
                                        <UVerticalNavigation :links="popoverLinks" />
                                    </div>
                                </template>
                            </UPopover>
                            <div v-else class="flex gap-2">
                                <UButton to="/login" label="Log in" variant="link" class="rounded-full hover:text-primary"
                                    color="black" />
                                <UButton to="/sign-up" label="Sign up" class="rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    </header>
</template>

<script setup>
const { data } = await useFetch('/api/profile/me')
const user = useSupabaseUser()
const router = useRouter()
const customerOrderStore = useCustomerOrderStore()
const { getAllOrdersCount } = storeToRefs(customerOrderStore)
const name = computed(() => {
    if (data.value.display_name) {
        return data.value.display_name
    }
    if (data.value.first_name.length && data.value.last_name.length) {
        return `${data.value.last_name[0].toUpperCase()}. ${data.value.first_name}`
    }
    return user.value?.email
})


const popoverLinks = computed(() => {
    return [
        [{
            label: 'Profile',
            icon: 'i-mdi-account',
            to: '/profile',
        },
        {
            label: 'My Orders',
            icon: 'i-mdi-book-open',
            description: 'View your Orders',
            to: '/orders',
        }, {
            label: 'Shop settings',
            icon: 'i-simple-icons-homeassistantcommunitystore',
            to: '/shop',

        }
        ],
        [{
            label: name.value,
            avatar: {
                src: 'https://avatars.githubuserontent.com/u/739984?v=4',
                alt: user.value?.email.toUpperCase()[0]
            },
        }, {
            label: 'Sign Out',
            icon: 'i-mdi-log-out',
            click: () => {
                useSupabaseClient().auth.signOut().then(() => {
                    router.push('/')
                })
            }
        }
        ]
    ]
})

const links = computed(() => {
    if (!user) {
        return [{
            to: "/sign-up",
            label: "Sign up",
        }, {
            to: "/login",
            label: "Log in"
        }]
    }
    return [{
        to: "/shop",
        label: "Shop Details",
        show: data.value?.is_restaurant ?? false
    }, {
        to: "/orders",
        label: "My Orders"

    }]
})

</script>

<style>
#logo,
#hi {
    font-family: Rampant One, sans-serif;
}
</style>