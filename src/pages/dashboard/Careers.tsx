import { ApplicationsTable } from "@/components/dashboard/ApplicationsTable";
import { careerApps } from "@/data/dashboardMock";

const Careers = () => (
  <ApplicationsTable
    title="ক্যারিয়ার আবেদন"
    subtitle="চাকরি প্রার্থীদের আবেদন পর্যালোচনা করুন"
    data={careerApps}
  />
);

export default Careers;
