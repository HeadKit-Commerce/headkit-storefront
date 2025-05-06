"use server";

import { cookies } from "next/headers";
import { CheckoutInput } from "@/lib/headkit/generated";

export async function getCheckoutData() {
  const cookieStore = await cookies();
  return cookieStore.get("checkoutData");
}

export async function setCheckoutData(data: CheckoutInput) {
  const cookieStore = await cookies();
  cookieStore.set("checkoutData", JSON.stringify(data));
}

export async function deleteCheckoutData() {
  const cookieStore = await cookies();
  cookieStore.delete("checkoutData");
} 