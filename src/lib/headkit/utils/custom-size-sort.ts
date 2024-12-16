import { Maybe, ProductAttributeOption } from "../generated";

const sizeTemplate = [
  "x-small",
  "small",
  "small-medium",
  "medium",
  "medium-large",
  "large",
  "x-large",
  "xx-large",
  "large-x-large",
  "x-large-xx-large",
  "xxxx-large",
];

const customSizeSort = (
  a: Maybe<ProductAttributeOption>,
  b: Maybe<ProductAttributeOption>
) => {
  const indexA = sizeTemplate.indexOf(a?.slug || "");
  const indexB = sizeTemplate.indexOf(b?.slug || "");

  if (indexA === -1) return 1; // If not found in sizeTemplate, move to the end
  if (indexB === -1) return -1; // If not found in sizeTemplate, move to the end

  return indexA - indexB;
};

export { customSizeSort };
