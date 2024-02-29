import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

export default eventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const id = getRouterParam(event, "id");

  if (!id) {
    return new Response("Not found", { status: 404 });
  }

  const { data: shopId } = await supabase
    .from("menu")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!shopId) {
    return new Response("Not found", { status: 404 });
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", shopId?.user_id)
    .single();

  return data;
});
