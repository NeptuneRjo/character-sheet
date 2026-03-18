import { getReactions } from "@/lib/database/queries";
import { CharacterReaction, RequestBody } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug?: string[] | undefined }> }
) {
  const { slug } = await params;
  const { characterId, body }: RequestBody<CharacterReaction> =
    await req.json();

  try {
    const response = slug ? [] : await getReactions(characterId);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong. ", error: error },
      { status: 500 }
    );
  }
}
