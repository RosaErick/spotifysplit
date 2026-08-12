// Porta permanente para o tour no header do desktop.
//
// Ela existe porque quem dispensa o convite nunca mais e reconvidado: sem um
// caminho de volta explicito, "nunca mais" viraria "inacessivel".

import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { IconButton, Tooltip } from "@radix-ui/themes";
import { useTour } from "./TourProvider";

export const TourHelpButton = () => {
  const tour = useTour();

  // Sem provider (login, /sobre) o gatilho simplesmente nao existe.
  if (!tour) return null;

  return (
    <Tooltip content="Como funciona">
      <IconButton
        type="button"
        variant="soft"
        color="gray"
        highContrast
        className="utility-icon-action clickable-control"
        onClick={tour.startTour}
        aria-label="Como funciona"
      >
        <QuestionMarkCircledIcon />
      </IconButton>
    </Tooltip>
  );
};
