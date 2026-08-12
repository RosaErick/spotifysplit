// Convite: faixa no fluxo da home, entre o card de perfil e os rankings.
//
// Nao e modal, nem toast, nem ponto pulsante. Nao sobrepoe nada, rola junto com
// a pagina e some ao ser respondido. O requisito e que o tour nao comece sem o
// usuario mandar — entao o convite tem que ser recusavel com a mesma facilidade
// com que e aceito: dois botoes de texto, nao um X de 16px.

import { Button, Card, Text } from "@radix-ui/themes";
import { Reveal } from "../../components/Layout/Reveal";
import { useProfileOverview } from "../../shared/api/queries";
import { useTour } from "./TourProvider";
import "./tour.css";

export const TourInvite = () => {
  const tour = useTour();
  const { data } = useProfileOverview();

  // Espera o perfil resolver: sem isso o convite apareceria em cima dos
  // skeletons e o usuario poderia aceitar antes de os alvos existirem. O React
  // Query desduplica pela chave, entao nao ha requisicao extra.
  if (!tour || tour.phase !== "invite" || !data) return null;

  return (
    <Reveal>
      <Card className="hero-panel tour-invite" mb="2">
        <Text as="p" size="1" weight="bold" className="section-eyebrow">
          Primeira vez aqui?
        </Text>

        <Text as="p" size="2" color="gray" className="tour-invite-body">
          Um guia rápido de {tour.stepCount} passos pelo que dá pra ver aqui — e
          pelo que os números do Spotify significam.
        </Text>

        <div className="tour-invite-actions">
          <Button
            variant="soft"
            className="clickable-control"
            onClick={tour.startTour}
          >
            Ver o guia
          </Button>
          <Button
            variant="ghost"
            color="gray"
            className="clickable-control"
            onClick={tour.dismiss}
          >
            Agora não
          </Button>
        </div>
      </Card>
    </Reveal>
  );
};
