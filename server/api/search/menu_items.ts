import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

export default eventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const user = await serverSupabaseUser(event);

  const { q } = getQuery(event);

  const { data } = await supabase
    .from("menu_item")
    .select("id, name, description, user_id, ingredient(id, name, allergen)")
    .order("name")
    .eq("user_id", user?.id!)
    .ilike("name", `%${q}%`);

  return { data };
});
