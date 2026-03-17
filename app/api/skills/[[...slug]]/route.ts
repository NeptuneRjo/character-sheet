import { deleteSkill, insertSkill } from "@/lib/database/queries";
import { CharacterSkill, InsCharacterSkill, RequestBody } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug?: string[] | undefined }> }
) {
  const { slug } = await params;
  const { characterId, body }: RequestBody<InsCharacterSkill> =
    await req.json();

  try {
    const response = await insertSkill(characterId, body);

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
  const { characterId, body }: RequestBody<CharacterSkill> = await req.json();

  try {
    const response = await deleteSkill(body.id);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong. ", error: error },
      { status: 500 }
    );
  }
}
