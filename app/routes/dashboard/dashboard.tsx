// eslint-disable no-empty-pattern
import { SectionCards } from "~/components/dashboard/site-cards";
import { ChartAreaInteractive } from "~/components/dashboard/chart-area-interactive";

import data from "./data.json";
import { DataTable } from "~/components/dashboard/data-table";
import type { Route } from "./+types/dashboard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Inicio" },
    { name: "description", content: "Dashboard" },
  ];
}

const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </div>
  );
};

export default DashboardPage;
