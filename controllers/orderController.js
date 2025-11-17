import Order from "../models/Order.js";

// CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      deliveryStartDate,
      deliveryEndDate,
      paymentMethod,
      items,
      totalAmount,
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ message: "No items in order." });
    }

    // ============================
    // 🔥 Generate Order ID
    // ============================
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });

    let newNumber = 1;

    if (lastOrder && lastOrder.orderId) {
      const lastNumber = parseInt(lastOrder.orderId.split("-")[1]);
      newNumber = lastNumber + 1;
    }

    const formattedOrderId = `PLATTER-${String(newNumber).padStart(3, "0")}`;

    // ============================
    // 🔥 Create Order
    // ============================
    const order = await Order.create({
      orderId: formattedOrderId,
      user: userId,
      items,
      totalAmount,
      paymentMethod,
      deliveryStartDate,
      deliveryEndDate,
    });

    res.status(201).json({
      message: "Order placed successfully!",
      orderId: order.orderId,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ message: "Server error while placing order." });
  }
};


// GET ALL ORDERS (NO AUTH)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders", error: err });
  }
};

// GET SINGLE USER ORDERS (NO AUTH)
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user orders", error: err });
  }
};
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowed = ["pending", "payment-success", "order-complete", "shipped", "delivered"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate("user");

    res.json(updated);

  } catch (err) {
    res.status(500).json({ message: "Failed to update status", error: err });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    res.json(orders);

  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch your orders",
      error: err,
    });
  }
};