import { updateStats } from "@/lib/database/queries";
import { supabase } from "@/lib/supabaseClient";
import { Payload, RequestBody, Stats } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug?: string[] | undefined }> }
) {
  const { slug } = await params;
  const { body, characterUID }: RequestBody<Stats> = await req.json();

  if (slug) {
    try {
      const stats = await updateStats(Number(slug[0]), body);

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
  return NextResponse.json(
    { message: "Invalid request. Provide a stat ID in the route." },
    { status: 400 }
  );
}
