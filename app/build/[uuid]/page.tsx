import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import type { BuilderBuild } from "@/app/api/types/types";

import SharedBuildClient from "./sharedBuildClient";

type Props = {
    params: Promise<{
        uuid: string;
    }>;
};

export default async function SharedBuildPage({
    params,
}: Props) {
    const { uuid } = await params;

    const supabase = await createClient();

    const { data, error } = await supabase
        .from("shared_builds")
        .select(`
            build_name,
            build_data
        `)
        .eq("id", uuid)
        .single();

    if (error || !data) {
        notFound();
    }

    return (
        <SharedBuildClient
            build={data.build_data as BuilderBuild}
            buildName={data.build_name}
        />
    );
}