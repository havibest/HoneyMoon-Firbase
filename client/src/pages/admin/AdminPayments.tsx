// HONEYMOON — Admin Payments
import { useState, useEffect } from "react";
import { CreditCard, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/layout/AdminLayout";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(query(collection(db, "payments"), orderBy("createdAt", "desc"))).then(snap => {
      setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const total = payments.reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-['Playfair_Display'] text-3xl font-bold text-foreground">Payments</h1>
        <p className="mt-1 text-muted-foreground">{payments.length} transactions · Total: ${total}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card><CardContent className="p-5"><p className="text-2xl font-bold text-foreground">${total}</p><p className="text-xs text-muted-foreground mt-0.5">Total Revenue</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-2xl font-bold text-foreground">{payments.length}</p><p className="text-xs text-muted-foreground mt-0.5">Total Transactions</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-2xl font-bold text-foreground">${payments.length > 0 ? (total / payments.length).toFixed(0) : 0}</p><p className="text-xs text-muted-foreground mt-0.5">Avg. Transaction</p></CardContent></Card>
      </div>
      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /></div>
      ) : payments.length === 0 ? (
        <Card><CardContent className="p-8 text-center"><CreditCard size={40} className="mx-auto mb-3 text-muted-foreground/30"/><p className="text-muted-foreground">No payments yet</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {payments.map(p => (
            <Card key={p.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                  <CreditCard size={20} className="text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-foreground">{p.userId?.slice(0,8)}...</p>
                  <p className="text-xs text-muted-foreground">{p.method} · {p.currency}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">{p.amount} {p.currency}</p>
                  <Badge className="bg-green-100 text-green-700 text-xs">{p.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
