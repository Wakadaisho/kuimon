import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

export default eventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const user = await serverSupabaseUser(event);

  const { q } = getQuery(event);

  const { data } = await supabase
    .from("menu")
    .select("id, name, description, user_id, menu_item(id, name, vegan, halal, spiciness, price, ingredient(id, name, allergen)")
    .order("name")
    .eq("user_id", user?.id!)
    .ilike("name", `%${q}%`);

  return { data };
});
