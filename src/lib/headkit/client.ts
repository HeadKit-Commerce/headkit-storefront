import { GraphQLClient } from "graphql-request";
import { getSdk } from "./generated";
import { HEADER_NAMES } from "./constants";

export const headkit = (options?: {
  woocommerceSession?: string;
  authToken?: string;
}) => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${process.env.HEADKIT_API_TOKEN}`,
  };

  if (options?.woocommerceSession) {
    headers[HEADER_NAMES.SESSION] = options.woocommerceSession;
  }

  if (options?.authToken) {
    headers[HEADER_NAMES.AUTH_TOKEN] = options.authToken;
  }

  const client = new GraphQLClient(
    process.env.NEXT_PUBLIC_HEADKIT_API_GRAPHQL_ENDPOINT || "",
    {
      headers,
    }
  );

  return getSdk(client);
};
