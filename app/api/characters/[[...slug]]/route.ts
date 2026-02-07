import { getCharacter, getCharacters } from "@/lib/database/queries";
import { Character, CharacterList } from "@/lib/types";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  let response: Character | CharacterList[];

  try {
    if (slug[0]) {
      const query = await getCharacter(slug[0]);
      response = query as Character;
      // response = await getCharacter(slug[0]);
    } else {
      response = await getCharacters();
    }
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong. ", error: error },
      { status: 500 }
    );
  }
}
