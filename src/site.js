// One entry per route. Drives the navbar, the footer, each page's banner and
// the document title, so adding a page means editing this list and nothing else.
export const PAGES = [
  { path: '/', nav: 'Home', title: null },
  {
    path: '/villa', nav: 'The Villa', title: 'The Villa',
    eyebrow: 'Accommodations',
    heading: 'Inside the Villa',
    blurb: 'Seven bedrooms, two kitchens, and a pool deck built for long, slow days.',
    image: '/assets/villa/interior-02.jpg',
  },
  {
    path: '/gallery', nav: 'Gallery', title: 'Gallery',
    eyebrow: 'Photography',
    heading: 'Life at the Villa',
    blurb: 'The villa, the grounds, and the island around it.',
    image: '/assets/villa/pool-08.jpg',
  },
  {
    path: '/services', nav: 'Services', title: 'Services',
    eyebrow: 'Full-Service Luxury',
    heading: 'Your Villa Staff',
    blurb: 'A chef, butler, housekeeping, concierge and security, included with every stay.',
    image: '/assets/villa/interior-03.jpg',
  },
  {
    path: '/rates', nav: 'Rates', title: 'Rates & Booking',
    eyebrow: 'Rates & Booking',
    heading: 'Clear pricing',
    blurb: 'Everything you will be asked to pay, published up front.',
    image: '/assets/villa/exterior-13.jpg',
  },
  {
    path: '/menu', nav: 'Menu', title: "The Chef's Menu",
    eyebrow: 'Dining',
    heading: "The Chef's Menu",
    blurb: 'Six collections, planned with your chef before you travel.',
    image: '/assets/villa/interior-01.jpg',
  },
  {
    path: '/events', nav: 'Events', title: 'Events & Weddings',
    eyebrow: 'Weddings & Celebrations',
    heading: 'Your day in paradise',
    blurb: 'Weddings and celebrations for up to 70 guests, above Discovery Bay.',
    image: '/assets/villa/pool-06.jpg',
  },
  {
    // Kept out of the top nav (eight items is already the limit before the
    // desktop bar stops fitting) but listed in the footer and linked from Rates.
    path: '/faq', nav: 'FAQ', title: 'FAQ & Policies', navHidden: true,
    eyebrow: 'Good to Know',
    heading: 'FAQ & Policies',
    blurb: 'How booking works, what is included, and the house rules — in plain terms.',
    image: '/assets/villa/interior-11.jpg',
  },
  {
    path: '/contact', nav: 'Contact', title: 'Contact & Location',
    eyebrow: 'Getting Here',
    heading: 'Discovery Bay, Jamaica',
    blurb: 'Forty-five minutes from Montego Bay, with pickup on us.',
    image: '/assets/villa/balcony-06.jpg',
  },
]

// Payment pages: reached only from a signed link, so they are kept out of both
// the nav and the footer. Listed here purely so Layout can set the tab title —
// no `heading`, so they render without a page banner.
PAGES.push(
  { path: '/pay', nav: 'Payment', title: 'Secure Payment', navHidden: true, footerHidden: true },
  { path: '/pay/thanks', nav: 'Payment', title: 'Thank You', navHidden: true, footerHidden: true },
)

export const findPage = pathname => PAGES.find(p => p.path === pathname)
