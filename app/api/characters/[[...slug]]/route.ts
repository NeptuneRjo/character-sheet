import { getCharacter, getCharacters } from "@/lib/database/queries";
import { Character, Sheet } from "@/lib/types";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug?: string[] | undefined }> }
) {
  const { slug } = await params;
  let response: Sheet | Character[];

  try {
    if (slug) {
      const query = await getCharacter(slug[0]);
      response = query;
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
