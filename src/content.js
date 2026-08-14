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
  minNights: 7,
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
// Pricing. `nightly` is the number everything else is derived from — the
// published rate, the booking wizard's live total and the instalment amounts.
// The villa is let whole-house only, so the rate does not vary by party size.
// ---------------------------------------------------------------------------
export const RATES = {
  nightly: 2600,
  nightlyRate: '$2,600',
  nightlyUnit: 'per night',
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

// Three instalments. Percentages are the source of truth for both the published
// schedule and the live figures in the booking wizard, and are what the Stripe
// integration should read when it lands.
export const PAYMENT_SCHEDULE = [
  {
    id: 'deposit', pct: 0.25, label: 'To reserve',
    when: 'Due on booking',
    desc: 'Holds your dates and takes the villa off the calendar.',
  },
  {
    id: 'second', pct: 0.35, label: 'Second instalment',
    when: 'Due within one month of booking',
    desc: 'Confirms the reservation and your chef begins menu planning.',
  },
  {
    id: 'final', pct: 0.40, label: 'Final instalment',
    when: 'Due 20–30 days before arrival',
    desc: 'Settles the balance ahead of your arrival.',
  },
]

export const money = n =>
  `$${Math.round(n).toLocaleString('en-US')}`

// Villa total for a given number of nights, and that total split across the
// three instalments above. Rounding is applied to the first two and the final
// instalment takes the remainder, so the parts always sum to the total exactly.
export const villaTotal = nights => nights * RATES.nightly

export const instalments = total => {
  const first = Math.round(total * PAYMENT_SCHEDULE[0].pct)
  const second = Math.round(total * PAYMENT_SCHEDULE[1].pct)
  return [first, second, total - first - second]
}

// ---------------------------------------------------------------------------
// FAQ. Every answer below is drawn from something the client has confirmed in
// writing. Questions we cannot answer yet — cancellation and refund terms, a
// damage/security deposit, pets, and whether local tax applies — are
// deliberately absent rather than guessed at. See SETUP.md.
// ---------------------------------------------------------------------------
export const FAQ = [
  {
    q: 'Can we book individual rooms?',
    a: `No — ${VILLA.name} is let whole-villa only. One booking gives your group exclusive use of all ${VILLA.bedrooms} bedrooms and the entire property, so the rate is the same whether you are six people or ${VILLA.sleeps}.`,
  },
  {
    q: 'How many people can stay?',
    a: `Up to ${VILLA.sleeps} guests across ${VILLA.bedrooms} bedrooms — 3 king rooms including the master suite, and 4 queen rooms. Every bedroom has its own en-suite bathroom, and there are 2 further guest half baths.`,
  },
  {
    q: 'Is there a minimum stay?',
    a: `Yes, ${VILLA.minNights} nights. At ${RATES.nightlyRate} ${RATES.nightlyUnit}, a ${VILLA.minNights}-night stay comes to ${money(villaTotal(VILLA.minNights))}. Longer stays are welcome — the booking form will price any length from ${VILLA.minNights} nights upward.`,
  },
  {
    q: 'What is included in the nightly rate?',
    a: 'Exclusive use of the whole villa and its staff: your private chef, butler, housekeepers and caretakers, groundskeeper, concierge, and on-site security. Airport pickup and drop-off at Montego Bay is included too.',
  },
  {
    q: 'Is food included?',
    a: `Food is separate. The chef's meal plan is ${RATES.mealPlan} ${RATES.mealPlanUnit} and covers breakfast, lunch, dinner, dessert, bottled water and fresh juices. Your chef contacts you before you travel to plan the menu, does the shopping, and gives you an itemised receipt for everything bought on your behalf. You are welcome to self-cater instead.`,
  },
  {
    q: 'How do payments work?',
    a: 'In three instalments: 25% to reserve your dates, 35% within a month of booking, and the final 40% between 20 and 30 days before you arrive. Nothing is due to make an enquiry — we reply with availability and a written quote first.',
  },
  {
    q: 'How do we get to the villa?',
    a: `Montego Bay Airport (MBJ) is about a ${VILLA.airportDrive} away and the villa collects you and returns you at no charge. If you fly into Kingston instead, transfers are ${RATES.kingstonTransfer} ${RATES.kingstonTransferUnit}.`,
  },
  {
    q: 'Is the property secure?',
    a: 'Yes. The grounds are gated with a security guard on site, and a 360° camera system covers the exterior of the property. There are no cameras inside the villa or in any private space.',
  },
  {
    q: 'Can we use a beach?',
    a: 'Yes — guests use Puerto Seco Beach, about five minutes away, on guest passes provided by the villa.',
  },
  {
    q: 'Can you arrange excursions?',
    a: `Your concierge arranges guided island days at ${RATES.excursion} ${RATES.excursionUnit} — Dunn's River Falls, Green Grotto Caves, Dolphin Cove and more. In-villa spa treatments can also be arranged on request.`,
  },
  {
    q: 'Can we host a wedding or event?',
    a: `Yes. The villa hosts weddings and celebrations for up to ${VILLA.eventCapacity} guests, with ${VILLA.sleeps} sleeping on site and your concierge present throughout. Speak to the manager or chef about catering for the event.`,
  },
  {
    q: 'Is the villa suitable for children?',
    a: "Yes — the villa is all-age friendly and the chef prepares children's meals to parents' requests. Do mention ages when you enquire so the team can prepare.",
  },
]

// House policies. Same rule as the FAQ: only what the client has confirmed.
export const POLICIES = [
  {
    id: 'booking',
    title: 'Booking & Payment',
    points: [
      `Minimum stay is ${VILLA.minNights} nights, whole-villa only.`,
      'Payment is taken in three instalments: 25% to reserve, 35% within one month of booking, and 40% due 20–30 days before arrival.',
      'Enquiries are free. Your dates are only held once the first instalment is received.',
      'Rates are quoted in US dollars.',
    ],
  },
  {
    id: 'stay',
    title: 'Arrival & Departure',
    points: [
      `Check-in from ${VILLA.checkIn}, check-out by ${VILLA.checkOut}.`,
      `Complimentary pickup and drop-off at ${VILLA.airport}. Kingston transfers are ${RATES.kingstonTransfer} ${RATES.kingstonTransferUnit}.`,
      'Please share your flight details once booked so the driver can meet you.',
    ],
  },
  {
    id: 'food',
    title: 'Food & Drink',
    points: [
      `The chef's meal plan is ${RATES.mealPlan} ${RATES.mealPlanUnit}, covering all three meals, dessert, water and juices.`,
      'Groceries are bought on your behalf and billed at cost; every receipt is reviewed with you before checkout.',
      'Food is settled in cash or by card at the villa.',
      'Please tell us about allergies and dietary restrictions in advance.',
      'Bar items and drinks are charged separately at the published bar prices.',
    ],
  },
  {
    id: 'house',
    title: 'House Rules',
    points: [
      'No smoking inside the villa.',
      'The grounds are gated and monitored by a 360° exterior camera system for the safety of guests and staff. There are no cameras inside the villa.',
      `Events and celebrations are welcome for up to ${VILLA.eventCapacity} guests, arranged with the manager in advance.`,
      'Please treat the villa and its staff with the same care you would your own home.',
    ],
  },
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
