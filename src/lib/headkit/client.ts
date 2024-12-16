// import { GraphQLClient } from "graphql-request";
// import { getSdk } from "./generated";

// // TODO: handle session cookies
// const client = new GraphQLClient(process.env.NEXT_PUBLIC_HEADKIT_API_GRAPHQL_ENDPOINT!, {
//   headers: {
//     Authorization: `Bearer ${process.env.HEADKIT_API_TOKEN}`,
//   },
// });

// const headkit = getSdk(client);

// export { headkit };

import { GraphQLClient } from "graphql-request";
import { getSdk } from "./generated";

/**
 * Create a GraphQLClient with middleware to handle WooCommerce session cookies.
 */
const createGraphQLClient = (config?: { woocommerceSession?: string }) => {
  const endpoint = process.env.NEXT_PUBLIC_HEADKIT_API_GRAPHQL_ENDPOINT!;
  const authToken = process.env.HEADKIT_API_TOKEN;

  const client = new GraphQLClient(endpoint, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      ...(config?.woocommerceSession
        ? {
            "woocommerce-session": `Session ${config?.woocommerceSession}`,
          }
        : {}),
    },
  });

  return getSdk(client);
};

export { createGraphQLClient as headkit };
