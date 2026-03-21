import {
  deleteEquipment,
  insertEquipment,
  updateEquipment,
} from "@/lib/database/queries";
import {
  CharacterEquipment,
  InsCharacterEquipment,
  RequestBody,
} from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug?: string[] | undefined }> }
) {
  const { slug } = await params;
  const { body, characterId }: RequestBody<InsCharacterEquipment> =
    await req.json();

  try {
    const response = await insertEquipment(characterId, body);

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
  const { body, characterId }: RequestBody<CharacterEquipment> =
    await req.json();

  try {
    const response = await updateEquipment(body);

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
  const { body, characterId }: RequestBody<CharacterEquipment> =
    await req.json();

  try {
    const response = await deleteEquipment(body.id);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong. ", error: error },
      { status: 500 }
    );
  }
}
