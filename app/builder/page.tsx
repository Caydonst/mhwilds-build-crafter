import { Suspense } from "react";
import BuilderClient from "./builderClient";

function BuilderFallback() {
    return <div>Loading builder...</div>;
}

export default function Page() {
    return (
        <Suspense fallback={<BuilderFallback />}>
            <BuilderClient />
        </Suspense>
    );
}