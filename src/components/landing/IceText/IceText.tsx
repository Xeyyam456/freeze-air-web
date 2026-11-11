import s from "./IceText.module.css";

// Buzdan yazılmış mətn: buz gradienti (üstdə açıq, altda dərin mavi), şüşə kimi parlaq üst qat, qırov nöqtələri,
// nazik buz haşiyəsi və vaxtaşırı yazının üstündən keçən parıltı. Yalnız CSS; ::before eyni mətnin parlaq üst yarısıdır (data-text).
export function IceText({ children }: { children: string }) {
  return <span className={s.ice} data-text={children}>{children}</span>;
}
