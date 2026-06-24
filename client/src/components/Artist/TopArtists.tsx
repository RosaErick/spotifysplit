import { Grid } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTopArtists } from "../../provider/spotfy";
import { LoadingState } from "../Layout/LoadingState";
import { Section } from "../Layout/Section";
import { ArtistCard } from "./ArtistCard";

export const TopArtists = () => {
  const [topArtists, setTopArtists] = useState<any[] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getTopArtists().then((data) => setTopArtists(data?.items || []));
  }, []);

  return (
    <Section title="Artistas em alta para voce" eyebrow="Top pessoal">
      {!topArtists ? (
        <LoadingState label="Carregando artistas" />
      ) : (
        <Grid columns={{ initial: "1", xs: "2", md: "3", lg: "4" }} gap="4">
          {topArtists.map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              onClick={() => navigate(`/artists/${artist.id}`)}
            />
          ))}
        </Grid>
      )}
    </Section>
  );
};
