import { useState, useEffect, useCallback } from "react";

// App configuration
const APP_STORE_URL =
  "https://apps.apple.com/us/app/talent-star-nepal/id6749501531?mt=8";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.rajthapa7.talentstar";
const APP_SCHEME = "applinks_app://";

const SimpleDeepLinking = () => {
  // State management
  const [platform, setPlatform] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(
    "Attempting to open the app..."
  );
  const [showFallback, setShowFallback] = useState(false);
  const [deepLinkPath, setDeepLinkPath] = useState("");

  // Platform detection function
  const detectPlatform = useCallback(() => {
    const userAgent = navigator.userAgent;

    if (/iPad|iPhone|iPod/.test(userAgent)) {
      return "ios";
    }

    if (/android/i.test(userAgent)) {
      return "android";
    }

    return "desktop";
  }, []);

  // Extract deep link path from URL parameters
  const getDeepLinkPath = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("path") || "";
  }, []);

  // Handle fallback display
  const handleShowFallback = useCallback((message: string) => {
    setIsLoading(false);
    setShowFallback(true);
    setStatusMessage(message);
  }, []);

  // Attempt to open the app
  const attemptAppOpen = useCallback(() => {
    const detectedPlatform = detectPlatform();
    const path = getDeepLinkPath();
    const fullDeepLink = APP_SCHEME + path;
    console.log(fullDeepLink, "full deeplink path");

    if (detectedPlatform === "desktop") {
      handleShowFallback(
        "Desktop detected. Please scan QR code or visit from mobile device."
      );
      return;
    }

    // Create hidden iframe to attempt app opening
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = fullDeepLink;
    document.body.appendChild(iframe);

    // For Android, also try intent URL
    if (detectedPlatform === "android") {
      const intentUrl = `intent://${path}#Intent;scheme=applinks_app;package=com.rajthapa7.talentstar;S.browser_fallback_url=${encodeURIComponent(
        PLAY_STORE_URL
      )};end`;

      setTimeout(() => {
        window.location.href = intentUrl;
      }, 100);
    }

    // Set fallback timer
    const fallbackTimer = setTimeout(() => {
      handleShowFallback("App not installed or unable to open.");
    }, 2500);

    // Listen for page visibility changes (app successfully opened)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearTimeout(fallbackTimer);
        setStatusMessage("App opened successfully!");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, 3000);

    return () => {
      clearTimeout(fallbackTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [detectPlatform, getDeepLinkPath, handleShowFallback]);

  // Handle store button clicks
  const handleStoreClick = (store: string) => {
    setStatusMessage(`Redirecting to ${store}...`);
  };

  // Initialize component
  useEffect(() => {
    const detectedPlatform = detectPlatform();
    const path = getDeepLinkPath();

    setPlatform(detectedPlatform);
    setDeepLinkPath(path);

    // Add small delay to ensure component is fully mounted
    const initTimer = setTimeout(() => {
      attemptAppOpen();
    }, 500);

    return () => clearTimeout(initTimer);
  }, [detectPlatform, getDeepLinkPath, attemptAppOpen]);

  // Handle page show event (back button detection)
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        handleShowFallback("Returned to page. App may not be installed.");
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [handleShowFallback]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
      <div className="text-center p-8 max-w-sm mx-auto">
        {/* App Icon */}
        <div className="w-20 h-20 bg-white rounded-2xl mx-auto mb-6 flex items-center justify-center text-2xl font-bold text-indigo-500">
          TS
        </div>

        {/* App Title */}
        <h1 className="text-2xl font-semibold mb-2">Talent Star Nepal</h1>
        <p className="text-white/90 text-sm mb-8">Opening the app...</p>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
        )}

        {/* Fallback Buttons */}
        {showFallback && (
          <div className="space-y-4 mt-8">
            {(platform === "ios" || platform === "desktop") && (
              <a
                href={APP_STORE_URL}
                onClick={() => handleStoreClick("App Store")}
                className="block w-full py-3 px-6 border-2 border-white bg-white/10 backdrop-blur-sm rounded-lg font-medium transition-all duration-200 hover:bg-white/20 hover:-translate-y-0.5"
              >
                Download from App Store
              </a>
            )}

            {(platform === "android" || platform === "desktop") && (
              <a
                href={PLAY_STORE_URL}
                onClick={() => handleStoreClick("Google Play")}
                className="block w-full py-3 px-6 border-2 border-white bg-white/10 backdrop-blur-sm rounded-lg font-medium transition-all duration-200 hover:bg-white/20 hover:-translate-y-0.5"
              >
                Get it on Google Play
              </a>
            )}
          </div>
        )}

        {/* Status Message */}
        <p className="text-sm text-white/80 mt-4">{statusMessage}</p>

        {/* Debug Info (remove in production) */}
        {import.meta.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-black/20 rounded-lg text-xs text-left">
            <p>
              <strong>Platform:</strong> {platform}
            </p>
            <p>
              <strong>Deep Link Path:</strong> {deepLinkPath || "none"}
            </p>
            <p>
              <strong>Full Deep Link:</strong> {APP_SCHEME + deepLinkPath}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleDeepLinking;
