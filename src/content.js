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
  { id: 'meals', label: 'All meals included — cooked by your villa chef' },
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

// Dining. The client corrected this in August 2026: the standard menu is
// INCLUDED in the nightly rate. The $70 per person figure now applies only to
// special or custom meals arranged with the chef — it is not a daily food
// charge on every stay. This reverses his earlier answer and the menu PDF, both
// of which framed $70/pp/day as the cost of all meals. See SETUP.md §6.
export const MEAL_PLAN = {
  // Covered by the nightly rate
  includes: [
    'Breakfast, lunch, and dinner',
    'Dessert',
    'Bottled water throughout the day',
    'Fresh juices — pineapple, orange, and fruit punch',
  ],
  special: {
    price: RATES.mealPlan,
    unit: RATES.mealPlanUnit,
    // Arranged and settled with the villa, not charged through the website.
    paidOnSite: true,
    blurb: 'Want something beyond the standard menu? Special or custom meals are arranged with the chef as a separate package.',
  },
  process: [
    { step: 'Menu in advance', desc: 'We send the menu before you travel so you know exactly what is on offer.' },
    { step: 'The chef contacts you', desc: 'Your villa chef reaches out to plan the week around your preferences and any special requests.' },
    { step: 'Shopping done for you', desc: 'All grocery shopping is completed before you arrive — you walk into a stocked kitchen.' },
    { step: 'Anything different', desc: `If you would like something outside the standard menu, you agree it with the chef as a ${RATES.mealPlan} ${RATES.mealPlanUnit} package.` },
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
// writing. What we still cannot state — the cancellation fee percentage, a
// damage/security deposit, pets, and whether local tax applies — is left out
// rather than guessed at. See SETUP.md §4 and §5.
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
    a: 'Exclusive use of the whole villa and its staff: your private chef, butler, housekeepers and caretakers, groundskeeper, concierge, and on-site security. Your meals are included — breakfast, lunch, dinner, dessert, water and juices — as is airport pickup and drop-off at Montego Bay.',
  },
  {
    q: 'Is food included?',
    a: `Yes. Breakfast, lunch, dinner, dessert, bottled water and fresh juices are included in the nightly rate and cooked for you by the villa chef. He contacts you before you travel to plan the menu around your group and does the grocery shopping in advance.`,
  },
  {
    q: 'What if we want something outside the standard menu?',
    a: `Special or custom meals are arranged directly with the chef as a ${RATES.mealPlan} ${RATES.mealPlanUnit} package. He will contact you before your stay to talk it through, and it is settled with the villa rather than through this website. If you would like to cook something yourself, discuss it with him and he will shop for it.`,
  },
  {
    q: 'How do payments work?',
    a: 'In three instalments: 25% to reserve your dates, 35% within a month of booking, and the final 40% between 20 and 30 days before you arrive. Nothing is due to make an enquiry — we reply with availability and a written quote first.',
  },
  {
    q: 'Which airport should we fly into?',
    a: `Montego Bay (MBJ) — it is the closest airport, about a ${VILLA.airportDrive} away, and the villa collects you and returns you free of charge. Kingston is the farthest airport from Discovery Bay; if you have to fly in there, transfers are ${RATES.kingstonTransfer} ${RATES.kingstonTransferUnit}.`,
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
    q: 'Can you arrange excursions and spa treatments?',
    a: `Yes. Your concierge arranges guided island days at ${RATES.excursion} ${RATES.excursionUnit} — Dunn's River Falls, Green Grotto Caves, Dolphin Cove and more. In-villa massages and spa treatments are available on request; just ask and we will arrange them for you.`,
  },
  {
    q: 'Can we host a wedding or event?',
    a: `Yes. The villa hosts weddings and celebrations for up to ${VILLA.eventCapacity} guests, with ${VILLA.sleeps} sleeping on site and your concierge present throughout. Speak to the manager or chef about catering for the event.`,
  },
  {
    q: 'What is the cancellation policy?',
    a: 'It depends how close to arrival you cancel. On standard dates, cancellations 61 or more days before arrival can be refunded less a cancellation fee; 60 days or less before arrival is non-refundable. Holiday periods need longer notice — 91 days for Easter and Thanksgiving, 121 days for Christmas and New Year. The full terms, including the exact fee, are set out in your written quote before any payment is taken.',
  },
  {
    q: 'Can we move our dates instead of cancelling?',
    a: `We will always try to accommodate a change of dates, though we cannot guarantee it. A shortened stay must still meet the ${VILLA.minNights}-night minimum, and rescheduled dates are non-refundable. Ask us as early as you can — the further out you are, the more we can do.`,
  },
  {
    q: 'Is the villa suitable for children?',
    a: "Yes — the villa is all-age friendly and the chef prepares children's meals to parents' requests. Do mention ages when you enquire so the team can prepare.",
  },
]

// ---------------------------------------------------------------------------
// Cancellation. The client supplied four answers that agree on the cut-off
// windows below but CONTRADICT each other on the fee and on rescheduling:
//   * standard cancellation fee is given as both 5% and 20%
//   * Christmas/New Year is called "non-refundable" in one answer and
//     refundable at 121+ days less 30% in another
//   * rescheduling is "treated as a new booking" in one answer and "full
//     credit within 365 days" in another
// Only the agreed parts are published. The contested figures stay null and
// render as "set out in your written quote" until the client resolves them —
// see SETUP.md §4. Do not fill these in by guessing; this is a binding term.
// ---------------------------------------------------------------------------
export const CANCELLATION = {
  windows: [
    {
      id: 'standard',
      season: 'Standard dates',
      nonRefundable: '60 days or less before arrival',
      refundable: '61 days or more before arrival',
    },
    {
      id: 'easter',
      season: 'Easter & Thanksgiving',
      nonRefundable: '90 days or less before arrival',
      refundable: '91 days or more before arrival',
    },
    {
      id: 'festive',
      season: 'Christmas & New Year',
      nonRefundable: '120 days or less before arrival',
      refundable: '121 days or more before arrival',
    },
  ],
  // Percentage retained on an in-window (refundable) cancellation.
  feeStandard: null,
  feeHoliday: null,
  noRefundFor: [
    'Goods or services booked but not used',
    'Guests who do not arrive',
    'Late arrival or early departure during the rental period',
  ],
  reschedule: [
    `A shortened stay must still meet the ${VILLA.minNights}-night minimum.`,
    'Rescheduled dates are non-refundable.',
    'We will always try to accommodate a date change, but cannot guarantee it.',
  ],
}

// House policies. Same rule as the FAQ: only what the client has confirmed.
export const POLICIES = [
  {
    id: 'booking',
    title: 'Booking & Payment',
    points: [
      `Minimum stay is ${VILLA.minNights} nights, whole-villa only.`,
      'Payment is taken in three instalments: 25% to reserve, 35% within one month of booking, and 40% due 20–30 days before arrival.',
      'Enquiries are free. Your dates are only held once the first instalment is received.',
      'The instalments cover the villa, its staff and your meals. Special meal packages, Kingston transfers, excursions, spa treatments and bar items are settled directly with the villa.',
      'Rates are quoted in US dollars.',
      'Cancellation terms depend on how far ahead you cancel and on the season — see the cancellation table below.',
    ],
  },
  {
    id: 'stay',
    title: 'Arrival & Departure',
    points: [
      `Check-in from ${VILLA.checkIn}, check-out by ${VILLA.checkOut}.`,
      `Montego Bay (MBJ) is the closest airport and the one we recommend — pickup and drop-off there is free of charge.`,
      `Kingston is the farthest airport; transfers from there are ${RATES.kingstonTransfer} ${RATES.kingstonTransferUnit}.`,
      'Please share your flight details once booked so the driver can meet you.',
    ],
  },
  {
    id: 'food',
    title: 'Food & Drink',
    points: [
      "The chef is part of the villa's staff, and your meals are included in the rate: breakfast, lunch, dinner, dessert, bottled water and fresh juices.",
      'Your chef contacts you before you travel to plan the menu, and does the grocery shopping in advance.',
      `Special or custom meals beyond the standard menu are arranged with the chef as a ${RATES.mealPlan} ${RATES.mealPlanUnit} package, settled with the villa rather than through this website.`,
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
    desc: `The chef is part of the villa's staff, and your meals are included in the rate — breakfast, lunch, dinner, dessert, bottled water and fresh juices. He contacts you before arrival to plan the menu and does the grocery shopping for you. Anything beyond the standard menu is arranged with him as a ${RATES.mealPlan} ${RATES.mealPlanUnit} package.`,
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
    desc: `Fly into ${VILLA.airport} — it is the closest airport and the one we recommend, about 45 minutes away, with pickup and drop-off free of charge. Kingston is the farthest airport; transfers from there are ${RATES.kingstonTransfer} ${RATES.kingstonTransferUnit}.`,
  },
  {
    id: 'spa',
    title: 'Spa Services',
    desc: 'In-villa massages and spa treatments, arranged on request through your concierge.',
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
    title: 'Special Meal Package',
    subtitle: `${RATES.mealPlan} ${RATES.mealPlanUnit}`,
    desc: 'Your everyday meals are already included. Choose this if you would like something beyond the standard menu — the chef will contact you to plan it.',
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
