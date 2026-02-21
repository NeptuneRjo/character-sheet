import { deleteWound, insertWound } from "@/lib/database/queries/wounds";
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug?: string[] | undefined }> }
) {
  const { slug } = await params;

  if (slug) {
    try {
      const wounds = await deleteWound(Number(slug[0]));
      return NextResponse.json(wounds, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        {
          message: "Something went wrong while deleting a wound",
          error: error,
        },
        { status: 500 }
      );
    }
  }
  return NextResponse.json(
    { message: "Invalid request. Provide a wound ID in the route." },
    { status: 400 }
  );
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug?: string[] | undefined }> }
) {
  const { slug } = await params;
  // let response: Sheet | Character[];
}
