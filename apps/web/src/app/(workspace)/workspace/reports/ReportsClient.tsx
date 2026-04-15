"use client";

import { useState } from "react";

import { type Locale } from "@/components/language-picker";
import { type AttackDefenseRowViewModel } from "@/lib/attack-defense-table";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";
import { Tabs, TabPanel } from "@/components/tabs";
import { CompareView } from "@/components/compare-view";

interface ReportsClientProps {
  rows: AttackDefenseRowViewModel[];
  locale: Locale;
  resultsContent: React.ReactNode;
}

export function ReportsClient({ rows, locale, resultsContent }: ReportsClientProps) {
  const copy = WORKSPACE_COPY[locale].reports;
  const [activeTab, setActiveTab] = useState("results");
  const tabs = [
    { value: "results", label: copy.reportTabs.results },
    { value: "compare", label: copy.reportTabs.compare },
  ];

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onChange={setActiveTab} tabs={tabs} />

      <TabPanel value="results" activeValue={activeTab}>
        {resultsContent}
      </TabPanel>

      <TabPanel value="compare" activeValue={activeTab}>
        <CompareView rows={rows} locale={locale} />
      </TabPanel>
    </div>
  );
}
