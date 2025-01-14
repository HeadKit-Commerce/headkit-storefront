import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

interface Props {
  isSale?: boolean;
  isNewIn?: boolean;
}

const BadgeList = ({ isNewIn, isSale }: Props) => {
  const badgeStyle = cva(
    "outline rounded-[6px] uppercase font-semibold text-center px-2 py-1",
    {
      variants: {
        variant: {
          new: "bg-lime-400 outline-lime-400/50 text-purple-800",
          sale: "bg-pink-500 outline-pink-500/50 text-white",
        },
      },
    }
  );

  return (
    <div className="relative flex gap-2 justify-start">
      {isSale && (
        <div className={cn(badgeStyle({ variant: "sale" }))}>Sale</div>
      )}
      {isNewIn && <div className={cn(badgeStyle({ variant: "new" }))}>New</div>}
    </div>
  );
};

export { BadgeList };
