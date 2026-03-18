import {
  getCharacter,
  getCharacters,
  updateCharacter,
} from "@/lib/database/queries";
import { supabase } from "@/lib/supabaseClient";
import { Character, RequestBody, Sheet } from "@/lib/types";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug?: string[] | undefined }> }
) {
  const { slug } = await params;

  try {
    const response: Sheet | Character[] = slug
      ? await getCharacter(slug[0])
      : await getCharacters();

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong. ", error: error },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug?: string[] | undefined }> }
) {
  const { slug } = await params;
  const { body, characterId }: RequestBody<Partial<Character>> =
    await req.json();

  try {
    const character = await updateCharacter(characterId, body);

    return NextResponse.json(character, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      message: "Something went wrong while updating a character",
      error: error,
    });
  }
}
