"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import { LeaveModal } from "@/views/Leaves/components/LeaveModal";
import { WORK_SAVED } from "@/components/work/MyDay";
import { WorkLogForm } from "@/components/work/WorkLogForm";
import { CommandMenu } from "./CommandMenu";
import { PANEL_EVENTS } from "./nav";

type Me = { id: number; name: string };

// Panelin hər səhifəsindən əlçatan pəncərələr: "İş əlavə et", "İcazə istə" və Ctrl+K axtarışı.
// Üst zolaq, Ctrl+K və "Mənim bugünüm" bunları PANEL_EVENTS hadisələri ilə açır.
export function QuickActions({ showDepot, showFuel }: { showDepot: boolean; showFuel: boolean }) {
  const [dialog, setDialog] = useState<"work" | "leave" | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [search, setSearch] = useState(false);
  const meRef = useRef<Me | null>(null);

  useEffect(() => {
    // Əməkdaş kartı ilk lazım olanda bir dəfə oxunur
    async function loadMe() {
      if (meRef.current) return meRef.current;
      const supabase = createClient();
      const { data: id } = await supabase.rpc("my_employee_id");
      if (!id) return null;
      const { data: emp } = await supabase.from("employees").select("full_name").eq("id", id).maybeSingle();
      meRef.current = { id, name: emp?.full_name ?? "" };
      return meRef.current;
    }
    const open = (kind: "work" | "leave") => async () => {
      const m = await loadMe();
      if (!m) return toast.error("Əməkdaş kartın yoxdur", "Bu hesab heç bir ustaya bağlı deyil.");
      setMe(m);
      setDialog(kind);
    };
    const onWork = open("work");
    const onLeave = open("leave");
    const onSearch = () => setSearch(true);
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch((s) => !s);
      }
    };
    window.addEventListener(PANEL_EVENTS.addWork, onWork);
    window.addEventListener(PANEL_EVENTS.leave, onLeave);
    window.addEventListener(PANEL_EVENTS.search, onSearch);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(PANEL_EVENTS.addWork, onWork);
      window.removeEventListener(PANEL_EVENTS.leave, onLeave);
      window.removeEventListener(PANEL_EVENTS.search, onSearch);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <>
      {search && <CommandMenu showDepot={showDepot} showFuel={showFuel} onClose={() => setSearch(false)} />}
      {dialog === "work" && me && (
        <WorkLogForm
          employeeId={me.id}
          employeeName={me.name}
          onClose={() => setDialog(null)}
          onSaved={() => window.dispatchEvent(new Event(WORK_SAVED))}
        />
      )}
      {dialog === "leave" && me && <LeaveModal employeeId={me.id} onClose={() => setDialog(null)} />}
    </>
  );
}
