import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import AdventureGenerator from "./components/AdventureGenerator";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />
      <Hero />
      <AdventureGenerator />
      <Footer />
    </div>
  );
}

export default App;
