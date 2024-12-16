import {
  Alert,
  AlertDescription,
  AlertTitle,
  alertVariants,
} from "@/components/alert-box/alert"
import { VariantProps } from "class-variance-authority";
import { HiCheckCircle, HiExclamationTriangle, HiInformationCircle, HiXCircle } from "react-icons/hi2";

export interface AlertBoxProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof alertVariants> {
    title?: string;
    children: React.ReactNode
}

export function AlertBox({variant, title, children}:AlertBoxProps) {
  return (
    <Alert variant={variant}>
        <div className="w-[24px] mr-[10px] ">
          {variant === "danger" && <HiXCircle className="w-[24px] h-[24px] fill-pink-800"/>}
          {variant === "warning" && <HiExclamationTriangle className="w-[24px] h-[24px] fill-orange-600"/>}
          {variant === "success" && <HiCheckCircle className="w-[24px] h-[24px] fill-lime-800"/>}
          {variant === "notice" && <HiInformationCircle className="w-[24px] h-[24px] fill-blue-600"/>}
        </div>
        <div>
          <AlertTitle variant={variant} className="h-[24px] flex items-center">{title}</AlertTitle>
          <AlertDescription className="mt-[15px]">
              {children}
          </AlertDescription>
        </div>
    </Alert>
  )
}
