// HONEYMOON — Admin Referrals
import { useState, useEffect, useMemo, useCallback } from "react";
import { Users, CheckCircle2, Clock, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import AdminLayout from "@/components/layout/AdminLayout";
import DataPagination from "@/components/DataPagination";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

const PAGE_SIZE = 10;

function fmtDate(ts: any) {
  if (!ts) return "—";
  const d = typeof ts.toDate === "function" ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminReferrals() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    return getDocs(query(collection(db, "referrals"), orderBy("createdAt", "desc")))
      .then((snap) => {
        setReferrals(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const paid = referrals.filter((r) => r.paid).length;
  const totalPages = Math.max(1, Math.ceil(referrals.length / PAGE_SIZE));
  const pageItems = useMemo(
    () => referrals.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [referrals, page]
  );

  return (
    <AdminLayout pageTitle="Referrals">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-['Playfair_Display'] text-2xl font-bold text-foreground sm:text-3xl">Referrals</h1>
          <p className="mt-1 text-muted-foreground">{referrals.length} total · {paid} paid</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2 self-start sm:self-auto">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card><CardContent className="p-5"><p className="text-2xl font-bold text-foreground">{referrals.length}</p><p className="text-xs text-muted-foreground mt-0.5">Total Referrals</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-2xl font-bold text-green-600">{paid}</p><p className="text-xs text-muted-foreground mt-0.5">Paid Referrals</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-2xl font-bold text-amber-600">{referrals.length - paid}</p><p className="text-xs text-muted-foreground mt-0.5">Pending</p></CardContent></Card>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /></div>
      ) : referrals.length === 0 ? (
        <Card><CardContent className="p-8 text-center"><Users size={40} className="mx-auto mb-3 text-muted-foreground/30"/><p className="text-muted-foreground">No referrals yet</p></CardContent></Card>
      ) : (
        <>
          <Card className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referred</TableHead>
                  <TableHead>Referrer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm font-medium">{r.referredName || r.referredEmail || "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{r.referrerId ? `${r.referrerId.slice(0, 8)}...` : "—"}</TableCell>
                    <TableCell>
                      <Badge className={`gap-1 text-xs ${r.paid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {r.paid ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                        {r.paid ? "Paid" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{fmtDate(r.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <DataPagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={referrals.length} pageSize={PAGE_SIZE} />
        </>
      )}
    </AdminLayout>
  );
}
