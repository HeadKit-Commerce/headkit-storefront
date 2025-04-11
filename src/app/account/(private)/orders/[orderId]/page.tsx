import { getOrder } from "@/lib/headkit/actions";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ orderId: string }>;
}

export default async function Page({ params }: Props) {
  const { orderId } = await params;

  if (!orderId) {
    return notFound();
  }

  const response = await getOrder({ id: orderId });
  const order = response.data?.order;

  if (!order) {
    return notFound();
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Order #{order.databaseId}</h1>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h2 className="font-medium mb-2">Order Date</h2>
              <p className="text-gray-600">{new Date(order?.date || "").toLocaleDateString()}</p>
            </div>
            <div>
              <h2 className="font-medium mb-2">Status</h2>
              {/* <p className="text-gray-600">{order?.}</p> */}
            </div>
            <div>
              <h2 className="font-medium mb-2">Total</h2>
              <p className="text-gray-600">{order.total}</p>
            </div>
            <div>
              <h2 className="font-medium mb-2">Payment Method</h2>
              {/* <p className="text-gray-600">{order?.}</p> */}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="font-medium mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.lineItems?.nodes.map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">{item.product?.node.name}</p>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
                <p className="font-medium">{item.total}</p>
              </div>
            ))}
          </div>
        </div>

        {(order.shipping || order.billing) && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {order.shipping && (
                <div>
                  <h2 className="font-medium mb-4">Shipping Address</h2>
                  <address className="text-gray-600 not-italic">
                    {order.shipping.firstName} {order.shipping.lastName}<br />
                    {order.shipping.address1}<br />
                    {order.shipping.address2 && <>{order.shipping.address2}<br /></>}
                    {order.shipping.city}, {order.shipping.state} {order.shipping.postcode}<br />
                    {order.shipping.country}
                  </address>
                </div>
              )}
              {order.billing && (
                <div>
                  <h2 className="font-medium mb-4">Billing Address</h2>
                  <address className="text-gray-600 not-italic">
                    {order.billing.firstName} {order.billing.lastName}<br />
                    {order.billing.address1}<br />
                    {order.billing.address2 && <>{order.billing.address2}<br /></>}
                    {order.billing.city}, {order.billing.state} {order.billing.postcode}<br />
                    {order.billing.country}
                  </address>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 