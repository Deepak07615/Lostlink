export type Report = {
  id: string;
  report_type: "lost" | "found";
  item_name: string;
  category: string;
  description: string;
  location: string;
  event_time: string;
};

function words(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 2)
  );
}

function textSimilarity(a: string, b: string): number {
  const first = words(a);
  const second = words(b);

  if (first.size === 0 || second.size === 0) return 0;

  let common = 0;

  first.forEach((word) => {
    if (second.has(word)) common++;
  });

  return common / Math.max(first.size, second.size);
}

export function calculateMatchScore(
  lost: Report,
  found: Report
): {
  score: number;
  reason: string;
} {
  let score = 0;
  const reasons: string[] = [];

  // Category: 25 points
  if (lost.category.toLowerCase() === found.category.toLowerCase()) {
    score += 25;
    reasons.push("same category");
  }

  // Item name: 25 points
  const nameSimilarity = textSimilarity(
    lost.item_name,
    found.item_name
  );

  if (nameSimilarity >= 0.5) {
    score += 25;
    reasons.push("similar item name");
  } else if (nameSimilarity >= 0.25) {
    score += 15;
    reasons.push("partially similar item name");
  }

  // Description: 25 points
  const descriptionSimilarity = textSimilarity(
    lost.description,
    found.description
  );

  if (descriptionSimilarity >= 0.4) {
    score += 25;
    reasons.push("similar item details");
  } else if (descriptionSimilarity >= 0.2) {
    score += 15;
    reasons.push("some matching details");
  }

  // Location: 15 points
  const locationSimilarity = textSimilarity(
    lost.location,
    found.location
  );

  if (locationSimilarity >= 0.5) {
    score += 15;
    reasons.push("same/similar location");
  } else if (locationSimilarity > 0) {
    score += 8;
    reasons.push("nearby/similar location");
  }

  // Time: 10 points
  const lostTime = new Date(lost.event_time).getTime();
  const foundTime = new Date(found.event_time).getTime();

  const differenceHours =
    Math.abs(lostTime - foundTime) / (1000 * 60 * 60);

  if (differenceHours <= 2) {
    score += 10;
    reasons.push("close in time");
  } else if (differenceHours <= 24) {
    score += 5;
    reasons.push("within the same day");
  }

  return {
    score: Math.min(score, 100),
    reason:
      reasons.length > 0
        ? `Matched because of ${reasons.join(", ")}.`
        : "Few matching signals found.",
  };
}