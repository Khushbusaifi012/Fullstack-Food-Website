export type OrderDeliveryMode = "delivery" | "pickup";

export type OrderTrackingStep = {
  id: string;
  label: string;
  hint: string;
};

function normalizeStatus(status: string): string {
  return status.trim().toLowerCase().replace(/\s+/g, "_");
}

/** Maps API `status` to timeline phase 0–3. Expand when the kitchen adds more statuses. */
export function orderStatusToPhase(
  status: string,
  _deliveryMode: OrderDeliveryMode,
): number {
  const s = normalizeStatus(status);
  if (s === "cancelled" || s === "canceled") return -1;
  if (
    s === "delivered" ||
    s === "completed" ||
    s === "picked_up" ||
    s === "pickedup"
  ) {
    return 3;
  }
  if (_deliveryMode === "pickup") {
    if (s === "ready" || s === "ready_for_pickup") return 2;
  } else {
    if (
      s === "on_the_way" ||
      s === "out_for_delivery" ||
      s === "dispatched" ||
      s === "in_transit"
    ) {
      return 2;
    }
  }
  if (
    s === "preparing" ||
    s === "in_kitchen" ||
    s === "cooking" ||
    s === "being_prepared"
  ) {
    return 1;
  }
  if (
    s === "placed" ||
    s === "confirmed" ||
    s === "received" ||
    s === "pending"
  ) {
    return 0;
  }
  return 0;
}

export function getOrderTrackingSteps(
  deliveryMode: OrderDeliveryMode,
): OrderTrackingStep[] {
  if (deliveryMode === "pickup") {
    return [
      {
        id: "received",
        label: "Received",
        hint: "We have your order",
      },
      {
        id: "preparing",
        label: "Preparing",
        hint: "Kitchen is working on it",
      },
      {
        id: "ready",
        label: "Ready",
        hint: "Pick up when you can",
      },
      {
        id: "done",
        label: "Picked up",
        hint: "Enjoy your meal",
      },
    ];
  }
  return [
    {
      id: "received",
      label: "Received",
      hint: "We have your order",
    },
    {
      id: "preparing",
      label: "Preparing",
      hint: "Kitchen is working on it",
    },
    {
      id: "way",
      label: "On the way",
      hint: "Couriering to your address",
    },
    {
      id: "done",
      label: "Delivered",
      hint: "Enjoy your meal",
    },
  ];
}

export type OrderTrackingSnapshot = {
  steps: OrderTrackingStep[];
  /** 0–3 = current highlighted step; -1 = cancelled */
  phase: number;
  isCancelled: boolean;
};

export function getOrderTrackingSnapshot(
  status: string,
  deliveryMode: OrderDeliveryMode,
): OrderTrackingSnapshot {
  const steps = getOrderTrackingSteps(deliveryMode);
  const phase = orderStatusToPhase(status, deliveryMode);
  return {
    steps,
    phase,
    isCancelled: phase === -1,
  };
}
