import { Suspense, cache, use } from "react";
import { useParams } from "react-router";
import { useSearchParams } from "@/lib/router/navigation";

import { renderTrackReportPage } from "./track-report-page";

const renderTrackReport = cache(
  (
    track: string,
    view?: string,
    job?: string,
    contract?: string,
    model?: string,
    auc?: string,
  ) =>
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
