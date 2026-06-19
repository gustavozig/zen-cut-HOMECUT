import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Barbeiro = {
  id: string;
  user_id: string;
  nome: string;
  nome_profissional: string;
  email: string;
  whatsapp: string | null;
  cidade: string | null;
  foto_url: string | null;
  slug: string;
};

export function useBarbeiro() {
  const [barbeiro, setBarbeiro] = useState<Barbeiro | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) {
      setBarbeiro(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("barbeiros")
      .select("*")
      .eq("user_id", uid)
      .maybeSingle();
    setBarbeiro((data as Barbeiro | null) ?? null);
    setLoading(false);
  };

  useEffect(() => {
    reload();
    const { data: sub } = supabase.auth.onAuthStateChange(() => reload());
    return () => sub.subscription.unsubscribe();
  }, []);

  return { barbeiro, loading, reload, setBarbeiro };
}