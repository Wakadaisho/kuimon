<template>
    <header>
        <nav class="mb-10">
            <div class="flex justify-between items-center h-18 shadow-lg py-2 px-4">
                <div id="logo" class="w-10 h-10">
                    <span class="sr-only">Kuimon</span>
                    <div class="flex flex-col items-center justify-center">
                        <UButton  to="/" variant="solid" label="飯" class="rounded-full" color="orange" />
                        <!-- <img class="w-full h-full object-cover" src="https://picsum.photos/200/300" alt="Logo" /> -->
                        <p class="uppercase text-xs tracking-widest">kuimon</p>
                    </div>
                </div>
                <div class="flex items-center">
                    <div class="flex gap-10">
                        <ul class="hidden sm:flex items-center gap-4">

                            <ULink v-if="user" v-for="link in links.filter((v) => v.show !== false)" :key="link.to"
                                :to="link.to"
                                class="border-b-2 border-transparent hover:text-primary hover:border-primary font-semibold text-xs uppercase tracking-wider">
                                {{ link.label }}</Ulink>


                        </ul>
                        <div class="flex items-center  gap-5">
                            <ColorModeIcon class="hidden sm:block" />
                            <UPopover v-if="user" :popper="{ placement: 'top-end' }">
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
                                <UButton to="/sign-up" label="Sign in" class="rounded-full" />
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

const popoverLinks = [
    [{
        label: 'Profile',
        icon: 'i-mdi-account',
        description: 'View your profile',
        to: '/profile',
        target: '_blank',
    }].concat(data.value?.is_restaurant ? [{
        label: 'Manage Shop',
        icon: 'i-simple-icons-homeassistantcommunitystore',
        to: '/shop',
        target: '_blank',

    }] : []),
    [{
        label: user.value?.email,
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
        to: "/shop/menus",
        label: "Shop",
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