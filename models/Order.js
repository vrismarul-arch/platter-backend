import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },

        name: String,
        quantity: Number,
        price: Number,

        /* ✅ PLAN */
        selectedOption: {
          type: String,
          default: "oneTime",
        },

        /* ✅ INGREDIENTS */
        selectedIngredients: [
          {
            ingredientId: String,
            name: String,
            quantity: String,
          },
        ],
      },
    ],

    deliveryStartDate: String,
    deliveryEndDate: String,

    totalAmount: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      default: "cod",
    },

    status: {
      type: String,
      default: "pending",
      enum: [
        "pending",
        "payment-success",
        "order-complete",
        "shipped",
        "delivered",
      ],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
