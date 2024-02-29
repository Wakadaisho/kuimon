import { defineStore } from "pinia";
import { ref } from "vue";

interface OrderItem {
  id: number | string;
  name: string;
  qty?: number;
  user_id: string;
  price: number;
}

export const useCustomerOrderStore = defineStore(
  "customer_order",
  () => {
    const orders = ref<OrderItem[]>([]);
    const router = useRouter();
    const sortBy = ref("name");
    const user = useSupabaseUser();
    const supabase = useSupabaseClient();
    const cartToast = useToast();

    const getAllOrders = computed(() => {
      if (!user) return [];
      switch (sortBy.value) {
        case "qty":
          return orders.value.sort((a, b) => a.qty! - b.qty!);
        case "name":
        default:
          return orders.value.sort((a, b) => (a.name > b.name ? 1 : -1));
      }
    });

    const getAllOrdersCount = computed(() => {
      return getAllOrders.value.filter((order) => (order.qty ?? 0) > 0).length;
    });

    const getAllOrdersQty = computed(() => {
      return getAllOrders.value.reduce((acc, curr) => acc + (curr.qty ?? 0), 0);
    });

    const getItemOrder = (item: OrderItem) => {
      return orders.value.find((order) => order.id === item.id);
    };

    const getItemOrderCount = (item: OrderItem) => {
      return getItemOrder(item)?.qty ?? 0;
    };

    const incrementOrderItem = (item: OrderItem) => {
      const order = orders.value.find((order) => order.id === item.id);

      let qty = order ? order.qty : 1;

      if (order) {
        order.qty = (qty ?? 0) + 1;
      } else {
        // Check dish's restaurant id is the same as other items
        const isSameRestaurant = !!orders.value.filter(
          (order) => order.user_id !== item.user_id
        );
        if (isSameRestaurant) {
          orders.value.push({ ...item, id: item.id, qty, name: item.name });
        } else {
          cartToast.add({
            title: "Cannot add different restaurant's items to cart",
            color: "red",
          });
          return;
        }
      }
      orders.value = orders.value.map((order) => order);
    };

    const setOrderItem = (item: OrderItem) => {
      if ((item.qty ?? 0) <= 0) return;

      const order = orders.value.find((order) => order.id === item.id);
      const orderItem = {
        ...item,
        id: item.id,
        qty: item.qty,
        name: item.name,
      };

      if (order) {
        orders.value = orders.value.map((order) =>
          order.id === item.id ? orderItem : order
        );
      } else {
        orders.value.push(orderItem);
      }
      orders.value = orders.value.map((order) => order);
    };

    const clearOrders = () => {
      orders.value = [];
    };

    const createOrder = async () => {
      const ordersWithQty = orders.value.filter((order) => order.qty! > 0);
      if (ordersWithQty.length === 0) {
        cartToast.add({
          title: "No items in cart",
          color: "red",
        });
        return;
      }
      if (ordersWithQty.length < orders.value.length) {
        cartToast.add({
          title: "Some items have 0 quantity",
          color: "red",
        });
        return;
      }

      const user_id = ordersWithQty[0].user_id;
      const costTotal = ordersWithQty.reduce(
        (acc, curr) => acc + (curr.price ?? 0),
        0
      );
      const newOrder = {
        user_id,
        customer_id: user.value?.id,
        cost: costTotal,
      };

      const { data, error } = await supabase
        .from("order")
        .insert(newOrder as any)
        .select("id");

      if (error) {
        cartToast.add({
          title: "Error creating order",
          color: "red",
        });
        return;
      }

      const order_menu_items = ordersWithQty.map((order) => {
        return {
          order_id: data[0].id,
          menu_item_id: order.id,
          price: order.price,
          quantity: order.qty,
        };
      });

      const { data: data_order_items, error: error_order_items } =
        await supabase.from("order_menu_items").insert(order_menu_items as any);

      if (!error_order_items) {
        cartToast.add({
          title: "Order created",
          color: "green",
        });
        clearOrders();
        router.go(0)
      } else {
        cartToast.add({
          title: "Error creating order",
          color: "red",
        });
        await supabase
          .from("order")
          .delete()
          .eq("id", data[0].id);
      }
    };

    const clearOrderItem = (item: OrderItem) => {
      orders.value = orders.value.filter((order) => order.id === item.id);
    };

    const decrementOrderItem = (item: OrderItem) => {
      const order = orders.value.find((order) => order.id === item.id);

      if (!order || order?.qty === 0) {
        return;
      }

      let qty = order.qty! - 1;

      if (qty < 0) {
        orders.value = orders.value.filter((order) => order.id !== item.id);
      } else {
        order.qty = qty;
      }
      orders.value = orders.value.map((order) => order);
    };

    const deleteOrderItem = (item: OrderItem) => {
      orders.value = orders.value.filter((order) => order.id !== item.id);
    };

    return {
      orders,
      sortBy,
      getAllOrders,
      getAllOrdersCount,
      getAllOrdersQty,
      cartToast,
      clearOrders,
      clearOrderItem,
      getItemOrder,
      getItemOrderCount,
      incrementOrderItem,
      setOrderItem,
      decrementOrderItem,
      deleteOrderItem,
      createOrder,
    };
  },
  { persist: true }
);
