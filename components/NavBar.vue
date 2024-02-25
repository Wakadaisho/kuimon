<template>
    <header>
        <nav class="mb-10">
            <div class="flex justify-between items-center h-18 shadow-lg py-2 px-4">
                <div class="w-10 h-10">
                    <span class="sr-only">Kuimon</span>
                    <!-- <img class="w-full h-full object-cover" src="https://picsum.photos/200/300" alt="Logo" /> -->
                </div>
                <div class="flex items-center">
                    <div class="flex gap-10">
                        <ul class="hidden sm:flex items-center gap-4">

                            <ULink v-for="link in links" :key="link.href" :to="link.href"
                                class="border-b-2 border-transparent hover:text-primary hover:border-primary font-semibold text-xs uppercase tracking-wider">
                                {{ link.label }}</Ulink>

                        </ul>
                        <div class="flex items-center gap-5">
                            <ColorModeIcon class="hidden sm:block" />
                            <UButton class="sm:hidden" icon="i-heroicons-bars-3" color="gray" variant="ghost"
                                v-auto-animate />
                            <!-- <UAvatar size="sm" src="https://picsum.photos/200/300" alt="Avatar" /> -->

                        </div>
                    </div>
                </div>
            </div>
        </nav>
    </header>
</template>

<script setup>
const links = [{
    href: "/shop/menus",
    label: "Shop"
}, {
    href: "/orders",
    label: "My Orders"
}]

</script>