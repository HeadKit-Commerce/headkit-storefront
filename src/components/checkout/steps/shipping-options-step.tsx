"use client";

import { useCallback, useEffect, useState } from "react";
import { Cart, ShippingRate } from "@/lib/headkit/generated";
import { useAppContext } from "@/contexts/app-context";
import { Button } from "@/components/ui/button";
import { updateShippingMethod } from "@/lib/headkit/actions";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { currencyFormatter } from "@/lib/utils";

interface Props {
  onNext: (data: {
    shippingMethod: string;
    shippingRate: ShippingRate | undefined;
  }) => void;
  buttonLabel: string;
  defaultValues?: never;
}

export const ShippingOptionsStep = ({ onNext, buttonLabel }: Props) => {
  const { cartData, setCartData } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [activeMethod, setActiveMethod] = useState<null | string>(null);
  const [shippingRates, setShippingRates] = useState<Array<ShippingRate>>();

  // Filter out local pickup methods since this is for shipping only
  const checkShippings = cartData?.availableShippingMethods?.find(
    (shipping) => {
      return shipping?.rates?.some(
        (rate) =>
          rate?.methodId !== "local_pickup" &&
          rate?.methodId !== "pickup_location"
      );
    }
  );

  useEffect(() => {
    const newShippingRates: Array<ShippingRate> = [];
    cartData?.availableShippingMethods?.forEach((shipping) =>
      shipping?.rates
        ?.filter(
          (rate) =>
            rate?.methodId !== "local_pickup" &&
            rate?.methodId !== "pickup_location"
        )
        .forEach((rate) => newShippingRates.push(rate as ShippingRate))
    );

    const sortedNewShippingRates = newShippingRates.sort((a, b) => {
      if (a.id === "advanced_free_shipping") return -1;
      if (b.id === "advanced_free_shipping") return 1;
      return 0;
    });
    setShippingRates(sortedNewShippingRates);
  }, [cartData]);

  useEffect(() => {
    if ((cartData?.chosenShippingMethods?.length ?? 0) > 0) {
      setActiveMethod(cartData?.chosenShippingMethods?.[0] ?? null);
    }
  }, [cartData?.chosenShippingMethods]);

  const handleUpdateShippingMethod = useCallback(async (id: string) => {
    console.log("handleUpdateShippingMethod: id", id);
    setIsLoading(true);
    setActiveMethod(id);
    const cartData = await updateShippingMethod({
      shippingMethod: id,
    });
    console.log("cartData", cartData);
    setCartData(cartData?.data.updateShippingMethod?.cart as Cart);
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeMethod) {
      const selectedRate = shippingRates?.find(
        (rate) => rate.id === activeMethod
      );
      onNext({
        shippingMethod: activeMethod,
        shippingRate: selectedRate,
      });
    }
  };

  if (!shippingRates) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {checkShippings ? (
        <div className="relative grid grid-cols-1 gap-3">
          <RadioGroup
            defaultValue={
              cartData?.chosenShippingMethods?.[0] ??
              checkShippings?.rates?.[0]?.id
            }
            onValueChange={(value) => {
              const method = shippingRates?.find((m) => m.id === value);
              if (method) handleUpdateShippingMethod(value);
            }}
          >
            <div className="space-y-2">
              {shippingRates.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent"
                >
                  <div className="flex items-center gap-x-2">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <label
                      htmlFor={method.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {method.label}
                    </label>
                  </div>
                  <span className="text-muted-foreground">
                    {currencyFormatter({
                      price: Number(
                        cartData?.displayPricesIncludeTax
                          ? method?.cost
                          : Number(method?.cost ?? 0) + Number(method?.tax ?? 0)
                      ),
                      currency: "AUD",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </RadioGroup>
          {isLoading && (
            <div className="absolute inset-0 white/50 flex items-center justify-center">
              <div className="flex gap-3 items-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            </div>
          )}
        </div>
      ) : (
        <p>Sorry, shipping not currently available on this item</p>
      )}

      <Button type="submit" disabled={!activeMethod || isLoading} className="w-full" rightIcon="arrowRight">
        {buttonLabel}
      </Button>
    </form>
  );
};
