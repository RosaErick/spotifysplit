// Componente autossuficiente: renderiza o proprio botao-gatilho + o modal de
// compartilhamento. Nao recebe props (usa os hooks de dados internamente).
// O card de perfil so precisa montar <ShareButton />.
import { ShareCardDialog } from "./ShareCardDialog";

export const ShareButton = () => <ShareCardDialog />;
