import "./App.css";
import { Layout, Header, InstallationSection, Terminal } from "./components";

function App() {
  return (
    <Layout>
      <Header />
      <InstallationSection />
      <div className="mt-8">
        <Terminal />
      </div>
    </Layout>
  );
}

export default App;
