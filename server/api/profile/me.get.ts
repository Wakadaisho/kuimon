import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

export default eventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const user = await serverSupabaseUser(event);

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, is_restaurant")
    .eq("id", user?.id!)
    .single();

  return data;
});
