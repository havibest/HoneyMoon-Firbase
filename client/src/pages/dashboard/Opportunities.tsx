// HONEYMOON — Opportunities Page
// Remote work, AI tasks, freelance gigs, language exchange & collaboration

import { useState } from "react";
import {
  Briefcase, Search, Globe, Code, Pen, Mic, BookOpen, Plus,
  MapPin, Clock, DollarSign, Users, ArrowRight, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";

const CATEGORIES = [
  { label: "All", value: "all", icon: Globe },
  { label: "Remote Work", value: "remote", icon: Globe },
  { label: "AI Tasks", value: "ai", icon: Code },
  { label: "Freelance", value: "freelance", icon: Briefcase },
  { label: "Language Exchange", value: "language", icon: BookOpen },
  { label: "Collaboration", value: "collab", icon: Mic },
  { label: "Writing", value: "writing", icon: Pen },
];

const OPPORTUNITIES = [
  {
    id: 1, title: "AI Data Labeling — English/French", type: "ai",
    company: "DataFlow AI", location: "Remote", pay: "$15–25/hr",
    tags: ["AI", "Language", "Flexible"], posted: "2h ago",
    applicants: 12, featured: true,
    description: "Label and annotate text data for AI training. Bilingual English/French preferred. Flexible hours, weekly payments.",
  },
  {
    id: 2, title: "Virtual Assistant for Tech Startup", type: "remote",
    company: "TechStart Inc.", location: "Remote", pay: "$800/mo",
    tags: ["Admin", "Communication", "Remote"], posted: "5h ago",
    applicants: 8, featured: false,
    description: "Manage emails, schedule meetings, handle social media. 20hrs/week. Must have reliable internet.",
  },
  {
    id: 3, title: "English–Swahili Language Partner", type: "language",
    company: "Individual", location: "Online", pay: "Exchange",
    tags: ["Language", "Culture", "Flexible"], posted: "1d ago",
    applicants: 5, featured: false,
    description: "Looking for a native Swahili speaker to exchange language skills. 2 sessions/week via Zoom.",
  },
  {
    id: 4, title: "React Developer — Part-time", type: "freelance",
    company: "WebAgency Pro", location: "Remote", pay: "$40/hr",
    tags: ["React", "TypeScript", "Remote"], posted: "2d ago",
    applicants: 23, featured: true,
    description: "Build and maintain React applications. 15–20hrs/week. Must know TypeScript and REST APIs.",
  },
  {
    id: 5, title: "Content Writer — Travel Niche", type: "writing",
    company: "TravelBlog Co.", location: "Remote", pay: "$0.10/word",
    tags: ["Writing", "Travel", "Creative"], posted: "3d ago",
    applicants: 31, featured: false,
    description: "Write engaging travel articles, destination guides, and hotel reviews. Min 1000 words/article.",
  },
  {
    id: 6, title: "Podcast Co-host — Tech & Culture", type: "collab",
    company: "PodNetwork", location: "Remote", pay: "Revenue Share",
    tags: ["Podcast", "Tech", "Culture"], posted: "4d ago",
    applicants: 7, featured: false,
    description: "Join our weekly tech & culture podcast as a co-host. Must be articulate and knowledgeable about tech trends.",
  },
  {
    id: 7, title: "Social Media Manager", type: "remote",
    company: "BrandBoost Agency", location: "Remote", pay: "$600/mo",
    tags: ["Social Media", "Marketing", "Creative"], posted: "5d ago",
    applicants: 19, featured: false,
    description: "Manage Instagram, Twitter, TikTok for 3 brands. Create content calendars and engage with followers.",
  },
  {
    id: 8, title: "Online Tutor — Mathematics", type: "freelance",
    company: "EduConnect", location: "Online", pay: "$20–35/hr",
    tags: ["Teaching", "Math", "Flexible"], posted: "1w ago",
    applicants: 14, featured: false,
    description: "Tutor high school and university students in mathematics. Flexible scheduling, $20 for beginners, $35 for advanced.",
  },
  {
    id: 9, title: "AI Voice Training — African Languages", type: "ai",
    company: "VoiceAI Labs", location: "Remote", pay: "$12/hr",
    tags: ["AI", "Voice", "Language"], posted: "1w ago",
    applicants: 6, featured: false,
    description: "Record voice samples in Yoruba, Igbo, Zulu, or Amharic for AI voice model training. 5–10hrs/week.",
  },
  {
    id: 10, title: "UI/UX Designer — Mobile App", type: "freelance",
    company: "AppStudio KE", location: "Remote", pay: "$30/hr",
    tags: ["Design", "Figma", "Mobile"], posted: "1w ago",
    applicants: 17, featured: true,
    description: "Design screens for a fintech mobile app. Must have Figma portfolio. 3-month contract.",
  },
  {
    id: 11, title: "French–English Interpreter (Part-time)", type: "language",
    company: "GlobalConnect", location: "Remote", pay: "$25/hr",
    tags: ["French", "English", "Interpretation"], posted: "2w ago",
    applicants: 9, featured: false,
    description: "Provide real-time interpretation for business meetings. Fluency in both French and English required.",
  },
  {
    id: 12, title: "Travel Vlogger Collaboration", type: "collab",
    company: "WanderCreators", location: "Worldwide", pay: "Sponsored",
    tags: ["Travel", "Video", "Social Media"], posted: "2w ago",
    applicants: 41, featured: false,
    description: "Looking for travel content creators to collaborate on sponsored trips. Must have 5K+ followers.",
  },
];

const TYPE_ICONS: Record<string, any> = {
  ai: Code, remote: Globe, freelance: Briefcase,
  language: BookOpen, collab: Mic, writing: Pen,
};

const TYPE_COLORS: Record<string, string> = {
  ai: "bg-violet-50 text-violet-600",
  remote: "bg-blue-50 text-blue-600",
  freelance: "bg-amber-50 text-amber-600",
  language: "bg-green-50 text-green-600",
  collab: "bg-pink-50 text-pink-600",
  writing: "bg-orange-50 text-orange-600",
};

export default function OpportunitiesPage() {
  const { profile } = useAuth();
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<typeof OPPORTUNITIES[0] | null>(null);
  const [postOpen, setPostOpen] = useState(false);
  const [postForm, setPostForm] = useState({ title: "", type: "remote", pay: "", description: "" });

  const filtered = OPPORTUNITIES.filter((o) =>
    (category === "all" || o.type === category) &&
    (
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.company.toLowerCase().includes(search.toLowerCase()) ||
      o.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    )
  );

  const featured = filtered.filter((o) => o.featured);
  const regular = filtered.filter((o) => !o.featured);

  const handleApply = (opp: typeof OPPORTUNITIES[0]) => {
    toast.success(`Application submitted for "${opp.title}"! The poster will contact you soon.`);
  };

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Opportunity posted! It will be reviewed and published shortly.");
    setPostOpen(false);
    setPostForm({ title: "", type: "remote", pay: "", description: "" });
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-['Playfair_Display'] text-3xl font-bold text-foreground">Opportunities</h1>
          <p className="mt-1 text-muted-foreground">Remote work, AI tasks, freelance gigs & language exchange</p>
        </div>
        <Dialog open={postOpen} onOpenChange={setPostOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shrink-0">
              <Plus size={16} />
              Post Opportunity
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-['Playfair_Display']">Post an Opportunity</DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePost} className="space-y-4 mt-2">
              <div>
                <Label className="text-sm mb-1 block">Title</Label>
                <Input
                  placeholder="e.g. React Developer — Part-time"
                  value={postForm.title}
                  onChange={(e) => setPostForm((p) => ({ ...p, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Category</Label>
                <Select value={postForm.type} onValueChange={(v) => setPostForm((p) => ({ ...p, type: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote Work</SelectItem>
                    <SelectItem value="ai">AI Tasks</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="language">Language Exchange</SelectItem>
                    <SelectItem value="collab">Collaboration</SelectItem>
                    <SelectItem value="writing">Writing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm mb-1 block">Pay / Compensation</Label>
                <Input
                  placeholder="e.g. $20/hr, $500/mo, Exchange"
                  value={postForm.pay}
                  onChange={(e) => setPostForm((p) => ({ ...p, pay: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Description</Label>
                <Textarea
                  placeholder="Describe the opportunity, requirements, and how to apply..."
                  value={postForm.description}
                  onChange={(e) => setPostForm((p) => ({ ...p, description: e.target.value }))}
                  rows={4}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Post Opportunity</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-5 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by title, company, or skill..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              category === c.value
                ? "bg-primary text-primary-foreground"
                : "border border-border hover:border-primary hover:text-primary"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Star size={16} className="text-amber-500" fill="currentColor" />
            <h2 className="font-semibold text-sm text-foreground">Featured</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {featured.map((opp) => <OpportunityCard key={opp.id} opp={opp} onApply={handleApply} onView={setSelected} />)}
          </div>
        </div>
      )}

      {/* All */}
      {regular.length > 0 && (
        <div>
          {featured.length > 0 && <h2 className="font-semibold text-sm text-foreground mb-3">All Opportunities</h2>}
          <div className="grid gap-4 md:grid-cols-2">
            {regular.map((opp) => <OpportunityCard key={opp.id} opp={opp} onApply={handleApply} onView={setSelected} />)}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="py-16 text-center">
          <Briefcase size={40} className="mx-auto mb-3 text-muted-foreground/30" />
          <p className="font-semibold text-foreground">No opportunities found</p>
          <p className="text-sm text-muted-foreground mt-1">Try a different search or category</p>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        {selected && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TYPE_COLORS[selected.type] || "bg-muted text-muted-foreground"}`}>
                  {(() => { const Icon = TYPE_ICONS[selected.type] || Briefcase; return <Icon size={20} />; })()}
                </div>
                <div>
                  <DialogTitle className="text-base font-semibold leading-tight">{selected.title}</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">{selected.company}</p>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin size={14} />{selected.location}</span>
                <span className="flex items-center gap-1"><DollarSign size={14} />{selected.pay}</span>
                <span className="flex items-center gap-1"><Clock size={14} />{selected.posted}</span>
                <span className="flex items-center gap-1"><Users size={14} />{selected.applicants} applicants</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{selected.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {selected.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                ))}
              </div>
              <Button className="w-full gap-2" onClick={() => { handleApply(selected); setSelected(null); }}>
                Apply Now <ArrowRight size={16} />
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </DashboardLayout>
  );
}

function OpportunityCard({
  opp,
  onApply,
  onView,
}: {
  opp: typeof OPPORTUNITIES[0];
  onApply: (o: typeof OPPORTUNITIES[0]) => void;
  onView: (o: typeof OPPORTUNITIES[0]) => void;
}) {
  const Icon = TYPE_ICONS[opp.type] || Briefcase;
  const colorClass = TYPE_COLORS[opp.type] || "bg-muted text-muted-foreground";

  return (
    <Card className="group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
            <Icon size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-foreground text-sm leading-tight">{opp.title}</h3>
              {opp.featured && (
                <Badge className="bg-amber-100 text-amber-700 text-xs shrink-0">Featured</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{opp.company} · {opp.location}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {opp.tags.slice(0, 3).map((t) => (
                <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-semibold text-primary text-sm">{opp.pay}</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users size={12} />
                <span>{opp.applicants}</span>
                <span>·</span>
                <span>{opp.posted}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onView(opp)}>
            View Details
          </Button>
          <Button size="sm" className="flex-1" onClick={() => onApply(opp)}>
            Apply
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
