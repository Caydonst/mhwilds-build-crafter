import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);

    const tokenHash = requestUrl.searchParams.get("token_hash");
    const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
    const next = requestUrl.searchParams.get("next") ?? "/update-password";

    console.log("Recovery URL:", request.url);
    console.log("tokenHash:", tokenHash);
    console.log("type:", type);
    console.log("next:", next);

    if (!tokenHash || !type) {
        console.error("Missing token_hash or type");

        return NextResponse.redirect(
            new URL("/?authError=missing-reset-params", requestUrl.origin)
        );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
    });

    console.log("verifyOtp data:", data);
    console.log("verifyOtp error:", error);

    if (error) {
        return NextResponse.redirect(
            new URL(
                `/?authError=${encodeURIComponent(error.message)}`,
                requestUrl.origin
            )
        );
    }

    return NextResponse.redirect(
        new URL(next, requestUrl.origin)
    );
}