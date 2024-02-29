<template>
    <div class="relative">
        <NavBar />
        <div class="container mx-auto">
            <slot />

        </div>
    </div>
    <div class="absolute right-5 bottom-5">
        <OrderWidget />
    </div>
</template>