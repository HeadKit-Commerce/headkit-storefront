import Image from "next/image";

interface Props {
  text: string;
  image?: string;
  highlightedText?: string;
}

const FeaturedImageHeader = ({ text, highlightedText, image }: Props) => {
  return (
    <div className="px-[10px] sm:px-[20px]">
      <div className="relative flex min-h-[370px] items-center md:min-h-[450px] rounded-[20px] overflow-hidden">
          <Image
            src={image || "/assets/images/bg-order-success.png"}
            alt="store"
            fill={true}
            style={{objectFit: 'cover'}}
            className="z-0 object-cover object-center"
          />
          <div className="absolute left-0 top-0 h-full w-full bg-linear-to-r from-[#0B050F] to-[#FFFFFF00] opacity-75"></div>
          <div className="relative mx-auto overflow-hidden">
            <div className="relative z-10 px- grid grid-cols-12 px-[10px] sm:px-[20px]">
              <div className="col-start-2 col-span-4">
                <h1 className="text-3xl font-bold leading-10 text-white">
                  {text}
                </h1>
                <div className="text-2xl mt-5 text-white">{highlightedText}</div>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export { FeaturedImageHeader };
