import { Grid } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTopTracks } from "../../provider/spotfy";
import { LoadingState } from "../Layout/LoadingState";
import { Section } from "../Layout/Section";
import { TrackCard } from "./TrackCard";

const TopTracks = () => {
  const [tracks, setTracks] = useState<any[] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getTopTracks().then((data) => setTracks(data?.items || []));
  }, []);

  return (
    <Section title="Faixas que definem seu momento" eyebrow="Mais ouvidas">
      {!tracks ? (
        <LoadingState label="Carregando faixas" />
      ) : (
        <Grid columns={{ initial: "1", xs: "2", sm: "3", lg: "5" }} gap="4">
          {tracks.map((track) => (
            <BoxButton key={track.id} onClick={() => navigate(`/tracks/${track.id}`)}>
              <TrackCard track={track} />
            </BoxButton>
          ))}
        </Grid>
      )}
    </Section>
  );
};

const BoxButton = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) => (
  <button type="button" onClick={onClick} className="contents">
    {children}
  </button>
);

export default TopTracks;
