import { defineStore } from "pinia";
import { ref } from "vue";

interface Order {
  id: number;
  name: string;
  qty: number;
}

export const useOrderStore = defineStore("orders", () => {
  const orders = ref<Order[]>([]);
  const sortBy = ref("name");

  const addOrder = (params: Order) => {
    const order = orders.value.find((order) => order.name === params.name);

    let qty = params.qty ?? 1;

    if (typeof(qty) === 'string' && qty === "") qty = 1;

    if (order) {
      order.qty += qty;
      if (order.qty < 1) {
        deleteOrder(order.id);
      }
      return;
    }

    if (qty < 1) return;

    orders.value.push({
      ...params,
      id: Math.random() * 10000,
      qty,
    });
  };

  const getOrders = computed(() => {
    switch (sortBy.value) {
      case "qty":
        return [...orders.value].sort((a, b) => a.qty - b.qty);
      case "name":
      default:
        return [...orders.value].sort((a, b) => (a.name > b.name ? 1 : -1));
    }
  });

  const deleteOrder = (id: number) => {
    orders.value = orders.value.filter((order) => order.id !== id);
  };

  return {
    orders,
    sortBy,
    addOrder,
    getOrders,
    deleteOrder,
  };
}, {persist: true });
