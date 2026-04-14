import { type Locale } from "@/components/language-picker";
import { StatusBadge } from "@/components/status-badge";
import { CreateJobButton } from "@/components/create-job-button";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

type ContractEntry = {
  contractKey: string;
  label: string;
  availability: string;
  systemGap: string;
  bestWorkspace: string;
};

type ContractsTableProps = {
  contracts: ContractEntry[];
  locale: Locale;
};

export function ContractsTable({ contracts, locale }: ContractsTableProps) {
  const copy = WORKSPACE_COPY[locale].audits;

  if (contracts.length === 0) {
    return (
      <div className="px-3 py-4 text-xs text-muted-foreground text-center">
        {copy.emptyContracts}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">Contract</th>
            <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">Status</th>
            <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">System Gap</th>
            <th className="px-3 py-1.5 text-left font-semibold text-muted-foreground">Workspace</th>
            <th className="px-3 py-1.5 text-right font-semibold text-muted-foreground">Action</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((entry, index) => (
            <tr
              key={entry.contractKey}
              className={`border-b border-border transition-colors hover:bg-muted/30 ${
                index % 2 === 0 ? "bg-background" : "bg-muted/10"
              }`}
            >
              <td className="px-3 py-2">
                <div className="font-medium text-sm">{entry.label}</div>
                <div className="mono mt-0.5 text-[10px] text-muted-foreground">{entry.contractKey}</div>
              </td>
              <td className="px-3 py-2">
                <StatusBadge
                  tone={
                    entry.availability === "ready"
                      ? "success"
                      : entry.availability === "partial"
                        ? "warning"
                        : "info"
                  }
                >
                  {entry.availability}
                </StatusBadge>
              </td>
              <td className="px-3 py-2 max-w-xs">
                <div className="text-muted-foreground line-clamp-2 text-xs">{entry.systemGap}</div>
              </td>
              <td className="px-3 py-2">
                <span className="text-muted-foreground text-xs">{entry.bestWorkspace}</span>
              </td>
              <td className="px-3 py-2 text-right">
                <CreateJobButton contractKey={entry.contractKey} label={copy.createJob} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
