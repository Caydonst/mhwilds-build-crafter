import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);

    const tokenHash = requestUrl.searchParams.get("token_hash");
    const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
    const next = requestUrl.searchParams.get("next") ?? "/update-password";

    if (!tokenHash || !type) {
        return NextResponse.redirect(
            new URL("/?authError=invalid-reset-link", requestUrl.origin),
        );
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
    });

    if (error) {
        console.error("Password recovery verification failed:", error);

        return NextResponse.redirect(
            new URL("/?authError=invalid-reset-link", requestUrl.origin),
        );
    }

    return NextResponse.redirect(
        new URL(next, requestUrl.origin),
    );
}