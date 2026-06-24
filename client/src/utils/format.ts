export const formatNumber = (value?: number) =>
  new Intl.NumberFormat("pt-BR").format(value || 0);

export const formatDuration = (durationMs?: number) => {
  const totalSeconds = Math.floor((durationMs || 0) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};
