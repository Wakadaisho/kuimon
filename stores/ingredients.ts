import { defineStore } from "pinia";
import { ref } from "vue";
import { useSupabaseClient } from "#imports";

interface Ingredient {
  id: number | string;
  name: string;
  allergen: boolean;
}

export const useIngredientStore = defineStore(
  "ingredients",
  () => {
    const state = ref<Ingredient[]>([]);
    const filteredState = ref<Ingredient[]>([]);
    const loading = ref(false);
    const supabase = useSupabaseClient();

    const fetchIngredients = async () => {
      loading.value = true;
      const response = await supabase
        .from("ingredient")
        .select("id, name, description, allergen")
        .order("name")
        .limit(5)
        .then((res) => res.data);

      state.value =  response ?? [];
      loading.value = false;
      return state.value;
    };

    return {
      loading,
      state,
      filteredState,
      fetchIngredients,
    };
  }
);
