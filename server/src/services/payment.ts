import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
});


export const createPaymentIntent = async (amount: number, currency: string) => {
  return await stripe.paymentIntents.create({
    amount: amount * 100,
    currency,
    payment_method_types: ["card"],
  });
};

// Function to retrieve a Payment Intent
export const getPaymentIntent = async (paymentIntentId: string) => {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
};
