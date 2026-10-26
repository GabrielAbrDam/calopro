// Jeu d'icônes minimal, trait 1.8 px.
type P = { className?: string };
const base = (path: React.ReactNode) =>
  function Icon({ className = "size-6" }: P) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
        {path}
      </svg>
    );
  };

export const IconHome = base(<><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /></>);
export const IconBuilding = base(<><rect x="5" y="3" width="14" height="18" rx="1" /><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M11 21v-3h2v3" /></>);
export const IconScale = base(<><path d="M12 3v18M5 21h14" /><path d="M5 7h14M7 7l-3 7h6zM17 7l-3 7h6z" /></>);
export const IconSearch = base(<><circle cx="11" cy="11" r="6" /><path d="m20 20-4.5-4.5" /></>);
export const IconKey = base(<><circle cx="8" cy="15" r="4" /><path d="m11 12 9-9M17 6l2 2M15 8l2 2" /></>);
export const IconBook = base(<><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 21V5M8 7h7" /></>);
export const IconAlert = base(<><path d="M12 3 2 20h20z" /><path d="M12 10v4M12 17v.5" /></>);
export const IconFile = base(<><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 13h6M9 17h6" /></>);
export const IconInbox = base(<><path d="M3 13l3-8h12l3 8v6H3z" /><path d="M3 13h5l1 2h6l1-2h5" /></>);
export const IconCalendar = base(<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>);
export const IconPhone = base(<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />);
export const IconPlay = base(<path d="M8 5v14l11-7z" />);
export const IconCamera = base(<><path d="M4 8h3l2-3h6l2 3h3v12H4z" /><circle cx="12" cy="13" r="3.5" /></>);
export const IconCheck = base(<path d="m5 12 5 5 9-10" />);
export const IconArrowLeft = base(<path d="M19 12H5M11 6l-6 6 6 6" />);
export const IconPrinter = base(<><path d="M7 9V3h10v6M7 17H4v-7h16v7h-3" /><path d="M7 14h10v7H7z" /></>);
export const IconMapPin = base(<><path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12" /><circle cx="12" cy="9" r="2.5" /></>);
export const IconWalk = base(<><circle cx="13" cy="4" r="1.6" /><path d="m9 21 3-7 3 3v4M7 12l3-4h4l2 4M12 8l-1 6" /></>);
export const IconLink = base(<><path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1" /><path d="M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1" /></>);
export const IconRefresh = base(<><path d="M20 11a8 8 0 0 0-14-5L4 8" /><path d="M4 4v4h4M4 13a8 8 0 0 0 14 5l2-2" /><path d="M20 20v-4h-4" /></>);
