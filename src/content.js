// Single source of truth for all villa facts and copy.
// Sourced from the client's Wix site (seaview-mirage.com), July 2026.
// The Wix site is inconsistent on bedroom count (6/7/8 across pages) —
// 7 en-suite bedrooms (Rooms page) is used pending client confirmation.

export const VILLA = {
  name: 'Sea View Mirage Villa',
  addressLine: '9 Mount Boon, Discovery Bay',
  parish: 'St. Ann, Jamaica',
  fullAddress: '9 Mount Boon, Discovery Bay, St. Ann, Jamaica',
  phone: '914-439-6181',
  phoneHref: 'tel:+19144396181',
  email: 'seaviewmirage.info@gmail.com',
  bedrooms: 7,
  ensuites: 7,
  powderRooms: 3,
  poolDeckBaths: 2,
  sleeps: 14,
  checkIn: '3:00 PM',
  checkOut: '11:00 AM',
  minNights: 3,
  airport: 'Montego Bay Airport (MBJ)',
  airportDrive: '45 min drive',
}

// Quote requests are delivered by FormSubmit (no backend needed).
// NOTE: the first submission triggers a one-time activation email to the
// address below — the client must click the confirmation link in it.
export const INQUIRY_ENDPOINT = `https://formsubmit.co/ajax/${VILLA.email}`

export const AMENITIES = [
  { id: 'pool', label: 'Swimming Pool' },
  { id: 'kitchens', label: 'Two Full Kitchens' },
  { id: 'bar', label: 'Bar & Gazebo' },
  { id: 'entertainment', label: 'Entertainment Space' },
  { id: 'dining', label: 'Dining Room' },
  { id: 'wifi', label: 'Free WiFi' },
  { id: 'air', label: 'Central Air' },
  { id: 'laundry', label: 'Laundry Room' },
  { id: 'parking', label: 'Private Parking' },
  { id: 'bikes', label: 'Mountain Bikes' },
  { id: 'views', label: 'Ocean Views' },
  { id: 'access', label: 'All-Age Friendly' },
]

export const GOOD_TO_KNOW = [
  { id: 'checkin', label: `Check-in ${VILLA.checkIn} · Check-out ${VILLA.checkOut}` },
  { id: 'minstay', label: `${VILLA.minNights}-night minimum stay` },
  { id: 'breakfast', label: 'Breakfast by your chef included' },
  { id: 'security', label: 'Evening security, 8 PM – 8 AM' },
  { id: 'smoking', label: 'No smoking inside the villa' },
]

// Staff included with every stay
export const INCLUDED_SERVICES = [
  {
    id: 'chef',
    title: 'Private Chef',
    desc: 'Breakfast is included with every stay. Lunch and dinner are cooked to order — guests provide ingredients (chef fee separate), and we can stock the villa before you arrive.',
  },
  {
    id: 'butler',
    title: 'Butler Service',
    desc: 'Attentive, discreet butlers care for you throughout your stay, from welcome drinks to evening service.',
  },
  {
    id: 'housekeeping',
    title: 'Housekeeping & Wait Staff',
    desc: 'Housekeepers, wait staff, and a houseman keep the villa immaculate with daily care and fresh linens.',
  },
  {
    id: 'concierge',
    title: 'Concierge',
    desc: 'Your concierge greets you on arrival, remains available remotely throughout your stay, and is on-site for events and weddings.',
  },
  {
    id: 'security',
    title: 'Evening Security',
    desc: 'Professional security keeps the property watched over every night from 8 PM to 8 AM.',
  },
  {
    id: 'grounds',
    title: 'Grounds & Gardens',
    desc: 'A dedicated gardener maintains the lush tropical grounds and landscaping around the villa.',
  },
]

// Arranged on request — these can be flagged in the booking inquiry
export const REQUEST_SERVICES = [
  {
    id: 'transfer',
    title: 'Airport Transfer',
    desc: `Private pickup and drop-off at ${VILLA.airport}, about 45 minutes from the villa.`,
  },
  {
    id: 'spa',
    title: 'Spa Services',
    desc: 'In-villa massages and spa treatments arranged through your concierge.',
  },
  {
    id: 'watersports',
    title: 'Water Sports & Excursions',
    desc: "Snorkeling, beach days at Puerto Seco, Dunn's River Falls, Green Grotto Caves, and more.",
  },
  {
    id: 'events',
    title: 'Events & Weddings',
    desc: 'Intimate weddings and celebrations with your concierge on-site throughout the event.',
  },
]

// Options offered in the booking inquiry wizard. Ids shared with
// REQUEST_SERVICES so cards in the Services section can preselect them.
export const BOOKING_SERVICES = [
  {
    id: 'chefmeals',
    title: 'Chef Lunch & Dinner',
    subtitle: 'Cooked to order',
    desc: 'Breakfast is always included. Ask your chef to also prepare lunch and dinner — ingredients plus a separate chef fee.',
  },
  {
    id: 'stocking',
    title: 'Pre-Arrival Grocery Stocking',
    subtitle: 'Arrive to a full kitchen',
    desc: 'Send us your shopping list and the villa will be stocked before you land.',
  },
  ...REQUEST_SERVICES.map(s => ({ ...s, subtitle: 'On request' })),
]

export const NEARBY = [
  { id: 'beach', place: 'Puerto Seco Beach', distance: '5 min drive' },
  { id: 'grotto', place: 'Green Grotto Caves', distance: '10 min drive' },
  { id: 'dolphin', place: 'Dolphin Cove', distance: '25 min drive' },
  { id: 'falls', place: "Dunn's River Falls", distance: '30 min drive' },
  { id: 'airport', place: 'Montego Bay Airport', distance: VILLA.airportDrive },
]
