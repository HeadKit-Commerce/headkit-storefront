import { Icon } from "./icon";

interface PaymentMethodMessagingProps {
  price: number;
  currency?: string;
  installments?: number;
}

export const PaymentMethodMessaging = ({ 
  price, 
  currency = "A$", 
  installments = 4 
}: PaymentMethodMessagingProps) => {
  const installmentAmount = (price / installments).toFixed(2);
  
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Icon.afterpay className="w-auto h-5" />
      <Icon.klarna className="w-auto h-5" />
      <Icon.zip className="w-auto h-5" />
      <div className="text-sm">
        {installments}-interest-free payments of {currency}{installmentAmount}
      </div>
    </div>
  );
};
