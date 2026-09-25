export interface AnswerListItem {
  id: string;
  userId: string;
  userName: string | null;
  text: string;
  voteCount: number;
  createdAt: string;
  isOwner: boolean;
  viewerVoted: boolean;
}

export interface QuestionListItem {
  id: string;
  userId: string;
  userName: string | null;
  text: string;
  createdAt: string;
  answers: AnswerListItem[];
}
