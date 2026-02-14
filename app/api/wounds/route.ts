import { insertWound } from "@/lib/database/queries/wounds";
import { PostWoundBody } from "@/lib/types";
import { createWound, getWoundName } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body: PostWoundBody = await req.json();
  try {
    const woundName = getWoundName(body.threshold, body.damageType);
    const newWound = createWound(woundName);
    const wound = await insertWound(body.characterUID, newWound);

    return NextResponse.json(wound, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Something went wrong while creating a new wound.",
        error: error,
      },
      { status: 500 }
    );
  }
}
