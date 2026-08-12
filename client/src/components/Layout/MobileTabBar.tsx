import {
  BackpackIcon,
  HomeIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import { NavLink } from "react-router-dom";
import { MobileMoreMenu } from "./MobileMoreMenu";

// `end` so na home: sem isso a rota "/" casaria com qualquer caminho e a aba
// ficaria sempre ativa.
const TABS = [
  { to: "/", label: "Início", Icon: HomeIcon, end: true },
  { to: "/search", label: "Busca", Icon: MagnifyingGlassIcon, end: false },
  { to: "/library", label: "Biblioteca", Icon: BackpackIcon, end: false },
];

// Navegacao principal do mobile, ancorada embaixo: e onde o polegar alcanca sem
// reposicionar o aparelho. O cabecalho no topo fica so com marca e player.
// Escondida por CSS a partir de 820px, onde o header volta a dar conta.
export const MobileTabBar = ({ onLogout }: { onLogout: () => void }) => (
  <nav className="mobile-tabbar" aria-label="Navegação principal">
    <div className="mobile-tabbar-inner">
      {TABS.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `mobile-tab ${isActive ? "mobile-tab-active" : ""}`
          }
        >
          <span className="mobile-tab-mark" aria-hidden="true" />
          <Icon className="mobile-tab-icon" />
          <span className="mobile-tab-label">{label}</span>
        </NavLink>
      ))}

      <MobileMoreMenu onLogout={onLogout} />
    </div>
  </nav>
);
