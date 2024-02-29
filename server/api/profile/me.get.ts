import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

export default eventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const user = await serverSupabaseUser(event);

  const { data } = await supabase
    .from("profiles")
    .select(
      `id,
      display_name,
      is_restaurant,
      allow_orders,
      discoverable
    `
    )
    .eq("id", user?.id!)
    .single();

  const { data: dataContact } = await supabase
    .from("contact")
    .select(
      `contactId:id,
       first_name,
       middle_name,
       last_name,
       website,
       email,
       address_line_1,
       address_line_2
      `
    )
    .eq("user_id", user?.id!)
    .single();

  return { ...data, ...dataContact };
});
