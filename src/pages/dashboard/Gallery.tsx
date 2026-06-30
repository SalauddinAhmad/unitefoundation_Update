import { Card, PageHeader, Btn } from "@/components/dashboard/DashboardUI";
import { useGallery } from "@/hooks/api/useDashboardData";
import { Plus, Upload, ImageIcon, Trash2, Edit3, Calendar } from "lucide-react";

const Gallery = () => {
  const { data = [] } = useGallery();
  const galleryItems = data as Array<{ id: string; title: string; album: string; date: string; count: number }>;
  return (
  <>
    <PageHeader
      title="গ্যালারি"
      subtitle="অ্যালবাম, ছবি ও ভিডিও আপলোড ম্যানেজ করুন"
      actions={
        <>
          <Btn variant="outline"><Upload className="h-4 w-4" /> ছবি আপলোড</Btn>
          <Btn><Plus className="h-4 w-4" /> নতুন অ্যালবাম</Btn>
        </>
      }
    />

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {galleryItems.map((g) => (
        <Card key={g.id} pad={false} className="overflow-hidden group">
          <div className="aspect-video bg-gradient-to-br from-primary/20 via-accent to-primary/10 flex items-center justify-center relative">
            <ImageIcon className="h-12 w-12 text-primary/50" />
            <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-foreground/70 text-white text-xs font-bold backdrop-blur">
              {g.count} ছবি
            </div>
          </div>
          <div className="p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-primary">{g.album}</div>
            <h3 className="font-bold mt-1.5 leading-snug">{g.title}</h3>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{g.date}</span>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"><Edit3 className="h-3.5 w-3.5" /></button>
                <button className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </>
  );
};

export default Gallery;
