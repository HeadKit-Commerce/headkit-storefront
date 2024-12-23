import { UseFormReturn } from "react-hook-form";
import { FormControl, FormItem } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { VariantSwatch } from "@/components/product/product-variations/variant-swatch";
import { FilterValues } from "./types";

interface Props {
  form: UseFormReturn<FilterValues>;
  attribute: {
    slug?: string | null;
    label?: string | null;
    choices?: Array<{
      slug?: string | null;
      name?: string | null;
      options?: Array<string | null> | null;
    } | null> | null;
  } | null;
}

export const AttributeFilter = ({ form, attribute }: Props) => {
  if (!attribute?.slug) return null;

  return (
    <FormItem className="grid grid-cols-2 gap-4">
      {attribute.choices?.map((option, index) => (
        <FormControl key={index}>
          <label className="flex items-center space-x-2">
            {attribute.slug === 'pa_colour' ? (
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={form.watch(`attributes.${attribute.slug}`)?.includes(option?.slug || "")}
                  onCheckedChange={(checked) => {
                    const value = option?.slug || "";
                    const currentValues = form.getValues(`attributes.${attribute.slug}`) || [];
                    const newValue = checked
                      ? [...currentValues, value]
                      : currentValues.filter((v) => v !== value);
                    form.setValue(`attributes.${attribute.slug}`, newValue);
                  }}
                  hidden
                />
                <VariantSwatch
                  color1={option?.options?.[0] || ""}
                  color2={option?.options?.[1] || ""}
                  label={option?.name || ""}
                  value={option?.slug || ""}
                  selectedOptionValue={
                    form.watch(`attributes.${attribute.slug}`)?.includes(option?.slug || "")
                      ? option?.slug || ""
                      : undefined
                  }
                />
              </label>
            ) : (
              <Checkbox
                checked={form.watch(`attributes.${attribute.slug}`)?.includes(option?.slug || "")}
                onCheckedChange={(checked) => {
                  const value = option?.slug || "";
                  const currentValues = form.getValues(`attributes.${attribute.slug}`) || [];
                  const newValue = checked
                    ? [...currentValues, value]
                    : currentValues.filter((v) => v !== value);
                  form.setValue(`attributes.${attribute.slug}`, newValue);
                }}
              />
            )}
            <span className="text-sm cursor-pointer">
              {option?.name}
            </span>
          </label>
        </FormControl>
      ))}
    </FormItem>
  );
}; 