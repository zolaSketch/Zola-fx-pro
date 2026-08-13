import { Landing } from "./pages/Landing";
import { Console } from "./pages/Console";
import { useHash } from "./state";

export function App() {
  const hash = useHash();
  const app = hash.startsWith("#/app");
  return app ? <Console /> : <Landing />;
}
