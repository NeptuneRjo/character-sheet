import { deleteReaction, insertReaction } from "@/lib/database/queries";
import {
  CharacterReaction,
  InsCharacterReaction,
  RequestBody,
} from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug?: string[] | undefined }> }
) {
  const { slug } = await params;
  const { body, characterId }: RequestBody<InsCharacterReaction> =
    await req.json();

  try {
    const response = await insertReaction(characterId, body);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong. ", error: error },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug?: string[] | undefined }> }
) {
  const { slug } = await params;
  const { body, characterId }: RequestBody<CharacterReaction> =
    await req.json();

  try {
    const response = await deleteReaction(body.id);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong. ", error: error },
      { status: 500 }
    );
  }
}
