// Format Firestore timestamp to relative time label (today, yesterday, etc)
export const formatTimeLabel = (seconds: number): string => {
  const msgDate = new Date(seconds * 1000);
  const now = new Date();

  const isToday =
    msgDate.getDate() === now.getDate() &&
    msgDate.getMonth() === now.getMonth() &&
    msgDate.getFullYear() === now.getFullYear();

  if (isToday) {
    return msgDate.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  const diffDays = Math.floor((now.getTime() - msgDate.getTime()) / 86400000);
  if (diffDays < 7)
    return msgDate.toLocaleDateString(undefined, { weekday: "short" });

  return msgDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(msgDate.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}),
  });
};
