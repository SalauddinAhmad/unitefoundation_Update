import { ApplicationsTable } from "@/components/dashboard/ApplicationsTable";
import { memberApps } from "@/data/dashboardMock";

const Members = () => (
  <ApplicationsTable
    title="সদস্যপদ"
    subtitle="আজীবন ও দাতা সদস্যপদের আবেদন ম্যানেজ করুন"
    data={memberApps}
  />
);

export default Members;
