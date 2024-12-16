"use client";

import { createContext, ReactNode, useContext, useReducer } from "react";
import { Cart } from "@/lib/headkit/generated";

interface AppContextState {
  cartDrawer: boolean;
  cartData: Cart | null;
  isLogin: boolean;
  isGlobalDisabled: boolean;
  wishlists: number[];
  initLang: string;
  initCurrency: string;
}

interface AppContextActions {
  toggleCartDrawer: (enable?: boolean) => void;
  setCartData: (cartData: Cart | null) => void;
  setIsLogin: (isLogin: boolean) => void;
  setIsGlobalDisabled: (isGlobalDisabled: boolean) => void;
  setWishlists: (wishlists: number[]) => void;
  currencyFormatter: (formatterData: {
    price: number;
    lang?: string;
    currency?: string | null | undefined;
  }) => string;
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
  isLogin: false,
  isGlobalDisabled: false,
  wishlists: [],
  initLang: "en-AU",
  initCurrency: "AUD",
};

type AppContextAction =
  | { type: "TOGGLE_CART_DRAWER"; payload?: boolean }
  | { type: "SET_CART_DATA"; payload: Cart | null }
  | { type: "SET_IS_LOGIN"; payload: boolean }
  | { type: "SET_IS_GLOBAL_DISABLED"; payload: boolean }
  | { type: "SET_WISHLISTS"; payload: number[] };

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
    case "SET_IS_LOGIN":
      return { ...state, isLogin: action.payload };
    case "SET_IS_GLOBAL_DISABLED":
      return { ...state, isGlobalDisabled: action.payload };
    case "SET_WISHLISTS":
      return { ...state, wishlists: action.payload };
    default:
      return state;
  }
};

export const AppContextProvider = ({
  children,
  initialIsLogin = false,
  initialWishlists = [],
  initialLang = "en-AU",
  initialCurrency = "AUD",
}: AppContextProviderProps) => {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    isLogin: initialIsLogin,
    wishlists: initialWishlists,
    initLang: initialLang,
    initCurrency: initialCurrency,
  });

  const actions: AppContextActions = {
    toggleCartDrawer: (enable?: boolean) => {
      dispatch({ type: "TOGGLE_CART_DRAWER", payload: enable });
    },
    setCartData: (cartData: Cart | null) => {
      dispatch({ type: "SET_CART_DATA", payload: cartData });
    },
    setIsLogin: (isLogin: boolean) => {
      dispatch({ type: "SET_IS_LOGIN", payload: isLogin });
    },
    setIsGlobalDisabled: (isGlobalDisabled: boolean) => {
      dispatch({ type: "SET_IS_GLOBAL_DISABLED", payload: isGlobalDisabled });
    },
    setWishlists: (wishlists: number[]) => {
      dispatch({ type: "SET_WISHLISTS", payload: wishlists });
    },
    currencyFormatter: ({ price, lang, currency }) => {
      return new Intl.NumberFormat(lang || state.initLang, {
        style: "currency",
        currency: currency || state.initCurrency,
      }).format(price);
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
