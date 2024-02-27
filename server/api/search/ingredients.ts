import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

export default eventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const user = await serverSupabaseUser(event);

  const { q } = getQuery(event);

  const { data } = await supabase
    .from("ingredient")
    .select("id, name, description, user_id, allergen")
    .order("name")
    .or(`user_id.eq.${user?.id},user_id.is.null`)
    .ilike("name", `%${q}%`);

  return { data };
});
