import {
  deleteWound,
  insertWound,
  updateWound,
} from "@/lib/database/queries/wounds";
import { supabase } from "@/lib/supabaseClient";
import {
  InsWound,
  Payload,
  PostWoundBody,
  RequestBody,
  Wound,
} from "@/lib/types";
import { createWound, getWoundName } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { body, characterUID }: RequestBody<InsWound> = await req.json();
  try {
    const wound = await insertWound(characterUID, body);

    const channel = supabase.channel(`player:${characterUID}`);
    const payload: Payload = {
      data: wound,
      event: "INSERT",
      table: "wounds",
    };

    channel.send({
      type: "broadcast",
      event: "shout",
      payload: payload,
    });

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
  const { characterUID }: RequestBody<null> = await req.json();

  if (slug) {
    try {
      const wounds = await deleteWound(Number(slug[0]));

      const channel = supabase.channel(`player:${characterUID}`);
      const payload: Payload = {
        data: wounds,
        event: "DELETE",
        table: "wounds",
      };

      channel.send({
        type: "broadcast",
        event: "shout",
        payload: payload,
      });

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
  const { body, characterUID }: RequestBody<Wound> = await req.json();

  if (slug) {
    try {
      const wounds = await updateWound(Number(slug[0]), body);

      const channel = supabase.channel(`player:${characterUID}`);
      const payload: Payload = {
        data: wounds,
        event: "UPDATE",
        table: "wounds",
      };

      channel.send({
        type: "broadcast",
        event: "shout",
        payload: payload,
      });

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
  return NextResponse.json(
    { message: "Invalid request. Provide a wound ID in the route." },
    { status: 400 }
  );
}
