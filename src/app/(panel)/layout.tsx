import { TasksListener } from "@/components/work/TasksListener";

// Usta panelinin bütün səhifələri: tapşırıqlar Realtime ilə dinlənir (səhifələr arası keçiddə kanal qırılmır)
export default function PanelLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <TasksListener />
      {children}
    </>
  );
}
