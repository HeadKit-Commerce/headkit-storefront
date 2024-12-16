import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  isUnavailable: boolean;
  selectedOptionValue: string;
  onClick: (value: { label: string; value: string }) => void;
}
const VariantButton = ({
  label,
  value,
  isUnavailable,
  selectedOptionValue,
  onClick,
}: Props) => {
  return (
    <button
      onClick={() => {
        onClick({
          label,
          value,
        });
      }}
      className={cn(
        "relative h-8 rounded-md border px-[10px] py-1 text-center outline outline-2 -outline-offset-1 hover:outline-purple-500",
        isUnavailable ? "border-gray-500 text-gray-500" : "border-gray-700",
        selectedOptionValue === value
          ? "font-semibold outline-purple-800"
          : "outline-transparent"
      )}
    >
      {label}
      {isUnavailable && (
        <svg className="absolute left-1/2 top-1/2 h-[95%] w-[95%] -translate-x-1/2 -translate-y-1/2 transform">
          <line
            x1="0"
            y1="100%"
            x2="100%"
            y2="0"
            className="stroke-gray-500 stroke-1"
          />
        </svg>
      )}
    </button>
  );
};

export { VariantButton };
