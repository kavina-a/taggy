export interface SortableAnswer {
  voteCount: number;
  createdAt: string;
}

// QA-01: top-voted answer surfaces first. Equal votes keep earlier answers
// above later ones so the first useful reply isn't bounced by a tie.
export function sortAnswers<T extends SortableAnswer>(answers: T[]): T[] {
  return [...answers].sort((a, b) => {
    if (b.voteCount !== a.voteCount) return b.voteCount - a.voteCount;
    return a.createdAt.localeCompare(b.createdAt);
  });
}
