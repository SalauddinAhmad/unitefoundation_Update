import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const Projects = lazy(() => import("./pages/Projects.tsx"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail.tsx"));
const Donate = lazy(() => import("./pages/Donate.tsx"));
const Blog = lazy(() => import("./pages/Blog.tsx"));
const BlogPost = lazy(() => import("./pages/BlogPost.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Gallery = lazy(() => import("./pages/Gallery.tsx"));
const Contact = lazy(() => import("./pages/Contact.tsx"));
const Volunteer = lazy(() => import("./pages/Volunteer.tsx"));
const PartnerDetail = lazy(() => import("./pages/PartnerDetail.tsx"));

// Admin dashboard
const DashboardLayout = lazy(() => import("./components/dashboard/DashboardLayout.tsx"));
const DashOverview = lazy(() => import("./pages/dashboard/Overview.tsx"));
const DashDonations = lazy(() => import("./pages/dashboard/Donations.tsx"));
const DashVolunteers = lazy(() => import("./pages/dashboard/Volunteers.tsx"));
const DashMembers = lazy(() => import("./pages/dashboard/Members.tsx"));
const DashProjects = lazy(() => import("./pages/dashboard/Projects.tsx"));
const DashBlog = lazy(() => import("./pages/dashboard/Blog.tsx"));
const DashGallery = lazy(() => import("./pages/dashboard/Gallery.tsx"));
const DashMessages = lazy(() => import("./pages/dashboard/Messages.tsx"));
const DashCareers = lazy(() => import("./pages/dashboard/Careers.tsx"));
const DashSettings = lazy(() => import("./pages/dashboard/Settings.tsx"));

const queryClient = new QueryClient();

const Loader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/about" element={<About />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/volunteer" element={<Volunteer />} />
            <Route path="/partners/:slug" element={<PartnerDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
