import { prisma } from "@/lib/prisma";
import { sortAnswers } from "@/lib/qa/sort-answers";
import type { QuestionListItem } from "@/lib/types/qa";

export async function loadQuestionsForBusiness(
  businessId: string,
  claimedByUserId: string | null,
  currentUserId: string | null,
): Promise<QuestionListItem[]> {
  const questions = await prisma.question.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
      answers: {
        include: {
          user: { select: { name: true } },
          votes: {
            where: { userId: currentUserId ?? "__none__" },
            select: { id: true },
          },
        },
      },
    },
  });

  return questions.map((question) => ({
    id: question.id,
    userId: question.userId,
    userName: question.user.name,
    text: question.text,
    createdAt: question.createdAt.toISOString(),
    answers: sortAnswers(
      question.answers.map((answer) => ({
        id: answer.id,
        userId: answer.userId,
        userName: answer.user.name,
        text: answer.text,
        voteCount: answer.voteCount,
        createdAt: answer.createdAt.toISOString(),
        isOwner: claimedByUserId !== null && answer.userId === claimedByUserId,
        viewerVoted: answer.votes.length > 0,
      })),
    ),
  }));
}
