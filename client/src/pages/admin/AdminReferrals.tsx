// HONEYMOON — Admin Referrals
import { useState, useEffect } from "react";
import { Users, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/layout/AdminLayout";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminReferrals() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(query(collection(db, "referrals"), orderBy("createdAt", "desc"))).then(snap => {
      setReferrals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const paid = referrals.filter(r => r.paid).length;

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-['Playfair_Display'] text-3xl font-bold text-foreground">Referrals</h1>
        <p className="mt-1 text-muted-foreground">{referrals.length} total · {paid} paid</p>
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
        <div className="space-y-3">
          {referrals.map(r => (
            <Card key={r.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${r.paid ? "bg-green-50" : "bg-amber-50"}`}>
                  {r.paid ? <CheckCircle2 size={20} className="text-green-500"/> : <Clock size={20} className="text-amber-500"/>}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-foreground">{r.referredName || r.referredEmail}</p>
                  <p className="text-xs text-muted-foreground">Referred by: {r.referrerId?.slice(0,8)}...</p>
                </div>
                <Badge className={r.paid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                  {r.paid ? "Paid" : "Pending"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
