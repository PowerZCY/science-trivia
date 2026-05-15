import { NextRequest, NextResponse } from "next/server";
import { generateScienceQuiz } from "@/lib/science-quiz";

export const runtime = "nodejs";

type GenerateScienceQuizBody = {
  uuid?: unknown;
};

export async function POST(request: NextRequest) {
  let body: GenerateScienceQuizBody;
  try {
    body = (await request.json()) as GenerateScienceQuizBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body.uuid !== "string" || body.uuid.trim().length === 0) {
    return NextResponse.json({ error: "uuid is required." }, { status: 400 });
  }

  try {
    const result = await generateScienceQuiz(body.uuid);
    return NextResponse.json({
      quizId: result.quiz.date,
      questionIds: result.questionIds,
      questions: result.quiz.questions,
      remainingGroups: result.remainingGroups,
      cacheAvailable: result.cacheAvailable,
      quiz: result.quiz,
    });
  } catch (error) {
    console.error("[science-quiz] Failed to generate quiz.", error);
    return NextResponse.json({ error: "Unable to generate a science quiz." }, { status: 500 });
  }
}
