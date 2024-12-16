import { ReactNode } from "react";

interface Props {
  text: string;
  icon: ReactNode;
  iconPosition: "left" | "right";
}
const TextWithIcon = ({ text, icon, iconPosition }: Props) => {
  return (
    <div className="flex items-center gap-2 text-purple-800">
      {iconPosition === "left" && icon}
      {text}
      {iconPosition === "right" && icon}
    </div>
  );
};

export { TextWithIcon };
