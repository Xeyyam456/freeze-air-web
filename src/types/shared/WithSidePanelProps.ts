export type WithSidePanelProps = {
  panel?: React.ReactNode;
  fill?: boolean;
  stack?: boolean; // üst hissə (axtarış, tablar) yerində qalır, məzmun öz bloku içində sürüşür: uşaq `flex h-full flex-col` olmalıdır
  children: React.ReactNode;
};
