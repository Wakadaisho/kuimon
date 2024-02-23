<template>
    <header>
        <nav>
            <div class="flex justify-between items-center h-18 shadow-lg py-2 px-4">
                <div class="w-10 h-10">
                    <span class="sr-only">Kuimon</span>
                    <img class="w-full h-full object-cover" src="https://picsum.photos/200/300" alt="Logo">
                </div>
                <div class="flex items-center">
                    <ColorModeIcon />
                    <UButton icon="i-heroicons-bars-3" color="hot" variant="ghost" />
                </div>
            </div>
        </nav>
    </header>

    <Placeholder class="min-h-96" />
    <Placeholder class="min-h-96" />
    <Placeholder class="min-h-96" />
    <Placeholder class="min-h-96" />
</template>

<script setup lang="ts">
const colorMode = useColorMode()
const isDark = computed({
    get() {
        return colorMode.value === 'dark'
    },
    set() {
        colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
    }
})
</script>

<style scoped></style>