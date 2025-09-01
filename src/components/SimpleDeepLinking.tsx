import { useEffect, useState } from "react";

const SimpleDeepLinking = () => {
  const APP_STORE_URL =
    "https://apps.apple.com/us/app/talent-star-nepal/id6749501531?mt=8";
  const PLAY_STORE_URL =
    "https://play.google.com/store/apps/details?id=com.rajthapa7.talentstar";

  const [platform, setPlatform] = useState("");
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      setPlatform("ios");
    } else if (/android/i.test(userAgent)) {
      setPlatform("android");
    } else {
      setPlatform("desktop");
    }

    // Get current path for display
    const path = window.location.pathname.replace("/app/", "") || "Home";
    console.log(path, "path");
    setCurrentPath(path);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
      {/* meta tags */}
      <title>Talent Star Nepal</title>
      <meta
        name="description"
        content="Open the Talent Star Nepal app or download it."
      />
      <meta property="og:title" content="Talent Star Nepal" />
      <meta
        property="og:description"
        content="Showcase your skills on Talent Star Nepal."
      />
      <meta
        property="og:image"
        content="https://img.freepik.com/free-photo/abstract-background-pontillize_58702-6162.jpg"
      />

      <div className="text-center p-8 max-w-md mx-auto">
        {/* App Icon */}
        <div className="w-24 h-24 bg-white rounded-3xl mx-auto mb-6 flex items-center justify-center text-3xl font-bold text-indigo-500 shadow-lg">
          TS
        </div>

        {/* App Info */}
        <h1 className="text-3xl font-bold mb-2">Talent Star Nepal</h1>
        <p className="text-white/90 mb-2">Discover and showcase talent</p>

        {currentPath !== "Home" && (
          <p className="text-white/80 text-sm mb-6">
            Trying to open:{" "}
            <span className="font-mono bg-white/20 px-2 py-1 rounded">
              {currentPath}
            </span>
          </p>
        )}

        {/* App Store Buttons */}
        <div className="space-y-4 mt-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Get the App</h3>

            {(platform === "ios" || platform === "desktop") && (
              <a
                href={APP_STORE_URL}
                className="block w-full py-3 px-6 bg-black text-white rounded-lg font-medium mb-3 transition-transform hover:scale-105"
              >
                📱 Download on App Store
              </a>
            )}

            {(platform === "android" || platform === "desktop") && (
              <a
                href={PLAY_STORE_URL}
                className="block w-full py-3 px-6 bg-green-600 text-white rounded-lg font-medium transition-transform hover:scale-105"
              >
                🤖 Get it on Google Play
              </a>
            )}
          </div>

          {/* Info Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-left">
            <h4 className="font-semibold mb-2">How it works:</h4>
            <ul className="text-sm text-white/80 space-y-1">
              <li>• If you have the app, it opens automatically</li>
              <li>• If not, download it using the buttons above</li>
              <li>• After installing, the link will work seamlessly</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <p className="text-white/60 text-xs mt-6">
          Universal Links automatically detect if the app is installed
        </p>
      </div>
    </div>
  );
};

export default SimpleDeepLinking;
