"use client";

import { useState } from "react";

import { type Locale } from "@/components/language-picker";
import { type AttackDefenseRowViewModel } from "@/lib/attack-defense-table";
import { Tabs, TabPanel } from "@/components/tabs";
import { CompareView } from "@/components/compare-view";

const REPORT_TABS = [
  { value: "results", label: "审计结果" },
  { value: "compare", label: "对比分析" },
];

const REPORT_TABS_EN = [
  { value: "results", label: "Results" },
  { value: "compare", label: "Compare" },
];

interface ReportsClientProps {
  rows: AttackDefenseRowViewModel[];
  locale: Locale;
  resultsContent: React.ReactNode;
}

export function ReportsClient({ rows, locale, resultsContent }: ReportsClientProps) {
  const tabs = locale === "zh-CN" ? REPORT_TABS : REPORT_TABS_EN;
  const [activeTab, setActiveTab] = useState("results");

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
