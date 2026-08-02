import { ApplicationsTable } from "@/components/dashboard/ApplicationsTable";
import { useVolunteerApps } from "@/hooks/api/useDashboardData";
import { EXTRAS } from "@/lib/localExtras";

const Volunteers = () => {
  const { data = [] } = useVolunteerApps();
  return (
    <ApplicationsTable
      kind="volunteer"
      title="স্বেচ্ছাসেবক"
      subtitle="স্বেচ্ছাসেবক আবেদন পর্যালোচনা ও অনুমোদন করুন"
      data={data}
      extrasBucket={EXTRAS.volunteers}
      idPrefix="VOL"
      typeOptions={[
        { value: "ত্রাণ বিতরণ", label: "ত্রাণ বিতরণ" },
        { value: "শিক্ষা মেন্টরশিপ", label: "শিক্ষা মেন্টরশিপ" },
        { value: "মিডিয়া ও কনটেন্ট", label: "মিডিয়া ও কনটেন্ট" },
        { value: "স্বাস্থ্যসেবা ক্যাম্প", label: "স্বাস্থ্যসেবা ক্যাম্প" },
        { value: "ফান্ডরাইজিং", label: "ফান্ডরাইজিং" },
        { value: "জেলা প্রতিনিধি", label: "জেলা প্রতিনিধি" },
      ]}
    />
  );
};

export default Volunteers;
