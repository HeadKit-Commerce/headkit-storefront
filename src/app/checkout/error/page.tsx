"use client";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const getErrorMessage = (reason?: string) => {
  switch (reason) {
    case "missing_data":
      return "We couldn't find your checkout information. Please try again.";
    case "invalid_data":
      return "Your checkout information was invalid. Please try again.";
    case "missing_billing":
      return "Billing information is missing. Please try again.";
    case "missing_shipping":
      return "Shipping information is missing. Please try again.";
    case "order_creation_failed":
      return "We couldn't create your order. Please try again.";
    case "checkout_execution_error":
      return "There was an error processing your checkout. Please try again.";
    default:
      return "There was a problem processing your payment. Please try again.";
  }
};

export default function CheckoutErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") || undefined;
  const errorDetails = searchParams.get("error") || undefined;
  const [errorMessage, setErrorMessage] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    setErrorMessage(getErrorMessage(reason));
  }, [reason]);

  let parsedError = null;
  if (errorDetails) {
    try {
      parsedError = JSON.parse(errorDetails);
    } catch (e) {
      console.error("Error parsing error details:", e);
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center space-y-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-16 h-16 mx-auto text-red-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>

        <h1 className="text-2xl font-bold text-gray-900">Payment Failed</h1>
        <p className="text-gray-600">{errorMessage}</p>
        
        {errorDetails && (
          <div className="mt-4">
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="text-primary underline text-sm"
            >
              {showDetails ? "Hide Details" : "Show Technical Details"}
            </button>
            
            {showDetails && (
              <div className="mt-2 p-4 bg-gray-100 rounded text-left overflow-auto max-h-60">
                <pre className="text-xs whitespace-pre-wrap">
                  {JSON.stringify(parsedError, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <Button
            onClick={() => router.push("/checkout")}
            className="w-full"
          >
            Try Again
          </Button>
          
          <Button
            onClick={() => router.push("/")}
            variant="secondary"
            className="w-full"
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
} 