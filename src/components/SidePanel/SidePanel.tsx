// Səhifə məzmunu + sağda sabit panel.
// İki konteyner simmetrikdir: ikisi də header-dən eyni boşluqla başlayır və ekranın altından eyni boşluqla bitir.
// Səhifə sürüşmür; sol konteyner öz içində sürüşür (< 1024: çərçivə yoxdur, səhifə özü sürüşür). Panel yoxdursa, konteyner bütün eni tutur.
// fill: məzmun (məs. xəritə) konteyneri tam doldurur — sürüşmə və aşağıdakı solğunlaşma olmur.
export function WithSidePanel({ panel, fill = false, stack = false, children }: {
  panel?: React.ReactNode;
  fill?: boolean;
  stack?: boolean; // üst hissə (axtarış, tablar) yerində qalır, məzmun öz bloku içində sürüşür: uşaq `flex h-full flex-col` olmalıdır
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Xarici qutu: çərçivə və ölçü. Sağda panelin eni + boşluq; hündürlük: ekran − header − yuxarı/aşağı boşluqlar */}
      <div className={`${panel ? "mr-[calc(var(--panel-w)+var(--gap))]" : ""} h-[calc(100vh-var(--header-h)-2*var(--gap))] overflow-hidden rounded-[18px] border border-line bg-[#f8f9fc] max-lg:h-auto max-lg:overflow-visible max-lg:rounded-none max-lg:border-0 max-lg:bg-transparent`}>
        {stack ? (
          <div className="h-full px-5 py-5">{children}</div>
        ) : fill ? (
          <div className="h-full p-3">{children}</div>
        ) : (
          /* Daxili sürüşən hissə: aşağı kənarda kartlar kəskin kəsilmir, yumşaq solğunlaşır */
          <div className="h-full overflow-y-auto px-5 pb-12 pt-5 max-lg:h-auto max-lg:overflow-visible max-lg:p-0 lg:[mask-image:linear-gradient(to_bottom,black_calc(100%-48px),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {children}
          </div>
        )}
      </div>
      {panel && <aside className="side-panel">{panel}</aside>}
    </>
  );
}
