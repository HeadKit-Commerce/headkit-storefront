export const encodeSessionCookie = (key: string, value: string): string => {
  // Remove the prefix to get just the unique part
  const uniqueId = key.replace("wp_woocommerce_session_", "");
  return `${uniqueId}::${value}`;
};

export const decodeSessionCookie = (
  encoded: string
): { key: string; value: string } | null => {
  if (!encoded) return null;

  const [uniqueId, value] = encoded.split("::");
  if (!uniqueId || !value) return null;

  return {
    key: `wp_woocommerce_session_${uniqueId}`,
    value,
  };
};

export const parseCookies = (
  setCookieHeader: string
): Record<string, string> => {
  const cookies: Record<string, string> = {};

  const cookieStrings = setCookieHeader.split(",").map((str) => str.trim());

  cookieStrings.forEach((cookieStr) => {
    const [nameValue] = cookieStr.split(";");
    const [name, value] = nameValue.split("=").map((s) => s.trim());

    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });

  return cookies;
};

export const getSessionKeyFromCookies = (
  cookies: Record<string, string>
): string | undefined => {
  return Object.keys(cookies).find((key) =>
    key.startsWith("wp_woocommerce_session_")
  );
};
