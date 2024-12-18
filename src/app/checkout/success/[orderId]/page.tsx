import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { getCustomer } from "@/lib/headkit/actions";
import {
  currencyFormatter,
  formatShippingPrice,
  getFloatVal,
} from "@/lib/utils";
import { CartItem } from "@/components/layout/cart-item";
import { ClearCart } from "@/components/checkout/clear-cart";

interface Props {
  params: Promise<{
    orderId: string;
  }>;
}

export async function generateMetadata(
  {},
  parent: ResolvingMetadata
): Promise<Metadata> {
  const getParent = await parent;
  return {
    title: getParent?.title,
    description: getParent?.description,
  };
}

export default async function Page({ params }: Props) {
  const { orderId } = await params;

  if (!orderId) {
    return notFound();
  }

  const customer = await getCustomer({
    withAddress: true,
    withOrders: true,
  });

  const order = customer?.data?.customer?.orders?.nodes?.find(
    (order) => order.databaseId === Number(orderId)
  );

  if (!order) {
    return notFound();
  }

  console.log("order", order);

  // const getPaymentMethod = (order: Order) => {
  //   if (!order?.metaData) return;

  //   const stripePaymentData = order.metaData.find(
  //     (item) => item?.key === "_stripe_payment_method"
  //   );

  //   if (stripePaymentData) {
  //     return getStripePaymentInfo(
  //       JSON.parse(stripePaymentData.value) as Stripe.PaymentMethod
  //     );
  //   }

  //   const paypalOrderId = order.metaData.find(
  //     (item) => item?.key === "_ppcp_paypal_order_id"
  //   );

  //   if (paypalOrderId) {
  //     return { icon: "Paypal" };
  //   }
  // };

  // const paymentMethod = getPaymentMethod(order as Order);

  const initLang = "en";
  const initCurrency = "USD";

  return (
    <>
      <ClearCart />
      <div className="grid grid-cols-12 gap-8 mt-5 px-[10px] sm:px-[20px] pb-5">
        <div className="col-span-12 relative bg-gradient-to-t from-black to-purple-900 rounded-[20px] overflow-hidden">
          <div className="relative z-10 px-8 py-20 md:px-20 md:py-24">
            <div className="font-semibold text-2xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
              Thanks
            </div>
            <div className="font-semibold text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 pb-4">
              {order?.billing?.firstName || order?.shipping?.firstName}!
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-7 grid grid-cols-7">
          <div className="col-span-12 md:col-start-2 md:col-span-5">
            <div className="mb-10">
              <p className="font-extrabold text-3xl">
                Your order is confirmed.
              </p>
              <p className="text-lg">
                You will receive a confirmation email shortly.
              </p>
              <br />
              <p className="font-bold text-2xl">Order #{order.databaseId}</p>
            </div>

            <div className="text-xl">
              <div className="grid grid-cols-3 mb-5 items-baseline gap-4 font-medium text-lg  mt-[8px]">
                <div className="col-span-1">
                  <div className="font-extrabold">Contact</div>
                </div>
                <div className="col-span-2">{order?.billing?.email}</div>
              </div>

              {order?.shipping?.address1 && (
                <div className="grid grid-cols-3 mb-5 items-baseline gap-4 font-medium text-lg  mt-[8px]">
                  <div className="col-span-1">
                    <div className="font-extrabold">Shipping Address</div>
                  </div>
                  <div className="col-span-2">
                    {order?.shipping?.firstName} {order?.shipping?.lastName}
                    <br />
                    {order?.shipping?.address1}
                    <br />
                    {order?.shipping?.address2}
                    {order?.shipping?.address2 && <br />}
                    {`${order?.shipping?.city} ${order?.shipping?.state} ${order?.shipping?.postcode}`}
                    <br />
                    {order?.shipping?.country}
                    <br />
                    {order?.shipping?.phone}
                  </div>
                </div>
              )}
              {order?.needsShippingAddress && (
                <div className="grid grid-cols-3 mb-5 items-baseline gap-4 font-medium text-lg  mt-[8px]">
                  <div className="col-span-1">
                    <div className="font-extrabold">Shipping Options</div>
                  </div>
                  <div className="col-span-2">
                    {`${
                      order?.shippingLines?.nodes?.[0]?.methodTitle ||
                      "Shipping"
                    } / ${formatShippingPrice(
                      order.shippingTotal || "0",
                      order.shippingTax || "0",
                      !!order.pricesIncludeTax,
                      order.currency || initCurrency,
                      initLang
                    )}`}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 mb-5 items-baseline gap-4 font-medium text-lg  mt-[8px]">
                <div className="col-span-1">
                  <div className="font-extrabold">Billing Address</div>
                </div>
                <div className="col-span-2">
                  {order?.billing?.firstName} {order?.billing?.lastName}
                  <br />
                  {order?.billing?.address1}
                  <br />
                  {order?.billing?.address2}
                  {order?.billing?.address2 && <br />}
                  {`${order?.billing?.city} ${order?.billing?.state} ${order?.billing?.postcode}`}
                  <br />
                  {order?.billing?.country}
                  <br />
                  {/* {order?.billing?.phone} */}
                </div>
              </div>
              <div className="grid grid-cols-3 mb-5 items-baseline gap-4 font-medium text-lg  mt-[8px]">
                <div className="col-span-1">
                  <div className="font-extrabold">Payment</div>
                </div>
                <div className="col-span-2">
                  {currencyFormatter({
                    price: getFloatVal(order?.total || "0"),
                    lang: initLang,
                    currency: order?.currency || initCurrency,
                  })}
                  <br />
                  {/* TODO refactor */}
                  {/* {paymentMethod?.icon in MAP_ALL_STRIPE_PAYMENT_TO_ICON ? (
                  <div className="flex items-center gap-[6px]">
                    <Icon
                      mask
                      icon={
                        MAP_ALL_STRIPE_PAYMENT_TO_ICON?.[paymentMethod?.icon]
                      }
                      className="w-[20px] h-[20px] bg-black-4"
                    />
                    {paymentMethod?.last4 && `ending ${paymentMethod?.last4}`}
                  </div>
                ) : (
                  <div>{paymentMethod?.icon}</div>
                )} */}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4">
          <>
            <div className="space-y-5 mb-10">
              {order &&
                order?.lineItems?.nodes?.map((lineItem, i) => (
                  <CartItem
                    key={i}
                    type="order"
                    orderData={{
                      quantity: lineItem.quantity || 0,
                      image: {
                        src: lineItem?.product?.node?.image?.sourceUrl || "",
                        alt: lineItem?.product?.node?.image?.altText || "",
                      },
                      name: lineItem?.product?.node?.name || "",
                    }}
                    priceIncludeTax={!!order?.pricesIncludeTax}
                  />
                ))}
            </div>

            {order && (
              <>
                <div className="flex gap-4 justify-between font-medium text-body3 text-black-1">
                  <p>Subtotal</p>
                  <p>
                    {currencyFormatter({
                      price:
                        order?.lineItems?.nodes?.reduce((accumulator, item) => {
                          if (order?.pricesIncludeTax) {
                            return (
                              accumulator +
                              getFloatVal(item?.subtotal || "0") +
                              getFloatVal(item?.subtotalTax || "0")
                            );
                          } else {
                            return (
                              accumulator + getFloatVal(item?.subtotal || "0")
                            );
                          }
                        }, 0) || 0,
                      currency: order.currency || "AUD",
                    })}
                  </p>
                </div>
                {order?.discountTotal &&
                  getFloatVal(order?.discountTotal || "0") != 0 && (
                    <div className="flex gap-4 justify-between font-medium text-body3 text-black-1 mt-[8px]">
                      <p>Discount</p>
                      <p>
                        -
                        {currencyFormatter({
                          price: order?.pricesIncludeTax
                            ? getFloatVal(order?.discountTotal || "0") +
                              getFloatVal(order?.discountTax || "0")
                            : getFloatVal(order?.discountTotal || "0"),
                          currency: order.currency || "AUD",
                        })}
                      </p>
                    </div>
                  )}
                <div className="flex gap-4 justify-between font-medium text-body3 text-black-1 mt-[8px]">
                  <p>Shipping</p>
                  <p>
                    {order?.pricesIncludeTax
                      ? getFloatVal(order?.shippingTotal || "0") +
                          getFloatVal(order?.shippingTax || "0") ===
                        0
                        ? "Free"
                        : currencyFormatter({
                            price:
                              getFloatVal(order?.shippingTotal || "0") +
                              getFloatVal(order?.shippingTax || "0"),
                            currency: order.currency || "AUD",
                          })
                      : getFloatVal(order?.shippingTotal || "0") === 0
                      ? "Free"
                      : currencyFormatter({
                          price: getFloatVal(order?.shippingTotal || "0"),
                          currency: order.currency || "AUD",
                        })}
                  </p>
                </div>
                {!order?.pricesIncludeTax && (
                  <div className="flex gap-4 justify-between font-medium text-body3 text-black-1 mt-[8px]">
                    <p>Tax</p>
                    <p>
                      {currencyFormatter({
                        price: getFloatVal(order?.totalTax || "0"),
                        currency: order.currency || "AUD",
                      })}
                    </p>
                  </div>
                )}
                <div className="flex gap-4 justify-between text-xl mt-[20px]">
                  <div>
                    <p className="uppercase font-medium text-body2 text-black-1">
                      Total
                    </p>
                    <p className="text-[13px] text-black-4 -mt-2">
                      {order?.pricesIncludeTax &&
                        order?.totalTax &&
                        `Includes ${currencyFormatter({
                          price: getFloatVal(order?.totalTax || "0"),
                          currency: order.currency || "AUD",
                        })} in Tax`}
                    </p>
                  </div>
                  <div className="text-right font-medium text-body2 text-black-1">
                    <p>
                      {currencyFormatter({
                        price: getFloatVal(order?.total || "0"),
                        currency: order.currency || "AUD",
                      })}
                    </p>
                  </div>
                </div>
              </>
            )}
          </>
        </div>
      </div>
    </>
  );
}
