import { updateStats } from "@/lib/database/queries";
import { supabase } from "@/lib/supabaseClient";
import { RequestBody, Stats } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug?: string[] | undefined }> }
) {
  const { slug } = await params;
  const { body, characterId }: RequestBody<Stats> = await req.json();

  try {
    const stats = await updateStats(body.id, body);

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Something went wrong while updating the stats",
        error: error,
      },
      { status: 500 }
    );
  }
}
