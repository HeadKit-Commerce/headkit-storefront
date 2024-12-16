import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "../common/section-header";
import { ProductCarousel } from "../carousel/product-carousel";
import { ProcessedGroup } from "@/lib/headkit/utils/process-block-editor";

interface Props {
  blocks: ProcessedGroup[];
  section?: string;
}
const BlockEditor = ({ blocks, section = "section-1" }: Props) => {
  const result = blocks?.filter((block) => block.section === section);
  return (
    <>
      {result &&
        result.map((data: ProcessedGroup, index: number) => {
          switch (data.cssClassNames[0]) {
            case "headkit-hilight":
              return (
                <AboutUs
                  key={index}
                  title={data.content.title}
                  content={data.content.description}
                  buttonText={data.content.button?.text}
                  buttonLink={data.content.button?.url}
                  buttonTarget={data.content.button?.linkTarget}
                />
              );
            case "headkit-product-carousel":
              return (
                <div
                  className="overflow-hidden bg-gradient-to-t from-silver-3 to-white py-[30px] lg:py-14"
                  key={index}
                >
                  <div className="container mx-auto !overflow-visible">
                    <SectionHeader
                      title={data.content.title}
                      description={data.content.description}
                      allButton={data.content.button?.text ?? ""}
                      allButtonPath={data.content.button?.url ?? ""}
                    />

                    <div className="mt-5 px-5 lg:mt-[30px] !overflow-visible">
                      <ProductCarousel
                        products={data.content.products?.nodes ?? []}
                      />
                    </div>
                  </div>

                  <div className="container mx-auto px-5 mt-7">
                    <Link
                      href={data.content.button?.url || "#"}
                      target={data.content.button?.linkTarget ?? ""}
                      className="lg:hidden"
                    >
                      <Button rightIcon="arrowRight" fullWidth>
                        {data.content.button?.text}
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            default:
              return null;
          }
        })}
    </>
  );
};

interface AboutUsProps {
  title: string;
  content: string;
  buttonText?: string;
  buttonLink?: string;
  buttonTarget?: string;
}

const AboutUs = ({
  title,
  content,
  buttonText,
  buttonLink,
  buttonTarget,
}: AboutUsProps) => {
  return (
    <div className="container relative grid h-fit w-full grid-cols-1 gap-8 px-[20px] py-14 md:grid-cols-3 md:px-[40px]">
      <div className="md:col-span-2">
        <h1 className="mb-5 text-3xl font-semibold">{title}</h1>
        <div
          dangerouslySetInnerHTML={{ __html: content }}
          className="prose text-purple-800 max-w-full"
        />
      </div>

      <div className="flex items-center">
        <a
          href={buttonLink || "#"}
          target={buttonTarget ?? ""}
          className="w-full"
        >
          <Button variant="secondary" rightIcon="arrowRight" fullWidth>
            {buttonText}
          </Button>
        </a>
      </div>
    </div>
  );
};

export { BlockEditor };
