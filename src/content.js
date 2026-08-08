// Single source of truth for all villa facts and copy.
// Originally sourced from the client's Wix site (seaview-mirage.com), July 2026.
// Updated August 2026 from the client's written answers to our open questions —
// those answers supersede the Wix site wherever the two disagree.

export const VILLA = {
  name: 'Sea View Mirage Villa',
  addressLine: '9 Mount Boon, Discovery Bay',
  parish: 'St. Ann, Jamaica',
  fullAddress: '9 Mount Boon, Discovery Bay, St. Ann, Jamaica',
  // Client gave two numbers: a US line and a Jamaican line at the villa.
  phoneUS: '(914) 279-2370',
  phoneUSHref: 'tel:+19142792370',
  phoneJA: '(876) 670-0790',
  phoneJAHref: 'tel:+18766700790',
  email: 'seaviewmirage.info@gmail.com',
  bedrooms: 7,
  ensuites: 7,
  bathrooms: 7,
  halfBaths: 2,
  sleeps: 14,
  eventCapacity: 70,
  checkIn: '3:00 PM',
  checkOut: '11:00 AM',
  minNights: 3,
  airport: 'Montego Bay Airport (MBJ)',
  airportDrive: '45 min drive',
}

// Kept for components that only need one number to show inline.
VILLA.phone = VILLA.phoneUS
VILLA.phoneHref = VILLA.phoneUSHref

// Quote requests are delivered by FormSubmit (no backend needed).
// NOTE: the first submission triggers a one-time activation email to the
// address below — the client must click the confirmation link in it.
export const INQUIRY_ENDPOINT = `https://formsubmit.co/ajax/${VILLA.email}`

// Bed breakdown confirmed by the client: 7 bedrooms — 3 king (incl. the
// master suite) and 4 queen — plus 7 en-suite baths and 2 guest half baths.
export const BED_CONFIG = [
  { id: 'king', count: 3, label: 'King Bedrooms', note: 'Including the master suite' },
  { id: 'queen', count: 4, label: 'Queen Bedrooms', note: 'Each with en-suite bath' },
]

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
  { id: 'gated', label: 'Gated & Monitored' },
  { id: 'beach', label: 'Beach Guest Passes' },
  { id: 'views', label: 'Ocean Views' },
]

export const GOOD_TO_KNOW = [
  { id: 'checkin', label: `Check-in ${VILLA.checkIn} · Check-out ${VILLA.checkOut}` },
  { id: 'minstay', label: `${VILLA.minNights}-night minimum stay` },
  { id: 'meals', label: 'Chef meal plan $70 per person, per day' },
  { id: 'security', label: 'Gated entry · On-site security · 360° cameras' },
  { id: 'smoking', label: 'No smoking inside the villa' },
]

// ---------------------------------------------------------------------------
// Pricing. The client asked for prices to be published. He supplied the meal
// plan, transfer, and excursion rates below but has NOT yet given a nightly
// villa rate — set `nightlyRate` to a string (e.g. 'From $1,800 / night') and
// the rates section will show it in place of "Contact for rates".
// ---------------------------------------------------------------------------
export const RATES = {
  nightlyRate: null,
  mealPlan: '$70',
  mealPlanUnit: 'per person, per day',
  kingstonTransfer: '$350',
  kingstonTransferUnit: 'round trip',
  excursion: '$300',
  excursionUnit: 'per day, per group',
}

export const MEAL_PLAN = {
  price: RATES.mealPlan,
  unit: RATES.mealPlanUnit,
  includes: [
    'Breakfast, lunch, and dinner',
    'Dessert with dinner',
    'Bottled water throughout the day',
    'Fresh juices — pineapple, orange, and fruit punch',
  ],
  process: [
    { step: 'Menu in advance', desc: 'We send the menu before you travel so you know exactly what to expect.' },
    { step: 'Plan with your chef', desc: 'The villa chef contacts you directly to build the week around your preferences.' },
    { step: 'Shopping done for you', desc: 'All grocery shopping is completed before you arrive — you walk into a stocked kitchen.' },
    { step: 'Itemized receipt', desc: 'You receive a detailed receipt for everything purchased. No guesswork, no markup surprises.' },
  ],
}

export const PAYMENT_TERMS = [
  { id: 'deposit', label: '50% deposit', desc: 'Reserves your dates and takes the villa off the calendar.' },
  { id: 'balance', label: 'Balance 20–30 days out', desc: 'The remaining 50% is due 20 to 30 days before your arrival date.' },
  { id: 'quote', label: 'No payment to inquire', desc: 'Send your dates first — we reply with availability and a full written quote.' },
]

// Staff included with every stay
export const INCLUDED_SERVICES = [
  {
    id: 'chef',
    title: 'Private Chef',
    desc: `A villa chef cooks for your group on the ${RATES.mealPlan} per person, per day meal plan — breakfast, lunch, dinner, dessert, water, and fresh juices. He contacts you before arrival to plan the menu around your preferences and does the grocery shopping for you.`,
  },
  {
    id: 'butler',
    title: 'Butler Service',
    desc: 'Attentive, discreet butlers care for you throughout your stay, from welcome drinks to evening service.',
  },
  {
    id: 'housekeeping',
    title: 'Housekeeping & Caretakers',
    desc: 'Live-in caretakers, housekeepers, and a houseman keep the villa immaculate with daily care and fresh linens.',
  },
  {
    id: 'concierge',
    title: 'Concierge',
    desc: 'Your concierge greets you on arrival, remains available remotely throughout your stay, and is on-site for events and weddings.',
  },
  {
    id: 'security',
    title: 'Security & Gate',
    desc: 'The property is gated and staffed by a security guard, with a 360° camera system covering the grounds.',
  },
  {
    id: 'grounds',
    title: 'Grounds & Gardens',
    desc: 'A dedicated groundskeeper maintains the lush tropical grounds and landscaping around the villa.',
  },
]

// Arranged on request — these can be flagged in the booking inquiry
export const REQUEST_SERVICES = [
  {
    id: 'transfer',
    title: 'Airport Transfer',
    desc: `Complimentary pickup and drop-off at ${VILLA.airport}, about 45 minutes away. Arriving into Kingston instead? Transfers are ${RATES.kingstonTransfer} round trip.`,
  },
  {
    id: 'spa',
    title: 'Spa Services',
    desc: 'In-villa massages and spa treatments arranged through your concierge.',
  },
  {
    id: 'watersports',
    title: 'Excursions & Beach Days',
    desc: `Guided island excursions at ${RATES.excursion} per day for your group — Dunn's River Falls, Green Grotto Caves, Dolphin Cove — plus beach passes for Puerto Seco.`,
  },
  {
    id: 'events',
    title: 'Events & Weddings',
    desc: `Weddings and celebrations for up to ${VILLA.eventCapacity} guests, with your concierge on-site throughout the event.`,
  },
]

// Options offered in the booking inquiry wizard. Ids shared with
// REQUEST_SERVICES so cards in the Services section can preselect them.
export const BOOKING_SERVICES = [
  {
    id: 'mealplan',
    title: 'Chef Meal Plan',
    subtitle: `${RATES.mealPlan} ${RATES.mealPlanUnit}`,
    desc: 'Breakfast, lunch, dinner, dessert, water, and juices. Menu planned with your chef in advance; groceries bought before you land.',
  },
  ...REQUEST_SERVICES.map(s => ({ ...s, subtitle: 'On request' })),
]

export const NEARBY = [
  { id: 'beach', place: 'Puerto Seco Beach — guest passes provided', distance: '5 min drive' },
  { id: 'grotto', place: 'Green Grotto Caves', distance: '10 min drive' },
  { id: 'dolphin', place: 'Dolphin Cove', distance: '25 min drive' },
  { id: 'falls', place: "Dunn's River Falls", distance: '30 min drive' },
  { id: 'airport', place: 'Montego Bay Airport', distance: VILLA.airportDrive },
]
