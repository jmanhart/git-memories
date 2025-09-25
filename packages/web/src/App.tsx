import "./App.css";
import {
  Layout,
  Header,
  InstallationSection,
  Terminal,
  GitHubLookup,
  GitHubSearch,
} from "./components";

function App() {
  return (
    <Layout>
      <Header />
      <GitHubSearch />
    </Layout>
  );
}

export default App;
