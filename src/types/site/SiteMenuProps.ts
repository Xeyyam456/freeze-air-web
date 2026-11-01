export type SiteMenuProps = {
  pages: { href: string; label: string }[];
  phone: string;
  tel?: string;
  account?: React.ReactNode; // mobildə header-dəki hesab düyməsinin yerinə (səhifələrin altında)
};
