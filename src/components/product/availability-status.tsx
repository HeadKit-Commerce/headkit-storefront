"use client";

import { cn } from "@/lib/utils";
import { StockStatusEnum } from "@/lib/headkit/generated";
import { useEffect, useState } from "react";

enum AvailabilityStatusEnum {
  IN_STOCK = "IN_STOCK",
  LOW_STOCK = "LOW_STOCK",
  OUT_OF_STOCK = "OUT_OF_STOCK",
}

const AvailabilityStatus = ({
  stockQuantity,
  stockStatus,
}: {
  stockQuantity: number | null;
  stockStatus: StockStatusEnum;
}) => {
  const [status, setStatus] = useState<AvailabilityStatusEnum>(
    AvailabilityStatusEnum.IN_STOCK
  );

  useEffect(() => {
    const updateStatus = () => {
      if (stockQuantity === 0 || stockStatus === StockStatusEnum.OutOfStock) {
        setStatus(AvailabilityStatusEnum.OUT_OF_STOCK);
      } else if (stockQuantity !== null && stockQuantity > 0 && stockQuantity <= 3) {
        setStatus(AvailabilityStatusEnum.LOW_STOCK);
      } else {
        setStatus(AvailabilityStatusEnum.IN_STOCK);
      }
    };

    updateStatus();
  }, [stockQuantity, stockStatus]);

  const statusColor = {
    [AvailabilityStatusEnum.IN_STOCK]: "bg-lime-800",
    [AvailabilityStatusEnum.LOW_STOCK]: "bg-orange-500",
    [AvailabilityStatusEnum.OUT_OF_STOCK]: "bg-pink-800",
  }[status];

  const statusTextColor = {
    [AvailabilityStatusEnum.IN_STOCK]: "text-lime-800",
    [AvailabilityStatusEnum.LOW_STOCK]: "text-orange-500",
    [AvailabilityStatusEnum.OUT_OF_STOCK]: "text-pink-800",
  }[status];

  const statusText = {
    [AvailabilityStatusEnum.IN_STOCK]: "In Stock",
    [AvailabilityStatusEnum.LOW_STOCK]: `Only ${stockQuantity} in Stock`,
    [AvailabilityStatusEnum.OUT_OF_STOCK]: "Out of Stock",
  }[status];

  return (
    <div
      className={cn("flex items-baseline font-medium", {
        [statusTextColor]: status,
      })}
    >
      <span className={cn("relative mr-2 flex h-3 w-3")}>
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
            {
              [statusColor]: status,
            }
          )}
        ></span>
        <span
          className={cn("relative inline-flex h-3 w-3 rounded-full ", {
            [statusColor]: status,
          })}
        ></span>
      </span>
      {statusText}
    </div>
  );
};

export { AvailabilityStatus };
