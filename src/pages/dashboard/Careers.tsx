import { ApplicationsTable } from "@/components/dashboard/ApplicationsTable";
import { useCareerApps } from "@/hooks/api/useDashboardData";
import { EXTRAS } from "@/lib/localExtras";

const Careers = () => {
  const { data = [] } = useCareerApps();
  return (
    <ApplicationsTable
      title="ক্যারিয়ার আবেদন"
      subtitle="চাকরি প্রার্থীদের আবেদন পর্যালোচনা করুন"
      data={data}
      extrasBucket={EXTRAS.careers}
      idPrefix="JOB"
      typeOptions={[
        { value: "প্রোগ্রাম অফিসার", label: "প্রোগ্রাম অফিসার" },
        { value: "একাউন্টস / ফাইন্যান্স", label: "একাউন্টস / ফাইন্যান্স" },
        { value: "সফটওয়্যার / আইটি", label: "সফটওয়্যার / আইটি" },
        { value: "মিডিয়া / কনটেন্ট", label: "মিডিয়া / কনটেন্ট" },
        { value: "ফিল্ড অফিসার", label: "ফিল্ড অফিসার" },
      ]}
    />
  );
};

export default Careers;
