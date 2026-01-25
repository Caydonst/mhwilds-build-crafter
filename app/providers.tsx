// app/providers.tsx
"use client";

import { SWRConfig } from "swr";
import React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SWRConfig
            value={{
                revalidateOnFocus: false,
                dedupingInterval: 60_000, // 1 min: repeated mounts won't refetch
            }}
        >
            {children}
        </SWRConfig>
    );
}
