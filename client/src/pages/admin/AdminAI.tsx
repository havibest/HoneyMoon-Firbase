// HONEYMOON — Admin AI Profiles
// Manage AI profiles used in the discover/swipe engine

import { useState, useMemo, useEffect } from "react";
import {
  Bot, Plus, Edit2, Trash2, Search, MapPin, Briefcase,
  Eye, CheckCircle, X, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import AdminLayout from "@/components/layout/AdminLayout";
import DataPagination from "@/components/DataPagination";
import { AI_PROFILES } from "@/data/aiProfiles";
import type { AIProfile } from "@/types";

type GenderFilter = "all" | "female" | "male" | "non-binary";
const PAGE_SIZE = 12;

export default function AdminAI() {
  const [profiles, setProfiles] = useState<AIProfile[]>(AI_PROFILES);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [selected, setSelected] = useState<AIProfile | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const refresh = () => {
    setLoading(true);
    setProfiles([...AI_PROFILES]);
    setTimeout(() => setLoading(false), 300);
  };

  const filtered = profiles.filter((p) => {
    const matchesSearch =
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase()) ||
      p.country.toLowerCase().includes(search.toLowerCase()) ||
      p.occupation.toLowerCase().includes(search.toLowerCase());
    const matchesGender = genderFilter === "all" || p.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  useEffect(() => { setPage(1); }, [search, genderFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  const handleDelete = (id: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirm(null);
    toast.success("AI profile removed");
  };

  const toggleVerified = (id: string) => {
    setProfiles((prev) => prev.map((p) => p.id === id ? { ...p, verified: !p.verified } : p));
    toast.success("Profile updated");
  };

  const genderCounts = {
    all: profiles.length,
    female: profiles.filter((p) => p.gender === "female").length,
    male: profiles.filter((p) => p.gender === "male").length,
    "other": profiles.filter((p) => p.gender === "other").length,
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-['Playfair_Display'] text-3xl font-bold text-foreground">AI Profiles</h1>
          <p className="mt-1 text-muted-foreground">{profiles.length} profiles · {profiles.filter((p) => p.verified).length} verified</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading} className="gap-2">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />Refresh
          </Button>
          <Button className="gap-2" onClick={() => toast.info("AI profile creation wizard coming soon!")}>
            <Plus size={16} />
            Add Profile
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, city, country, or occupation..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Gender filter */}
      <div className="mb-5 flex flex-wrap gap-2">
        {(["all", "female", "male", "other"] as GenderFilter[]).map((g) => (
          <button
            key={g}
            onClick={() => setGenderFilter(g)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all capitalize ${
              genderFilter === g
                ? "bg-primary text-primary-foreground"
                : "border border-border hover:border-primary hover:text-primary"
            }`}
          >
            {g} ({genderCounts[g as keyof typeof genderCounts] ?? 0})
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {pageItems.map((ai) => (
          <Card key={ai.id} className="overflow-hidden group hover:shadow-md transition-shadow">
            <div className="relative aspect-[3/4] overflow-hidden bg-muted">
              <img
                src={ai.photos[0]}
                alt={ai.firstName}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${ai.firstName}+${ai.lastName}&background=f9a8d4&color=9f1239&size=400`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="font-semibold text-white text-sm">{ai.firstName} {ai.lastName}, {ai.age}</p>
                <p className="text-white/80 text-xs flex items-center gap-1">
                  <MapPin size={10} />{ai.city}, {ai.country}
                </p>
              </div>
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                <Badge className="bg-primary/90 text-white text-xs">
                  <Bot size={9} className="mr-1" />AI
                </Badge>
                {ai.verified && (
                  <Badge className="bg-blue-500/90 text-white text-xs">
                    <CheckCircle size={9} className="mr-1" />Verified
                  </Badge>
                )}
              </div>
            </div>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                <Briefcase size={11} />{ai.occupation}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-1.5 text-xs"
                  onClick={() => setSelected(ai)}
                >
                  <Eye size={12} />
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-1.5 text-xs"
                  onClick={() => toast.info("Edit coming soon!")}
                >
                  <Edit2 size={12} />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive border-destructive/30 hover:bg-destructive/5"
                  onClick={() => setDeleteConfirm(ai.id)}
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Bot size={40} className="mx-auto mb-3 text-muted-foreground/30" />
            <p className="font-semibold text-foreground">No profiles found</p>
            <p className="text-sm text-muted-foreground mt-1">Try a different search or filter</p>
          </CardContent>
        </Card>
      ) : (
        <DataPagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
      )}

      {/* Profile Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        {selected && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-['Playfair_Display']">AI Profile Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="flex gap-4">
                <img
                  src={selected.photos[0]}
                  alt={selected.firstName}
                  className="h-24 w-24 rounded-xl object-cover shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${selected.firstName}&background=f9a8d4&color=9f1239&size=200`;
                  }}
                />
                <div>
                  <h3 className="font-semibold text-lg text-foreground">{selected.firstName} {selected.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{selected.age} · {selected.gender}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin size={12} />{selected.city}, {selected.country}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge className="bg-primary/10 text-primary text-xs"><Bot size={10} className="mr-1" />AI Profile</Badge>
                    {selected.verified && <Badge className="bg-blue-100 text-blue-700 text-xs">Verified</Badge>}
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-muted/50 p-4 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Occupation</p>
                    <p className="font-medium text-foreground">{selected.occupation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Interested In</p>
                    <p className="font-medium text-foreground capitalize">{selected.interestedIn}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Languages</p>
                    <p className="font-medium text-foreground">{(selected as any).languages?.join(", ") || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Photos</p>
                    <p className="font-medium text-foreground">{selected.photos.length} photos</p>
                  </div>
                </div>
              </div>

              {selected.bio && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Bio</p>
                  <p className="text-sm text-foreground leading-relaxed">{selected.bio}</p>
                </div>
              )}

              {selected.interests && selected.interests.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Interests</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.interests.map((interest) => (
                      <Badge key={interest} variant="secondary" className="text-xs">{interest}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => { toggleVerified(selected.id); setSelected(null); }}
                >
                  {selected.verified ? <><X size={16} />Remove Verification</> : <><CheckCircle size={16} />Verify Profile</>}
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
                  onClick={() => { setDeleteConfirm(selected.id); setSelected(null); }}
                >
                  <Trash2 size={16} />
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-['Playfair_Display']">Delete AI Profile?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-2">
            This will permanently remove this AI profile from the discover engine. This action cannot be undone.
          </p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button
              className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Delete Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
