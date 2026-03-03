import {
  getCharacter,
  getCharacters,
  getGMCharacters,
} from "@/lib/database/queries";
import { Character, Panel, Sheet } from "@/lib/types";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug?: string[] | undefined }> }
) {
  const { slug } = await params;

  try {
    const characters = await getCharacters();
    const panels = characters.map(async (character) => {
      const panel = await getGMCharacters(character.character_uid);
      return panel;
    });

    const response = await Promise.all(panels);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong. ", error: error },
      { status: 500 }
    );
  }
}
