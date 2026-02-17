import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { VideoProvider } from "./contexts/VideoContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Results from "./pages/Results";

function App() {
  return (
    <Router>
      <VideoProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/results" element={<Results />} />
          </Routes>
        </Layout>
      </VideoProvider>
    </Router>
  );
}

export default App;
