"use client";

import { useState } from "react";

import { type Locale } from "@/components/language-picker";
import { type AttackDefenseRowViewModel } from "@/lib/workspace-source";
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
  const tabIdPrefix = "reports-tabs";
  const tabs = [
    { value: "results", label: copy.reportTabs.results },
    { value: "compare", label: copy.reportTabs.compare },
  ];

  return (
    <div className="space-y-4">
      <Tabs idPrefix={tabIdPrefix} value={activeTab} onChange={setActiveTab} tabs={tabs} />

      <TabPanel idPrefix={tabIdPrefix} value="results" activeValue={activeTab}>
        {resultsContent}
      </TabPanel>

      <TabPanel idPrefix={tabIdPrefix} value="compare" activeValue={activeTab}>
        <CompareView rows={rows} locale={locale} />
      </TabPanel>
    </div>
  );
}
