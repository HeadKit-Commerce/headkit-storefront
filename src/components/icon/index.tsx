import { IconBaseProps } from "react-icons";
import { LogoSvg } from "./svg/logo-svg";
import { LoadingSvg } from "./svg/loading-svg";
import {
  HiBars3,
  HiHeart,
  HiOutlineArrowSmallDown,
  HiOutlineArrowSmallRight,
  HiOutlineCheck,
  HiOutlineChevronDown,
  HiOutlineHeart,
  HiOutlineMagnifyingGlass,
  HiOutlineMinus,
  HiOutlinePlus,
  HiOutlineShoppingBag,
  HiOutlineTrash,
  HiOutlineTruck,
  HiOutlineUser,
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
  FaCcStripe,
  FaGooglePay,
  FaApplePay,
  FaPaypal,
  FaCcAmex,
  FaGithub,
} from "react-icons/fa";
import { BrandmarkSvg } from "./svg/brandmark-svg";
import { HeadkitMonoSvg } from "./svg/headkit-mono-svg";

type IconProps = IconBaseProps;

const Icon = {
  // branding
  logo: (props: IconProps) => <LogoSvg {...props} />,
  monoLogo: (props: IconProps) => <HeadkitMonoSvg {...props} />,
  brandmark: (props: IconProps) => <BrandmarkSvg {...props} />,

  // social
  facebook: (props: IconProps) => <FaFacebook {...props} />,
  instagram: (props: IconProps) => <FaInstagram {...props} />,
  discord: (props: IconProps) => <FaDiscord {...props} />,
  linkedin: (props: IconProps) => <FaLinkedin {...props} />,
  youtube: (props: IconProps) => <FaYoutube {...props} />,
  github: (props: IconProps) => <FaGithub {...props} />,

  // payment
  visa: (props: IconProps) => <FaCcVisa {...props} />,
  mastercard: (props: IconProps) => <FaCcMastercard {...props} />,
  stripe: (props: IconProps) => <FaCcStripe {...props} />,
  googlePay: (props: IconProps) => <FaGooglePay {...props} />,
  applePay: (props: IconProps) => <FaApplePay {...props} />,
  paypal: (props: IconProps) => <FaPaypal {...props} />,
  amex: (props: IconProps) => <FaCcAmex {...props} />,

  // misc
  loading: (props: IconProps) => <LoadingSvg {...props} />,
  arrowRight: (props: IconProps) => <HiOutlineArrowSmallRight {...props} />,
  arrowDown: (props: IconProps) => <HiOutlineArrowSmallDown {...props} />,
  truck: (props: IconProps) => <HiOutlineTruck {...props} />,
  shoppingBag: (props: IconProps) => <HiOutlineShoppingBag {...props} />,
  minus: (props: IconProps) => <HiOutlineMinus {...props} />,
  plus: (props: IconProps) => <HiOutlinePlus {...props} />,
  close: (props: IconProps) => <HiOutlineXMark {...props} />,
  check: (props: IconProps) => <HiOutlineCheck {...props} />,
  hamburger: (props: IconProps) => <HiBars3 {...props} />,
  chevronDown: (props: IconProps) => <HiOutlineChevronDown {...props} />,
  search: (props: IconProps) => <HiOutlineMagnifyingGlass {...props} />,
  user: (props: IconProps) => <HiOutlineUser {...props} />,
  heart: (props: IconProps) => <HiHeart {...props} />,
  heartOutline: (props: IconProps) => <HiOutlineHeart {...props} />,
  trash: (props: IconProps) => <HiOutlineTrash {...props} />,
};

type IconType = keyof typeof Icon;

export { Icon, type IconType };
