import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import {
  currencyFormatter,
  formatShippingPrice,
  getFloatVal,
  getPaymentMethodDisplay,
} from "@/lib/utils";
import { CartItem } from "@/components/layout/cart-item";
import { ClearCart } from "@/components/checkout/clear-cart";
import { getOrder } from "@/lib/headkit/actions";

interface Props {
  params: Promise<{
    orderId: string;
  }>;
}

export async function generateMetadata(
  { },
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

  const response = await getOrder({ id: orderId });
  const order = response?.data?.order;

  if (!order) {
    return notFound();
  }

  const isSingleCheckout = !!order?.metaData?.find(meta =>
    meta?.key === "_single_checkout"
  );

  const paymentMethod = getPaymentMethodDisplay(order?.metaData as { key: string; value: string }[]);

  const initLang = "en-AU";
  const initCurrency = "AUD";

  return (
    <>
      {order && <ClearCart singleCheckout={isSingleCheckout} />}
      <div className="grid grid-cols-12 gap-x-1 gap-y-5 md:gap-8 mt-5 px-5 md:px-10">
        <div className="col-span-12 w-full">
          <h1 className="font-bold text-3xl mb-[10px] text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
            Thanks, {order?.billing?.firstName || order?.shipping?.firstName}!
          </h1>
        </div>
        <div className="col-span-12 md:col-span-7 grid grid-cols-7">
          <div className="col-span-12 md:col-start-1 md:col-span-5">
            <div className="mb-10">
              <p className="font-extrabold text-3xl">
                Your order is confirmed.
              </p>
              <p className="text-lg">
                You will receive a confirmation email shortly.
              </p>
              <br />
              <p className="font-bold text-2xl">Order #{order?.databaseId}</p>
            </div>

            <div className="text-xl">
              <div className="grid grid-cols-4 md:grid-cols-3 mb-5 items-baseline gap-1 md:gap-4 font-medium text-lg  mt-[8px]">
                <div className="col-span-1">
                  <div className="font-extrabold">Contact</div>
                </div>
                <div className="col-span-3 md:col-span-2">{order?.billing?.email}</div>
              </div>

              {order?.shipping?.address1 && (
                <div className="grid grid-cols-4 md:grid-cols-3 mb-5 items-baseline gap-1 md:gap-4 font-medium text-lg  mt-[8px]">
                  <div className="col-span-1">
                    <div className="font-extrabold">Shipping Address</div>
                  </div>
                  <div className="col-span-3 md:col-span-2">
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
              <div className="grid grid-cols-4 md:grid-cols-3 mb-5 items-baseline gap-1 md:gap-4 font-medium text-lg  mt-[8px]">
                <div className="col-span-1">
                  <div className="font-extrabold">Shipping Options</div>
                </div>
                <div className="col-span-3 md:col-span-2">
                  {`${order?.shippingLines?.nodes?.[0]?.methodTitle ||
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


              <div className="grid grid-cols-4 md:grid-cols-3 mb-5 items-baseline gap-1 md:gap-4 font-medium text-lg  mt-[8px]">
                <div className="col-span-1">
                  <div className="font-extrabold">Billing Address</div>
                </div>
                <div className="col-span-3 md:col-span-2">
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
                  {order?.billing?.phone}
                </div>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-3 mb-5 items-baseline gap-1 md:gap-4 font-medium text-lg  mt-[8px]">
                <div className="col-span-1">
                  <div className="font-extrabold">Payment</div>
                </div>
                <div className="col-span-3 md:col-span-2">
                  {currencyFormatter({
                    price: getFloatVal(order?.total || "0"),
                    lang: initLang,
                    currency: order?.currency || initCurrency,
                  })}
                  <br />
                  {paymentMethod && (
                    <div className="flex items-start flex-col gap-1 truncate">
                      {paymentMethod.icon}
                      {paymentMethod.text}
                    </div>
                  )}
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
                        src: lineItem?.variation ? lineItem?.variation?.node?.image?.sourceUrl || "" : lineItem?.product?.node?.image?.sourceUrl || "",
                        alt: lineItem?.variation ? lineItem?.variation?.node?.image?.altText || "" : lineItem?.product?.node?.image?.altText || "",
                      },
                      name: lineItem?.variation ? lineItem?.variation?.node?.name || "" : lineItem?.product?.node?.name || "",
                    }}
                    priceIncludeTax={!!order?.pricesIncludeTax}
                  />
                ))}
            </div>

            {order && (
              <>
                <div className="flex gap-4 justify-between font-medium  ">
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
                    <div className="flex gap-4 justify-between font-medium   mt-[8px]">
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
                <div className="flex gap-4 justify-between font-medium   mt-[8px]">
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
                  <div className="flex gap-4 justify-between font-medium   mt-[8px]">
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
                    <p className="font-medium  ">
                      Total
                    </p>
                    <p className="text-[13px]  -mt-2">
                      {order?.pricesIncludeTax &&
                        order?.totalTax &&
                        `Includes ${currencyFormatter({
                          price: getFloatVal(order?.totalTax || "0"),
                          currency: order.currency || "AUD",
                        })} in Tax`}
                    </p>
                  </div>
                  <div className="text-right font-medium  ">
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
