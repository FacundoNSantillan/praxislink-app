const common = { viewBox: "0 0 24 24", width: 16, height: 16, fill: "none", stroke: "currentColor", strokeWidth: 1.6 };

export const IconGrid = () => (
  <svg {...common}>
    <rect x="3" y="4" width="7" height="7" rx="1" />
    <rect x="14" y="4" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

export const IconPlus = () => (
  <svg {...common}>
    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
  </svg>
);

export const IconPeople = () => (
  <svg {...common}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
    <circle cx="18" cy="9" r="2" />
  </svg>
);

export const IconBuilding = () => (
  <svg {...common}>
    <rect x="3" y="7" width="18" height="14" rx="1.5" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export const IconUser = () => (
  <svg {...common}>
    <circle cx="12" cy="8" r="3.4" />
    <path d="M5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" />
  </svg>
);

export const IconSearch = () => (
  <svg {...common}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M20 20l-4.5-4.5" strokeLinecap="round" />
  </svg>
);

export const IconList = () => (
  <svg {...common}>
    <rect x="4" y="3" width="16" height="18" rx="1.5" />
    <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
  </svg>
);

export const IconCap = () => (
  <svg {...common}>
    <path d="M12 3l9 4.5-9 4.5-9-4.5 9-4.5z" />
    <path d="M6 10.5V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-5.5" />
  </svg>
);

export const IconCard = () => (
  <svg {...common}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 10h18M7 15h4" strokeLinecap="round" />
  </svg>
);
