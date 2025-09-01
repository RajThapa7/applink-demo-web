import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SimpleDeepLink from "./components/SimpleDeepLinking";

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/app" element={<DeepLinkLanding />} /> */}
        <Route path="/app/*" element={<SimpleDeepLink />} />
        {/* Your other routes */}
        <Route path="/" element={<div>Welcome to the main site</div>} />
      </Routes>
    </Router>
  );
}

export default App;
