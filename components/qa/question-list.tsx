"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ThumbsUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  createAnswerSchema,
  createQuestionSchema,
  type CreateAnswerInput,
  type CreateQuestionInput,
} from "@/lib/validation/question.schema";
import type { QuestionListItem } from "@/lib/types/qa";

function AnswerVote({
  answerId,
  voteCount,
  viewerVoted,
  currentUserId,
  isOwn,
}: {
  answerId: string;
  voteCount: number;
  viewerVoted: boolean;
  currentUserId: string | null;
  isOwn: boolean;
}) {
  const router = useRouter();
  const [count, setCount] = useState(voteCount);
  const [voted, setVoted] = useState(viewerVoted);
  const [pending, setPending] = useState(false);

  if (isOwn) {
    return (
      <p className="text-sm text-muted-foreground">
        {count} {count === 1 ? "vote" : "votes"}
      </p>
    );
  }

  if (currentUserId === null) {
    return (
      <Button asChild variant="outline" className="min-h-11">
        <Link href="/login">
          <ThumbsUpIcon className="size-4" />
          Useful{count > 0 ? ` ${count}` : ""}
        </Link>
      </Button>
    );
  }

  async function toggle() {
    setPending(true);
    const res = await fetch(`/api/answers/${answerId}/votes`, { method: "POST" });
    const json = (await res.json().catch(() => null)) as
      | { voted?: boolean; voteCount?: number }
      | null;
    setPending(false);
    if (!res.ok || json?.voteCount === undefined || json.voted === undefined) return;
    setVoted(json.voted);
    setCount(json.voteCount);
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant={voted ? "default" : "outline"}
      className="min-h-11"
      aria-pressed={voted}
      disabled={pending}
      onClick={() => void toggle()}
    >
      <ThumbsUpIcon className="size-4" />
      Useful{count > 0 ? ` ${count}` : ""}
    </Button>
  );
}

function AnswerComposer({ questionId }: { questionId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<CreateAnswerInput>({
    resolver: zodResolver(createAnswerSchema),
    defaultValues: { text: "" },
  });

  async function onSubmit(values: CreateAnswerInput) {
    setError(null);
    const res = await fetch(`/api/questions/${questionId}/answers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      setError("This answer couldn't be published.");
      return;
    }
    form.reset();
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your answer</FormLabel>
              <FormControl>
                <Textarea {...field} className="min-h-16" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" variant="outline" className="min-h-11 w-fit">
          Post answer
        </Button>
      </form>
    </Form>
  );
}

function QuestionComposer({ businessSlug }: { businessSlug: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<CreateQuestionInput>({
    resolver: zodResolver(createQuestionSchema),
    defaultValues: { text: "" },
  });

  async function onSubmit(values: CreateQuestionInput) {
    setError(null);
    const res = await fetch(`/api/businesses/${businessSlug}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      setError("This question couldn't be published.");
      return;
    }
    form.reset();
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ask a question</FormLabel>
              <FormControl>
                <Textarea {...field} className="min-h-16" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          type="submit"
          className="min-h-11 w-fit bg-brand-accent text-white hover:bg-brand-accent/90"
        >
          Post question
        </Button>
      </form>
    </Form>
  );
}

export function QuestionList({
  businessSlug,
  questions,
  currentUserId,
}: {
  businessSlug: string;
  questions: QuestionListItem[];
  currentUserId: string | null;
}) {
  return (
    <div className="flex flex-col gap-6">
      {currentUserId === null ? (
        <div className="flex flex-col gap-2 rounded-lg bg-secondary/60 p-4">
          <p className="text-base leading-normal">Have a question about this place?</p>
          <Button asChild className="min-h-11 w-fit bg-brand-accent text-white hover:bg-brand-accent/90">
            <Link href="/login">Log in to ask a question</Link>
          </Button>
        </div>
      ) : (
        <QuestionComposer businessSlug={businessSlug} />
      )}

      {questions.length === 0 ? (
        <p className="text-base text-muted-foreground">No questions yet. Be the first to ask.</p>
      ) : (
        <ul className="flex flex-col gap-6">
          {questions.map((question) => (
            <li key={question.id} className="flex flex-col gap-3">
              <div>
                <p className="text-base font-semibold">{question.text}</p>
                <p className="text-sm text-muted-foreground">
                  Asked by {question.userName ?? "Anonymous"}
                </p>
              </div>
              {question.answers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No answers yet.</p>
              ) : (
                <ul className="flex flex-col gap-3 border-l-2 border-border pl-3">
                  {question.answers.map((answer) => (
                    <li key={answer.id} className="flex flex-col gap-2">
                      <p className="text-sm leading-normal">{answer.text}</p>
                      <p className="text-xs text-muted-foreground">
                        {answer.userName ?? "Anonymous"}
                        {answer.isOwner ? " · Owner" : ""}
                      </p>
                      <AnswerVote
                        answerId={answer.id}
                        voteCount={answer.voteCount}
                        viewerVoted={answer.viewerVoted}
                        currentUserId={currentUserId}
                        isOwn={currentUserId === answer.userId}
                      />
                    </li>
                  ))}
                </ul>
              )}
              {currentUserId === null ? (
                <Button asChild variant="ghost" className="min-h-11 w-fit">
                  <Link href="/login">Log in to answer</Link>
                </Button>
              ) : (
                <AnswerComposer questionId={question.id} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
