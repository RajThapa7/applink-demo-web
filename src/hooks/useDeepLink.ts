import { useState, useEffect } from "react";

export interface DeepLinkParams {
  [key: string]: string | undefined;
}

export const useDeepLink = () => {
  const [params, setParams] = useState<DeepLinkParams>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const parseParams = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const parsedParams: DeepLinkParams = {};

      urlParams.forEach((value, key) => {
        parsedParams[key] = value;
      });

      setParams(parsedParams);
      setIsLoading(false);
    };

    parseParams();

    // Listen for URL changes (if using React Router)
    window.addEventListener("popstate", parseParams);

    return () => {
      window.removeEventListener("popstate", parseParams);
    };
  }, []);

  const buildShareUrl = (baseUrl: string, deepLinkParams: DeepLinkParams) => {
    const url = new URL(baseUrl);
    Object.entries(deepLinkParams).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });
    return url.toString();
  };

  return {
    params,
    isLoading,
    buildShareUrl,
  };
};
