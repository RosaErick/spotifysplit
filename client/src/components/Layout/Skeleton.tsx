import { Box, Card, Flex, Grid } from "@radix-ui/themes";

type SkeletonProps = {
  width?: string;
  height?: string;
  radius?: string;
};

export const Skeleton = ({ width = "100%", height = "1rem", radius }: SkeletonProps) => (
  <span
    className="skeleton"
    style={{ display: "block", width, height, borderRadius: radius }}
  />
);

// Card de midia (artista/faixa/album) em carregamento.
const MediaCardSkeleton = () => (
  <Card>
    <Box className="media-tile" mb="3">
      <span className="skeleton" style={{ display: "block", height: "100%" }} />
    </Box>
    <Flex direction="column" gap="2">
      <Skeleton width="80%" height="0.9rem" />
      <Skeleton width="55%" height="0.75rem" />
    </Flex>
  </Card>
);

type GridSkeletonProps = {
  count?: number;
  columns?: Record<string, string>;
};

export const CardGridSkeleton = ({
  count = 4,
  columns = { initial: "2", sm: "3", lg: "4" },
}: GridSkeletonProps) => (
  <Grid columns={columns} gap="4">
    {Array.from({ length: count }).map((_, index) => (
      <MediaCardSkeleton key={index} />
    ))}
  </Grid>
);

export const ProfileSkeleton = () => (
  <Card className="hero-panel profile-card" mb="2">
    <Flex
      className="profile-layout"
      align="center"
      gap={{ initial: "4", sm: "6" }}
      direction={{ initial: "column", sm: "row" }}
    >
      <Flex className="profile-identity" align="center" gap="4">
        <Box className="avatar-ring">
          <Skeleton width="80px" height="80px" radius="999px" />
        </Box>

        <Flex direction="column" gap="2" style={{ minWidth: 0, flex: "1 1 auto" }}>
          <Skeleton width="8rem" height="0.55rem" />
          <Skeleton width="min(18rem, 70vw)" height="1.65rem" />
          <Flex align="center" gap="3" wrap="wrap">
            <Skeleton width="4.4rem" height="1.25rem" radius="999px" />
            <Skeleton width="7rem" height="1.75rem" radius="999px" />
          </Flex>
        </Flex>
      </Flex>

      <Box className="stat-strip">
        {Array.from({ length: 3 }).map((_, index) => (
          <Box className="stat-cell" key={index}>
            <Skeleton width="56%" height="1rem" />
            <Box mt="1">
              <Skeleton width="72%" height="0.58rem" />
            </Box>
          </Box>
        ))}
      </Box>
    </Flex>
  </Card>
);

export const RowSkeleton = ({ count = 6 }: { count?: number }) => (
  <Flex gap="4" style={{ overflow: "hidden" }} pb="3">
    {Array.from({ length: count }).map((_, index) => (
      <Box key={index} width={{ initial: "220px", sm: "240px" }} flexShrink="0">
        <MediaCardSkeleton />
      </Box>
    ))}
  </Flex>
);
