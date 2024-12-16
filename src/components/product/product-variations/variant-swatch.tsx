import { addAlphaToHex, cn } from "@/lib/utils";


interface Props {
  label: string;
  value: string;
  isUnavailable?: boolean;
  selectedOptionValue?: string;
  onClick?: (value: { label: string; value: string }) => void;
  onMouseEnter?: (value: { label: string; value: string }) => void;
  color1: string;
  color2?: string;
  size?: "default" | "small";
}
const VariantSwatch = ({
  label,
  value,
  isUnavailable,
  selectedOptionValue,
  onClick,
  onMouseEnter,
  color1,
  color2,
  size = "default",
}: Props) => {
  const color1Formatted = isUnavailable ? addAlphaToHex(color1, 0.5) : color1;
  const color2Formatted = color2
    ? isUnavailable
      ? addAlphaToHex(color2, 0.5)
      : color2
    : null;
  const colorStyle = color2Formatted
    ? {
        background: `linear-gradient( 90deg, ${color1Formatted}, ${color1Formatted} 50%, ${color2Formatted} 51% )`,
      }
    : { backgroundColor: color1Formatted };
  return (
    <button
      onMouseEnter={() => {
        if (onMouseEnter) {
          onMouseEnter({
            label,
            value,
          });
        }
      }}
      onClick={() => {
        if (onClick) {
          onClick({
            label,
            value,
          });
        }
      }}
      className={cn(
        "relative cursor-pointer rounded-full border outline  hover:outline-purple-500",
        size === "default"
          ? "h-6 w-6 outline-2 outline-offset-1"
          : "h-4 w-4 outline-1 outline-offset-1",
        isUnavailable ? "border-gray-500" : "border-gray-700",
        selectedOptionValue === value
          ? "outline-purple-800"
          : "outline-transparent"
      )}
      style={colorStyle}
    >
      {isUnavailable && (
        <div className="absolute left-1/2 top-0 h-full w-[1px] -translate-x-1/2 rotate-45 transform bg-gray-500" />
      )}
    </button>
  );
};

export { VariantSwatch };
