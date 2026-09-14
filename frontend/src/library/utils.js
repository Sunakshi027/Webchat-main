export function formatMessageTime(date) {
  const messageDate = new Date(date);
  const now = new Date();

  // Strip time to compare just the calendar day
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMessageDay = new Date(
    messageDate.getFullYear(),
    messageDate.getMonth(),
    messageDate.getDate()
  );

  const diffInDays = Math.round(
    (startOfToday - startOfMessageDay) / (1000 * 60 * 60 * 24)
  );

  const time = messageDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diffInDays === 0) {
    return time; // e.g. "2:32 PM"
  }

  if (diffInDays === 1) {
    return `Yesterday, ${time}`; // e.g. "Yesterday, 2:32 PM"
  }

  if (diffInDays < 7) {
    const weekday = messageDate.toLocaleDateString("en-US", { weekday: "long" });
    return `${weekday}, ${time}`; // e.g. "Monday, 2:32 PM"
  }

  // Older than a week → show actual date
  const formattedDate = messageDate.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: messageDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });

  return `${formattedDate}, ${time}`; // e.g. "12 Jun, 2:32 PM"
}