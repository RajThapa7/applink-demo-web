import React, { useState, useEffect } from "react";
import "./DeepLinkLanding.css";

interface DeepLinkData {
  path?: string;
  userId?: string;
  productId?: string;
  query?: string;
  [key: string]: string | undefined;
}

interface Platform {
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  name: string;
}

const DeepLinkLanding: React.FC = () => {
  const [platform, setPlatform] = useState<Platform>({
    isIOS: false,
    isAndroid: false,
    isMobile: false,
    name: "Unknown",
  });
  const [status, setStatus] = useState("Detecting your device...");
  const [deepLinkData, setDeepLinkData] = useState<DeepLinkData>({});
  const [isAttemptingOpen, setIsAttemptingOpen] = useState(false);

  // App Store URLs - UPDATE THESE WITH YOUR ACTUAL URLs
  const APP_STORE_CONFIG = {
    ios: "https://apps.apple.com/us/app/talent-star-nepal/id6749501531?mt=8", // Replace with your App Store ID
    android:
      "https://play.google.com/store/apps/details?id=com.rajthapa7.talentstar", // Replace with your package name
    scheme: "applinks_app://", // Replace with your custom URL scheme
  };

  useEffect(() => {
    detectPlatform();
    parseUrlParams();
  }, []);

  const detectPlatform = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isMobile = isIOS || isAndroid;

    const platformInfo: Platform = {
      isIOS,
      isAndroid,
      isMobile,
      name: isIOS ? "iOS" : isAndroid ? "Android" : "Desktop",
    };

    setPlatform(platformInfo);
    setStatus(`${platformInfo.name} device detected`);
  };

  const parseUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const data: DeepLinkData = {};

    // Extract all URL parameters
    urlParams.forEach((value, key) => {
      data[key] = value;
    });

    setDeepLinkData(data);

    // Store for deferred deep linking
    if (Object.keys(data).length > 0) {
      const deferredData = {
        ...data,
        timestamp: Date.now(),
      };
      localStorage.setItem("pendingDeepLink", JSON.stringify(deferredData));
    }
  };

  const buildDeepLinkUrl = (): string => {
    let deepLinkUrl = APP_STORE_CONFIG.scheme;

    if (deepLinkData.path) {
      deepLinkUrl += deepLinkData.path;

      // Add query parameters
      const params = Object.entries(deepLinkData)
        .filter(([key]) => key !== "path" && key !== "auto")
        .map(([key, value]) => `${key}=${encodeURIComponent(value || "")}`);

      if (params.length > 0) {
        deepLinkUrl += "?" + params.join("&");
      }
    }

    return deepLinkUrl;
  };

  const getStoreUrl = (): string => {
    return platform.isIOS ? APP_STORE_CONFIG.ios : APP_STORE_CONFIG.android;
  };

  const handleOpenApp = async () => {
    if (!platform.isMobile) {
      window.open(getStoreUrl(), "_blank");
      return;
    }

    setIsAttemptingOpen(true);
    setStatus("Trying to open app...");

    const deepLinkUrl = buildDeepLinkUrl();

    try {
      // Try to open the app
      window.location.href = deepLinkUrl;

      // Set up fallback mechanism
      const startTime = Date.now();
      let fallbackTriggered = false;

      const fallbackTimeout = setTimeout(() => {
        if (!fallbackTriggered && Date.now() - startTime < 4000) {
          fallbackTriggered = true;
          setStatus("App not found. Redirecting to store...");
          window.location.href = getStoreUrl();
        }
      }, 2500);

      // Clear timeout if user returns to page (app was opened)
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          clearTimeout(fallbackTimeout);
        }
      };

      const handleBlur = () => {
        clearTimeout(fallbackTimeout);
        setStatus("App opened successfully!");
      };

      // Listen for page visibility changes
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("blur", handleBlur);
      window.addEventListener("focus", () => {
        if (!fallbackTriggered) {
          setStatus("Welcome back! App should be opening...");
        }
      });

      // Cleanup listeners after timeout
      setTimeout(() => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
        window.removeEventListener("blur", handleBlur);
        setIsAttemptingOpen(false);
      }, 5000);
    } catch (error) {
      console.error("Error opening app:", error);
      setStatus("Error opening app. Redirecting to store...");
      setTimeout(() => {
        window.location.href = getStoreUrl();
      }, 1000);
    }
  };

  const handleDirectToStore = () => {
    window.open(getStoreUrl(), "_blank");
  };

  // Auto-attempt to open app if 'auto' parameter is true
  useEffect(() => {
    if (deepLinkData.auto === "true" && platform.isMobile) {
      const timer = setTimeout(() => {
        handleOpenApp();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [deepLinkData.auto, platform.isMobile]);

  const getAppIconEmoji = () => {
    if (platform.isIOS) return "📱";
    if (platform.isAndroid) return "🤖";
    return "💻";
  };

  const getDeepLinkPreview = () => {
    if (!deepLinkData.path) return null;

    const preview: { [key: string]: string } = {};
    if (deepLinkData.path) preview.Screen = deepLinkData.path;
    if (deepLinkData.userId) preview.User = deepLinkData.userId;
    if (deepLinkData.productId) preview.Product = deepLinkData.productId;
    if (deepLinkData.query) preview.Search = deepLinkData.query;

    return (
      <div className="deep-link-preview">
        <h3>Deep Link Preview</h3>
        {Object.entries(preview).map(([key, value]) => (
          <div key={key} className="preview-item">
            <span className="preview-key">{key}:</span>
            <span className="preview-value">{value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="deep-link-container">
      <div className="content-card">
        <div className="app-icon">{getAppIconEmoji()}</div>

        <h1>Open My App</h1>

        <p className="description">
          {platform.isMobile
            ? "Tap below to open the app or install it from your device's app store."
            : "Get our mobile app to access this content on your phone."}
        </p>

        {getDeepLinkPreview()}

        <div className="button-container">
          {platform.isMobile && (
            <button
              className={`primary-btn ${isAttemptingOpen ? "loading" : ""}`}
              onClick={handleOpenApp}
              disabled={isAttemptingOpen}
            >
              {isAttemptingOpen ? (
                <>
                  <span className="spinner"></span>
                  Opening App...
                </>
              ) : (
                "Open App"
              )}
            </button>
          )}

          <button className="secondary-btn" onClick={handleDirectToStore}>
            {platform.isIOS
              ? "Get from App Store"
              : platform.isAndroid
              ? "Get from Play Store"
              : "Get Mobile App"}
          </button>
        </div>

        <div className="status">{status}</div>

        {/* Debug info - remove in production */}
        {import.meta.env.NODE_ENV === "development" && (
          <details className="debug-info">
            <summary>Debug Info</summary>
            <pre>{JSON.stringify({ platform, deepLinkData }, null, 2)}</pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default DeepLinkLanding;
