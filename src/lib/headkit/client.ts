import { GraphQLClient } from "graphql-request";
import { getSdk } from "./generated";
import { HEADER_NAMES } from "./constants";
import { decodeSessionCookie } from "./utils/cookies";

export const headkit = (options?: {
  woocommerceSession?: string;
  authToken?: string;
  mailchimpUserEmail?: string;
  mailchimpUserPreviousEmail?: string;
}) => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${process.env.HEADKIT_API_TOKEN}`,
  };

  // Build cookie string
  let cookieString = "";

  if (options?.woocommerceSession) {
    const sessionCookie = decodeSessionCookie(options.woocommerceSession);
    if (sessionCookie) {
      cookieString = `${sessionCookie.key}=${sessionCookie.value}`;
    }
  }

  // Add Mailchimp cookies if provided
  if (options?.mailchimpUserEmail) {
    cookieString += cookieString ? "; " : "";
    cookieString += `mailchimp_user_email=${options.mailchimpUserEmail}`;
  }

  if (options?.mailchimpUserPreviousEmail) {
    cookieString += cookieString ? "; " : "";
    cookieString += `mailchimp_user_previous_email=${options.mailchimpUserPreviousEmail}`;
  }

  // Set cookies header if we have any cookies
  if (cookieString) {
    headers["Cookie"] = cookieString;
  }

  if (options?.authToken) {
    headers[HEADER_NAMES.AUTH_TOKEN] = options.authToken;
  }

  const client = new GraphQLClient(
    process.env.NEXT_PUBLIC_HEADKIT_API_GRAPHQL_ENDPOINT || "",
    {
      headers,
      next: {
        revalidate: process.env.REVALIDATE_TIME ? parseInt(process.env.REVALIDATE_TIME) : 3600,
      },
    }
  );

  return getSdk(client);
};
