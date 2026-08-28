import { Suspense, use } from "react";
import { useParams } from "react-router";
import { useSearchParams } from "@/lib/router/navigation";

import { stableLoad } from "@/lib/stable-promise";
import { isWorkspaceDemoModeEnabled } from "@/lib/workspace-source";

import { renderTrackReportPage } from "./track-report-page";

const renderTrackReport = (
  track: string,
  view?: string,
  job?: string,
  contract?: string,
  model?: string,
  auc?: string,
) =>
  stableLoad(
    `track:${track}|${view ?? ""}|${job ?? ""}|${contract ?? ""}|${model ?? ""}|${auc ?? ""}:${isWorkspaceDemoModeEnabled() ? "demo" : "live"}`,
    () =>
      renderTrackReportPage({
        params: { track },
        searchParams: { view, job, contract, model, auc },
      }),
  );

type TrackReportLoadedProps = {
  track: string;
  view?: string;
  job?: string;
  contract?: string;
  model?: string;
  auc?: string;
};

function TrackReportLoaded({ track, view, job, contract, model, auc }: TrackReportLoadedProps) {
  return use(renderTrackReport(track, view, job, contract, model, auc));
}

export default function TrackReportPage() {
  const { track } = useParams();
  const searchParams = useSearchParams();

  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <TrackReportLoaded
        track={track ?? ""}
        view={searchParams.get("view") ?? undefined}
        job={searchParams.get("job") ?? undefined}
        contract={searchParams.get("contract") ?? undefined}
        model={searchParams.get("model") ?? undefined}
        auc={searchParams.get("auc") ?? undefined}
      />
    </Suspense>
  );
}
