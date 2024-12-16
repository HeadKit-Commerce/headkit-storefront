import { IconBaseProps } from "react-icons";
import { LogoSvg } from "./svg/logo-svg";
import { LoadingSvg } from "./svg/loading-svg";
import {
  HiArrowSmallDown,
  HiArrowSmallRight,
  HiOutlineMinus,
  HiOutlinePlus,
  HiOutlineShoppingBag,
  HiOutlineTruck,
  HiOutlineXMark,
} from "react-icons/hi2";
import {
  FaFacebook,
  FaInstagram,
  FaDiscord,
  FaLinkedin,
  FaYoutube,
  FaCcVisa,
  FaCcMastercard,
} from "react-icons/fa";
import { HeadkitMonoSvg } from "./svg/headkit-mono-svg";

type IconProps = IconBaseProps;

const Icon = {
  // branding
  logo: (props: IconProps) => <LogoSvg {...props} />,
  brandmark: (props: IconProps) => <HeadkitMonoSvg {...props} />,

  // social
  facebook: (props: IconProps) => <FaFacebook {...props} />,
  instagram: (props: IconProps) => <FaInstagram {...props} />,
  discord: (props: IconProps) => <FaDiscord {...props} />,
  linkedin: (props: IconProps) => <FaLinkedin {...props} />,
  youtube: (props: IconProps) => <FaYoutube {...props} />,

  // payment
  visa: (props: IconProps) => <FaCcVisa {...props} />,
  mastercard: (props: IconProps) => <FaCcMastercard {...props} />,

  // misc
  loading: (props: IconProps) => <LoadingSvg {...props} />,
  arrowRight: (props: IconProps) => <HiArrowSmallRight {...props} />,
  arrowDown: (props: IconProps) => <HiArrowSmallDown {...props} />,
  truck: (props: IconProps) => <HiOutlineTruck {...props} />,
  shoppingBag: (props: IconProps) => <HiOutlineShoppingBag {...props} />,
  minus: (props: IconProps) => <HiOutlineMinus {...props} />,
  plus: (props: IconProps) => <HiOutlinePlus {...props} />,
  close: (props: IconProps) => <HiOutlineXMark {...props} />,
};

type IconType = keyof typeof Icon;

export { Icon, type IconType };
