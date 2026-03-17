import {
  deleteWound,
  insertWound,
  updateWound,
} from "@/lib/database/queries/wounds";
import { InsWound, RequestBody, Wound } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { body, characterId }: RequestBody<InsWound> = await req.json();
  try {
    const wound = await insertWound(characterId, body);

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
  const { characterId, body }: RequestBody<Wound> = await req.json();

  try {
    const wounds = await deleteWound(body.id);

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug?: string[] | undefined }> }
) {
  const { slug } = await params;
  const { body, characterId }: RequestBody<Wound> = await req.json();

  try {
    const wounds = await updateWound(body);

    return NextResponse.json(wounds, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Something went wrong while updating a wound",
        error: error,
      },
      { status: 500 }
    );
  }
}
