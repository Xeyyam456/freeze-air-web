"use client";

import { useEffect, useMemo, useState } from "react";
import { useMe } from "@/lib/me";
import { useData } from "@/lib/useData";
import { fetchAnnouncerState } from "@/services/announcements/announcements";
import { fetchFeed } from "@/services/feed/fetchFeed";
import { FEED_KEY } from "@/services/feed/keys";
import { acquireFeedLive, releaseFeedLive } from "@/services/feed/liveChannel";
import { Card } from "@/shared/components/Card";
import type { FeedGroup } from "@/types/feed";
import { EmployeeSearch } from "@/views/Employees/components/EmployeeList/EmployeeSearch";
import { FeedCard } from "./components/FeedCard";
import { FeedTabs } from "./components/FeedTabs";
import { searchPosts } from "./utils/searchPosts";

// Qruplar (mobil "Qruplar" ilə eyni): usta tapşırıq qeydinə şəkil/video/akt yükləyəndə avtomatik burada görünür
// (usta + yer + birlikdə işləyənlər). İki tab: Görülən işlər / Aktlar; axtarış: yer, usta, tarix. 👍/👎 və 💬 şərh. Canlı: work_files,
// feed_likes, feed_comments Realtime. Rəhbərlik hər şərhi silə bilər.
export function FeedView() {
  const me = useMe();
  const meId = me?.id ?? null;
  const [group, setGroup] = useState<FeedGroup>("work");
  const [query, setQuery] = useState("");
  const work = useData(FEED_KEY, () => fetchFeed("work", meId), ["work", meId]);
  const act = useData(FEED_KEY, () => fetchFeed("act", meId), ["act", meId]);
  const who = useData("announcer", () => fetchAnnouncerState()); // rəhbərlikdirmi (açar elanlarla ortaq: eyni məlumat)
  const current = group === "work" ? work : act;
  const posts = useMemo(() => searchPosts(current ?? [], query), [current, query]);

  useEffect(() => {
    acquireFeedLive();
    return releaseFeedLive;
  }, []);

  return (
    <div className="mx-auto grid max-w-3xl gap-4">
      <FeedTabs group={group} onChange={setGroup} counts={{ work: work?.length ?? null, act: act?.length ?? null }} />
      <EmployeeSearch value={query} onChange={setQuery} placeholder="Yer, usta və ya tarix axtar..." label="Lent axtarışı" />
      {current === null ? <Card className="muted py-10 text-center text-sm">Yüklənir...</Card>
        : posts.length === 0 ? <Card className="muted py-10 text-center text-sm">{query ? "Heç nə tapılmadı." : group === "work" ? "Hələ görülən iş paylaşılmayıb." : "Hələ akt yüklənməyib."}</Card>
        : posts.map((p) => <FeedCard key={p.logId} post={p} group={group} meId={meId} moderator={who?.canSend ?? false} />)}
    </div>
  );
}
