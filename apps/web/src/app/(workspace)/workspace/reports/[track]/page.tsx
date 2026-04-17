import {
  renderTrackReportPage,
  type TrackReportPageSearchParams,
} from "./track-report-page";

export const dynamic = "force-dynamic";

type TrackReportPageProps = {
  params: Promise<{ track: string }>;
  searchParams?: Promise<TrackReportPageSearchParams>;
};

export default async function TrackReportPage(props: TrackReportPageProps) {
  const resolvedParams = await props.params;
  const resolvedSearchParams = props.searchParams ? await props.searchParams : {};

  return renderTrackReportPage({
    params: resolvedParams,
    searchParams: resolvedSearchParams,
  });
}
