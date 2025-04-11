"use client";

import { createContext, ReactNode, useContext, useReducer, useEffect } from "react";
import { Branding, Cart, StripeConfig } from "@/lib/headkit/generated";
import { getStripeConfig } from "@/lib/headkit/actions";

interface AppContextState {
  cartDrawer: boolean;
  cartData: Cart | null;
  isGlobalDisabled: boolean;
  wishlists: number[];
  initLang: string;
  initCurrency: string;
  stripeConfig: {
    publishableKey: string;
    accountId: string;
  } | null;
  stripeFullConfig: StripeConfig | null;
  isLiveMode: boolean;
  brandingData: Branding | null;
}

interface AppContextActions {
  toggleCartDrawer: (enable?: boolean) => void;
  setCartData: (cartData: Cart | null) => void;
  setIsGlobalDisabled: (isGlobalDisabled: boolean) => void;
  setWishlists: (wishlists: number[]) => void;
  setStripeConfig: (config: { publishableKey: string; accountId: string } | null) => void;
  setIsLiveMode: (isLiveMode: boolean) => void;
}

type AppContextValue = AppContextState & AppContextActions;

export const AppContext = createContext<AppContextValue | null>(null);

interface AppContextProviderProps {
  children: ReactNode;
  initialIsLogin?: boolean;
  initialWishlists?: number[];
  initialLang?: string;
  initialCurrency?: string;
}

const initialState: AppContextState = {
  cartDrawer: false,
  cartData: null,
  isGlobalDisabled: false,
  wishlists: [],
  initLang: "en-AU",
  initCurrency: "AUD",
  stripeConfig: null,
  stripeFullConfig: null,
  isLiveMode: process.env.NEXT_PUBLIC_STRIPE_LIVE_MODE === 'true',
  brandingData: null,
};

type AppContextAction =
  | { type: "TOGGLE_CART_DRAWER"; payload?: boolean }
  | { type: "SET_CART_DATA"; payload: Cart | null }
  | { type: "SET_IS_LOGIN"; payload: boolean }
  | { type: "SET_IS_GLOBAL_DISABLED"; payload: boolean }
  | { type: "SET_WISHLISTS"; payload: number[] }
  | { type: "SET_STRIPE_ config "; payload: { publishableKey: string; accountId: string } | null }
  | { type: "SET_IS_LIVE_MODE"; payload: boolean }
  | { type: "SET_STRIPE_FULL_ config "; payload: StripeConfig | null }
  | { type: "SET_BRANDING_DATA"; payload: Branding | null };

const reducer = (
  state: AppContextState,
  action: AppContextAction
): AppContextState => {
  switch (action.type) {
    case "TOGGLE_CART_DRAWER":
      return {
        ...state,
        cartDrawer:
          action.payload !== undefined ? action.payload : !state.cartDrawer,
      };
    case "SET_CART_DATA":
      return { ...state, cartData: action.payload ?? null };
    case "SET_IS_GLOBAL_DISABLED":
      return { ...state, isGlobalDisabled: action.payload };
    case "SET_WISHLISTS":
      return { ...state, wishlists: action.payload };
    case "SET_STRIPE_ config ":
      return { ...state, stripeConfig: action.payload };
    case "SET_IS_LIVE_MODE":
      return { ...state, isLiveMode: action.payload };
    case "SET_STRIPE_FULL_ config ":
      return { ...state, stripeFullConfig: action.payload };
    case "SET_BRANDING_DATA":
      return { ...state, brandingData: action.payload };
    default:
      return state;
  }
};

export const AppContextProvider = ({
  children,
  initialWishlists = [],
  initialLang = "en-AU",
  initialCurrency = "AUD",
}: AppContextProviderProps) => {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    wishlists: initialWishlists,
    initLang: initialLang,
    initCurrency: initialCurrency,
  });

  useEffect(() => {
    const fetchStripeConfig = async () => {
      try {
        const response = await getStripeConfig();
        if (response?.data?.stripeConfig) {
          dispatch({
            type: "SET_STRIPE_FULL_ config ",
            payload: response.data.stripeConfig
          });
        }
      } catch (error) {
        console.error('Error fetching stripe config:', error);
      }
    };
    fetchStripeConfig();
  }, []);

  useEffect(() => {
    if (state.stripeFullConfig) {
      const key = state.isLiveMode && state.stripeFullConfig.publishableKeyLive
        ? state.stripeFullConfig.publishableKeyLive
        : state.stripeFullConfig.publishableKeyTest;

      dispatch({
        type: "SET_STRIPE_ config ",
        payload: { publishableKey: key, accountId: state.stripeFullConfig.accountId }
      });
    }
  }, [state.isLiveMode, state.stripeFullConfig]);

  // useEffect(() => {
  //   const fetchBranding = async () => {
  //     try {
  //       const response = await getBranding();
  //       if (response?.data?.branding) {
  //         dispatch({
  //           type: "SET_BRANDING_DATA",
  //           payload: response.data.branding
  //         });
  //       }
  //     } catch (error) {
  //       console.error('Error fetching branding:', error);
  //     }
  //   };
  //   fetchBranding();
  // }, []);

  const actions: AppContextActions = {
    toggleCartDrawer: (enable?: boolean) => {
      dispatch({ type: "TOGGLE_CART_DRAWER", payload: enable });
    },
    setCartData: (cartData: Cart | null) => {
      dispatch({ type: "SET_CART_DATA", payload: cartData });
    },
    setIsGlobalDisabled: (isGlobalDisabled: boolean) => {
      dispatch({ type: "SET_IS_GLOBAL_DISABLED", payload: isGlobalDisabled });
    },
    setWishlists: (wishlists: number[]) => {
      dispatch({ type: "SET_WISHLISTS", payload: wishlists });
    },
    setStripeConfig: (config: { publishableKey: string; accountId: string } | null) => {
      dispatch({ type: "SET_STRIPE_ config ", payload: config });
    },
    setIsLiveMode: (isLiveMode: boolean) => {
      dispatch({ type: "SET_IS_LIVE_MODE", payload: isLiveMode });
    },
  };

  return (
    <AppContext.Provider value={{ ...state, ...actions }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }
  return context;
};
