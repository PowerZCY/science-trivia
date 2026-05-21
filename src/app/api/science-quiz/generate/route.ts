import { NextRequest, NextResponse } from "next/server";
import { extractFingerprintFromNextRequest } from "@windrun-huaiin/third-ui/fingerprint/server";
import { generateScienceQuiz } from "@/lib/science-quiz";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const fingerprintId = extractFingerprintFromNextRequest(request);
  if (!fingerprintId) {
    return NextResponse.json({ error: "fingerprintId is required." }, { status: 400 });
  }

  try {
    const result = await generateScienceQuiz(fingerprintId);
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
