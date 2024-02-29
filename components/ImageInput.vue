<template>
    <UInput type="file" size="xs" accept="image/*" @change="uploadImage" />
</template>
  
<script setup>
const supabase = useSupabaseClient();
import { v4 as uuidv4 } from "uuid";

const uploadImage = async (e) => {
    const menu_item = e.target.files[0];
    const newFileName = `${uuidv4()}.${menu_item.name.split('.').pop()}`; // append the original file extension
    const newFile = new File([menu_item], newFileName, { type: menu_item.type });

    const { data, error } = await supabase
        .storage
        .from('menu_items')
        .upload(`public/${newFile.name}`, newFile, {
            cacheControl: '3600',
            upsert: false
        });
    console.log(data)
    console.log(error)
}
</script>
  