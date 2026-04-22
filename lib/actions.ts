"use server";

import { createClient } from "@/lib/supabase/server";
import { BuilderBuild } from "@/app/api/types/types"
import {User} from "@supabase/auth-js";
import {redirect} from "next/navigation";

type BuildId = {
    id: string;
}

let redirectBuild = {}

export async function signInWithEmail(email: string) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithOtp({
        email: email
    })
}

export async function signInWithGoogle(build: BuilderBuild) {

    saveBuildForRedirect(build);

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: window.location.href,
        },
    });

    if (error) {
        console.error("Google sign-in error:", error.message);
        return;
    }
}

function saveBuildForRedirect(build: BuilderBuild) {
    redirectBuild = build;
}
export async function getBuildForRedirect() {
    const returnBuild = redirectBuild;
    redirectBuild = {};
    return returnBuild;
}

export async function testSaveBuild(build: BuilderBuild, name: string, buildId: string | null) {
    const supabase = await createClient();

    const user = await checkUser();
    if (!user) {
        return;
    }

    console.log("user: " + user);

    if (buildId) {
        const { data, error } = await supabase
            .from("test_builds")
            .update({
                build_data: build,
            })
            .eq("id", buildId)
            .eq("uuid", user.id)
            .select("*")

        if (error) {
            throw new Error(error.message);
        }

        return data;
    } else {
        const { data, error } = await supabase
            .from("test_builds")
            .insert({
                build_data: build,
                name: name.trim(),
                uuid: user.id
            })
            .select("*")

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }
}

export async function getData(user: User | null) {
    const supabase = await createClient();

    if (!user) return;

    const { data, error } = await supabase
        .from("test_builds")
        .select("*")
        .eq("uuid", user.id)

    return data;
}

export async function getBuild(id: string | null) {
    if (!id) return;

    const supabase = await createClient();

    const user = await checkUser();
    if (!user) {
        throw new Error("Not authenticated");
        return;
    }

    const { data, error } = await supabase
        .from("test_builds")
        .select("build_data")
        .eq("id", id)
        .eq("uuid", user.id)

    if (error) {
        return null;
    }

    if (!data || data.length === 0) {
        return null;
    }

    return data[0].build_data;

}

export async function deleteBuild(id: number | null) {
    if (!id) return;

    const supabase = await createClient();

    const user = await checkUser();
    if (!user) {
        throw new Error("Not authenticated");
        return;
    }

    const { data, error } = await supabase
        .from("test_builds")
        .delete()
        .eq("id", id)
        .eq("uuid", user.id)

    if (error) {
        return null;
    }

}

export async function saveBuild(build: BuilderBuild, name: string, buildId: string | null) {

    const supabase = await createClient();

    const user = await checkUser();
    if (!user) {
        return;
    }

    console.log("user: " + user);

    if (buildId) {
        const { data, error } = await supabase
            .from("test_builds")
            .update({
                build_data: build,
            })
            .eq("id", buildId)
            .eq("uuid", user.id)
            .select("*")

        if (error) {
            throw new Error(error.message);
        }

        return data;
    } else {
        const { data, error } = await supabase
            .from("test_builds")
            .insert({
                build_data: build,
                name: name.trim(),
                uuid: user.id
            })
            .select("*")

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }
}

export async function checkUser() {
    const supabase = await createClient();

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    return user;
}