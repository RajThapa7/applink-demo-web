import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DeepLinkLanding from "./components/DeepLinkLanding";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/app" element={<DeepLinkLanding />} />
        {/* Your other routes */}
        <Route path="/" element={<div>Welcome to the main site</div>} />
      </Routes>
    </Router>
  );
}

export default App;
