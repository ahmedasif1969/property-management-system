'use client';

const DEFAULT_PROPERTIES = [
  {
    id: 1,
    title: "Sunset Villas - Unit A",
    location: "123 Ocean Drive, Miami, FL",
    status: "Occupied",
    beds: 3,
    baths: 2,
    price: "AED 120,000/yr",
    sqft: 2400,
    yearBuilt: 2018,
    description: "Beautiful beachfront villa with open floor plan, updated kitchen, and private pool.",
    contracts: [
      {
        id: "CON-102",
        status: "Active",
        tenantName: "Sarah Jenkins",
        tenantType: "New",
        startDate: "Oct 1, 2025",
        endDate: "Sep 30, 2026",
        totalRent: "AED 120,000",
        securityDeposit: "AED 6,000",
        chequeCount: 4,
        documents: "Emirates ID, Passport Copy, Visa Copy, Cheques",
        cheques: [
          { id: 1, date: "Jun 1, 2026", amount: "AED 30,000", number: "CHQ-882193", depositDate: "Jun 2, 2026", type: "Current", reference: "REF-1001", status: "Cleared" },
          { id: 2, date: "Jun 15, 2026", amount: "AED 30,000", number: "CHQ-882194", depositDate: "-", type: "PDC", reference: "-", status: "Non-clear" },
          { id: 3, date: "Jul 1, 2026", amount: "AED 30,000", number: "CHQ-882195", depositDate: "-", type: "PDC", reference: "-", status: "Non-clear" },
          { id: 4, date: "Aug 1, 2026", amount: "AED 30,000", number: "CHQ-882196", depositDate: "-", type: "PDC", reference: "-", status: "Non-clear" }
        ],
        fees: [
          { id: 1, name: "Management Fees", date: "Oct 2, 2025", amount: "AED 6,000", reference: "TRX-9982" },
          { id: 2, name: "Ejari", date: "Oct 3, 2025", amount: "AED 250", reference: "EJ-88471" }
        ]
      },
      {
        id: "CON-084",
        status: "Expired",
        tenantName: "John Doe",
        tenantType: "Old",
        startDate: "Oct 1, 2024",
        endDate: "Sep 30, 2025",
        totalRent: "AED 110,000",
        securityDeposit: "AED 5,500",
        chequeCount: 2,
        documents: "Emirates ID, Passport Copy",
        cheques: [
          { id: 1, date: "Oct 1, 2024", amount: "AED 55,000", number: "CHQ-7721", depositDate: "Oct 2, 2024", type: "Current", reference: "REF-0982", status: "Cleared" },
          { id: 2, date: "Apr 1, 2025", amount: "AED 55,000", number: "CHQ-7722", depositDate: "Apr 3, 2025", type: "Current", reference: "REF-1011", status: "Cleared" }
        ],
        fees: [
          { id: 1, name: "Management Fees", date: "Oct 2, 2024", amount: "AED 5,500", reference: "TRX-8123" },
          { id: 2, name: "Ejari", date: "Oct 3, 2024", amount: "AED 250", reference: "EJ-77321" }
        ]
      }
    ],
    serviceCharges: [
      { id: 1, paidOn: "Oct 15, 2025", reference: "REF-SV-8921", periodFrom: "Oct 1, 2025", periodTo: "Dec 31, 2025", amount: "AED 450", details: "Building management fee" },
      { id: 2, paidOn: "Jul 10, 2025", reference: "REF-SV-8842", periodFrom: "Jul 1, 2025", periodTo: "Sep 30, 2025", amount: "AED 450", details: "-" }
    ],
    maintenanceCharges: [
      { id: 1, date: "Oct 24, 2025", amount: "AED 120", reference: "MN-2031", details: "Fixing leaking faucet in Master Bath" },
      { id: 2, date: "Aug 12, 2025", amount: "AED 85", reference: "MN-1988", details: "AC servicing and filter change" }
    ]
  },
  {
    id: 2,
    title: "Downtown Loft",
    location: "456 Urban Ave, Chicago, IL",
    status: "Occupied",
    beds: 1,
    baths: 1,
    price: "AED 80,000/yr",
    sqft: 950,
    yearBuilt: 2020,
    description: "Sleek industrial loft in the heart of downtown. High ceilings, exposed brick, and modern finishes.",
    contracts: [
      {
        id: "CON-103",
        status: "Active",
        tenantName: "Michael Chang",
        tenantType: "New",
        startDate: "Jan 1, 2026",
        endDate: "Dec 31, 2026",
        totalRent: "AED 80,000",
        securityDeposit: "AED 4,000",
        chequeCount: 2,
        documents: "Passport Copy, Visa Copy",
        cheques: [
          { id: 1, date: "Jan 1, 2026", amount: "AED 40,000", number: "CHQ-99120", depositDate: "Jan 2, 2026", type: "Current", reference: "REF-2001", status: "Cleared" },
          { id: 2, date: "Jun 20, 2026", amount: "AED 40,000", number: "CHQ-99121", depositDate: "-", type: "PDC", reference: "-", status: "Non-clear" }
        ],
        fees: [
          { id: 1, name: "Management Fees", date: "Jan 2, 2026", amount: "AED 4,000", reference: "TRX-10294" }
        ]
      }
    ],
    serviceCharges: [],
    maintenanceCharges: []
  },
  {
    id: 3,
    title: "Maple Wood Estates",
    location: "789 Pine Lane, Seattle, WA",
    status: "Vacant",
    beds: 4,
    baths: 3,
    price: "AED 150,000/yr",
    sqft: 3200,
    yearBuilt: 2015,
    description: "Spacious family home in quiet suburban neighborhood. Large backyard, double garage, and home office.",
    contracts: [],
    serviceCharges: [],
    maintenanceCharges: []
  }
];

export function getProperties() {
  if (typeof window === 'undefined') return DEFAULT_PROPERTIES;
  const stored = localStorage.getItem('property_management_data');
  if (!stored) {
    localStorage.setItem('property_management_data', JSON.stringify(DEFAULT_PROPERTIES));
    return DEFAULT_PROPERTIES;
  }
  return JSON.parse(stored);
}

export function saveProperties(properties) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('property_management_data', JSON.stringify(properties));
}

const DEFAULT_QUERIES = [
  {
    serialNo: "Q-1042",
    entryDate: "Jun 20, 2026",
    propertyId: 1,
    propertyName: "Sunset Villas - Unit A",
    statementNo: "ST-8902",
    description: "Leaking Faucet in Master Bath plumbing issue",
    solveLocation: "Master Bath",
    action: "Sent plumber to repair the main valve",
    status: "Pending"
  },
  {
    serialNo: "Q-1041",
    entryDate: "Jun 18, 2026",
    propertyId: 2,
    propertyName: "Downtown Loft",
    statementNo: "ST-7821",
    description: "AC unit cooling efficiency dropped significantly",
    solveLocation: "Living Room AC unit",
    action: "Cleaned filters and recharged gas level",
    status: "Solved"
  },
  {
    serialNo: "Q-1040",
    entryDate: "Jun 15, 2026",
    propertyId: 3,
    propertyName: "Maple Wood Estates",
    statementNo: "ST-6512",
    description: "Front wooden deck gate lock broken",
    solveLocation: "Backyard Deck Entrance",
    action: "Replaced lock handle set",
    status: "Solved"
  }
];

export function getQueries() {
  if (typeof window === 'undefined') return DEFAULT_QUERIES;
  const stored = localStorage.getItem('property_management_queries');
  if (!stored) {
    localStorage.setItem('property_management_queries', JSON.stringify(DEFAULT_QUERIES));
    return DEFAULT_QUERIES;
  }
  return JSON.parse(stored);
}

export function saveQueries(queries) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('property_management_queries', JSON.stringify(queries));
}
