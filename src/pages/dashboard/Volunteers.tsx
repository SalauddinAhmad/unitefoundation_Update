import { ApplicationsTable } from "@/components/dashboard/ApplicationsTable";
import { volunteerApps } from "@/data/dashboardMock";

const Volunteers = () => (
  <ApplicationsTable
    title="স্বেচ্ছাসেবক"
    subtitle="স্বেচ্ছাসেবক আবেদন পর্যালোচনা ও অনুমোদন করুন"
    data={volunteerApps}
  />
);

export default Volunteers;
