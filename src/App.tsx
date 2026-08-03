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
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.tsx"));
const TermsConditions = lazy(() => import("./pages/TermsConditions.tsx"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy.tsx"));
const Subscribe = lazy(() => import("./pages/Subscribe.tsx"));


// Admin dashboard
const DashboardLayout = lazy(() => import("./components/dashboard/DashboardLayout.tsx"));
const RequireAuth = lazy(() => import("./components/dashboard/RequireAuth.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const DashOverview = lazy(() => import("./pages/dashboard/Overview.tsx"));
const DashDonations = lazy(() => import("./pages/dashboard/Donations.tsx"));
const DashVolunteers = lazy(() => import("./pages/dashboard/Volunteers.tsx"));
const DashMembers = lazy(() => import("./pages/dashboard/Members.tsx"));
const DashProjects = lazy(() => import("./pages/dashboard/Projects.tsx"));
const DashBlog = lazy(() => import("./pages/dashboard/Blog.tsx"));
const DashGallery = lazy(() => import("./pages/dashboard/Gallery.tsx"));
const DashMessages = lazy(() => import("./pages/dashboard/Messages.tsx"));
const DashNewsletter = lazy(() => import("./pages/dashboard/Newsletter.tsx"));
const DashCareers = lazy(() => import("./pages/dashboard/Careers.tsx"));
const DashTeam = lazy(() => import("./pages/dashboard/Team.tsx"));
const DashPartners = lazy(() => import("./pages/dashboard/Partners.tsx"));
const DashSettings = lazy(() => import("./pages/dashboard/Settings.tsx"));
const DashLogs = lazy(() => import("./pages/dashboard/ActivityLog.tsx"));
const DashForms = lazy(() => import("./pages/dashboard/FormsManager.tsx"));
const DashHelp = lazy(() => import("./pages/dashboard/Help.tsx"));
const DashProfile = lazy(() => import("./pages/dashboard/Profile.tsx"));

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
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/subscribe" element={<Subscribe />} />

            {/* Admin dashboard */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/dashboard" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
              <Route index element={<DashOverview />} />
              <Route path="donations" element={<RequireAuth permission="donations"><DashDonations /></RequireAuth>} />
              <Route path="volunteers" element={<RequireAuth permission="volunteers"><DashVolunteers /></RequireAuth>} />
              <Route path="members" element={<RequireAuth permission="members"><DashMembers /></RequireAuth>} />
              <Route path="projects" element={<RequireAuth permission="projects"><DashProjects /></RequireAuth>} />
              <Route path="blog" element={<RequireAuth permission="blog"><DashBlog /></RequireAuth>} />
              <Route path="gallery" element={<RequireAuth permission="gallery"><DashGallery /></RequireAuth>} />
              <Route path="messages" element={<RequireAuth permission="messages"><DashMessages /></RequireAuth>} />
              <Route path="newsletter" element={<RequireAuth permission="newsletter"><DashNewsletter /></RequireAuth>} />
              <Route path="careers" element={<RequireAuth permission="careers"><DashCareers /></RequireAuth>} />
              <Route path="team" element={<RequireAuth permission="team"><DashTeam /></RequireAuth>} />
              <Route path="partners" element={<RequireAuth permission="partners"><DashPartners /></RequireAuth>} />
              <Route path="settings" element={<RequireAuth permission="settings"><DashSettings /></RequireAuth>} />
              <Route path="forms" element={<RequireAuth permission="forms"><DashForms /></RequireAuth>} />
              <Route path="logs" element={<RequireAuth permission="logs"><DashLogs /></RequireAuth>} />
              <Route path="help" element={<RequireAuth permission="help"><DashHelp /></RequireAuth>} />

            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
