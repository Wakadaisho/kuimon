import { serverSupabaseClient } from "#supabase/server";

export default eventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);

  const { q, vegan , halal, spiciness } = getQuery(event);

  let data = supabase
      .from("general_search")
      .select("*")
      .or(`item_name.ilike.%${q}%,shop_name.ilike.%${q}%`);;


  if (vegan) {
    data = data.eq("vegan", vegan === "1");
  }
  if (halal) {
    data = data.eq("halal", halal === "1");
  }
  if (spiciness) {
    data = data.eq("spiciness", spiciness);
  }

  return data;
});
