import Order from "../models/Order.js";
import Product from "../models/productModel.js";

/* ======================================================
   CREATE ORDER (AUTH USER)
====================================================== */
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      deliveryStartDate,
      deliveryEndDate,
      paymentMethod = "cod",
      items,
      totalAmount,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    /* ---------- Generate Order ID ---------- */
    const lastOrder = await Order.findOne()
      .sort({ createdAt: -1 })
      .lean();

    let newNo = 1;
    if (lastOrder?.orderId) {
      newNo = parseInt(lastOrder.orderId.split("-")[1]) + 1;
    }

    const orderId = `PLATTER-${String(newNo).padStart(3, "0")}`;

    /* ---------- Create Order ---------- */
    const order = await Order.create({
      orderId,
      user: userId,
      items,
      totalAmount,
      paymentMethod,
      deliveryStartDate,
      deliveryEndDate,
    });

    res.status(201).json({
      message: "Order placed successfully",
      orderId: order.orderId,
    });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({
      message: "Failed to place order",
      error: err.message,
    });
  }
};

/* ======================================================
   GET MY ORDERS (AUTH USER)
   ✅ includes plan + ingredients + image
====================================================== */
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const detailedItems = await Promise.all(
          order.items.map(async (item) => {
            const product = await Product.findById(item.productId).lean();

            return {
              _id: item._id,
              productId: item.productId,
              name: item.name || product?.name || "Unknown Product",

              /* ✅ PLAN */
              selectedOption: item.selectedOption || "oneTime",

              /* ✅ INGREDIENTS */
              selectedIngredients: item.selectedIngredients || [],

              quantity: item.quantity,

              price:
                item.price ??
                product?.prices?.[item.selectedOption] ??
                0,

              image: product?.img || "/placeholder.png",
              fullProduct: product || null,
            };
          })
        );

        return {
          ...order,
          items: detailedItems,
        };
      })
    );

    res.json(enrichedOrders);
  } catch (err) {
    console.error("Get my orders error:", err);
    res.status(500).json({
      message: "Failed to fetch your orders",
      error: err.message,
    });
  }
};

/* ======================================================
   GET ALL ORDERS (ADMIN)
====================================================== */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch all orders",
      error: err.message,
    });
  }
};

/* ======================================================
   GET ORDERS BY USER ID (ADMIN)
====================================================== */
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.params.userId,
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch user orders",
      error: err.message,
    });
  }
};

/* ======================================================
   UPDATE ORDER STATUS (ADMIN)
====================================================== */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "payment-success",
      "order-complete",
      "shipped",
      "delivered",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate("user", "name email");

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({
      message: "Failed to update order status",
      error: err.message,
    });
  }
};
