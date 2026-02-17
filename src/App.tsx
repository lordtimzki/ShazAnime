import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { VideoProvider } from "./contexts/VideoContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Results from "./pages/Results";
import History from "./pages/History";
import About from "./pages/About";

function App() {
  return (
    <Router>
      <VideoProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/results" element={<Results />} />
            <Route path="/history" element={<History />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Layout>
      </VideoProvider>
    </Router>
  );
}

export default App;
