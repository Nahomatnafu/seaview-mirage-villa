// The villa chef's menu, transcribed from the client's menu PDF (menu-content.md).
// Kept separate from content.js because it's large and changes independently.
//
// PHOTOS: the collection/dish images in public/assets/menu/ are Creative Commons
// stock from Wikimedia Commons — they are NOT photos of this villa's food. See
// public/assets/menu/CREDITS.md for the required attribution. Swap them for the
// chef's own plated photos as soon as the client sends them, and update CREDITS.md.

import { RATES } from './content'

export const MENU_INTRO = {
  budget: `${RATES.mealPlan} ${RATES.mealPlanUnit}`,
  note: 'Recommended food budget, covering breakfast, lunch, and dinner.',
}

// Numbered steps the guest follows before arrival.
export const ORDERING_STEPS = [
  { step: 'Review the menu as a group', desc: 'Look through the collections together before you travel.' },
  { step: 'Choose your meals for each day', desc: "Pick breakfast, lunch, dinner, and dessert. Don't see something you want? Just ask the chef." },
  { step: 'Note allergies and preparation', desc: 'Flag any allergies, dietary restrictions, and specific preparation requirements.' },
  { step: 'Send your selections', desc: 'Email, text, or WhatsApp your day-by-day choices to the villa.' },
  { step: 'The chef calls you', desc: 'Your chef reaches out to review and finalize the menu with you.' },
  { step: 'Share your food budget', desc: 'Give the chef a budget so shopping can be planned around it.' },
]

export const HOW_IT_WORKS = [
  'Once the menu is finalized, your chef shops for the entire length of your stay.',
  'One day before checkout you receive every shopping receipt to review, and the chef goes through the bills with you and answers any questions.',
  'Food is paid in cash or by credit card.',
]

export const MENU_NOTICES = [
  { id: 'tea', label: 'Teas are on the house.' },
  { id: 'coffee', label: 'Let us know before you arrive if you would like coffee, and your preferred sweetener.' },
  { id: 'kids', label: "Kids' meals are made to parents' requests — speak to the manager or chef." },
  { id: 'own', label: 'You are welcome to handle your own food, though we recommend letting us take care of it.' },
  { id: 'snacks', label: 'Snacks are available on request — see the Snacks collection.' },
]

export const ALLERGY_NOTICE =
  'Please be sure to let us know if you have any allergies or dietary restrictions — alcohol, dairy, or anything else.'

export const EVENTS_NOTE =
  'For events or special occasions, speak to the manager or chef. We will coordinate with you to bring your ideas to life.'

// Each collection: courses -> groups of items. A group with no title renders as
// a plain list; `image` on a course pulls in one of the dish photos.
export const COLLECTIONS = [
  {
    id: 'favorites',
    number: 1,
    name: 'Favorites',
    tagline: 'The dishes guests ask for again and again',
    image: '/assets/menu/favorites.jpg',
    imageAlt: 'Jerk chicken plated with rice and a fresh corn salad',
    courses: [
      {
        name: 'Breakfast',
        image: '/assets/menu/fruit-platter.jpg',
        imageAlt: 'Tropical fruit platter with papaya, mango, passion fruit, and lime',
        groups: [
          {
            items: [
              'Fruit platter with assorted fruits',
              'Eggs — poached, scrambled, or omelet',
              'Bacon',
              'Sausage',
              'Ackee with codfish (saltfish) or with bacon',
              'Callaloo with codfish (saltfish)',
              'Seasoned baked beans — with or without sausage',
              'French toast',
              'Boiled green banana and boiled yam',
              'Fried dumplings (Johnny Cakes)',
              'Frittata or codfish (saltfish) fritters',
              'Pancakes or waffles with syrup',
              'Banana bread',
              'Pumpkin bread',
              'Zucchini bread',
              'Cinnamon bread',
              'Cinnamon rolls',
            ],
          },
        ],
      },
      {
        name: 'Lunch',
        image: '/assets/menu/patty.jpg',
        imageAlt: 'Golden Jamaican beef patties on a plate',
        groups: [
          { title: 'Burgers & Sandwiches', items: ['Hamburger with fries', 'Grilled cheese sandwich', 'Ham sandwich', 'Lobster sandwich', 'Shrimp sandwich', 'Tuna sandwich', 'Turkey sandwich', 'Hot dog'] },
          { title: 'Jerk', items: ['Jerk chicken', 'Jerk pork'] },
          { title: 'Patties', items: ['Beef', 'Chicken', 'Cheese', 'Fish', 'Soy', 'Vegetable', 'Shrimp'] },
          { title: 'Pasta', items: ['Spaghetti with chicken', 'Spaghetti with fish', 'Spaghetti with meatballs'] },
          { title: 'Quiches', items: ['Jerk sausage quiche', 'Shrimp quiche', 'Vegetable quiche'] },
          { title: 'Vegetarian', items: ['Vegetable wrap'] },
        ],
      },
      {
        name: 'Dinner',
        groups: [
          { title: 'Traditional Jamaican', items: ['Jamaican oxtail', 'Jamaican curry goat'] },
          { title: 'Chicken', items: ['Fricassee chicken', 'Fried chicken', 'Brown stew chicken', 'Baked chicken', 'Jerk chicken', 'Roasted chicken'] },
          { title: 'Fish', items: ['Escovitch (fry) fish', 'Steamed fish', 'Brown stew fish', 'Roasted fish'] },
          { title: 'Seafood', items: ['Fry lobster', 'Curry lobster', 'Garlic lobster', 'Grilled lobster', 'Curry shrimp'] },
          { title: 'Beef', items: ['Garlic steak', 'Tenderloin steak', 'Grilled steak', 'Roasted steak'] },
          { title: 'Pasta', items: ['Alfredo pasta with shrimp', 'Vegetable pasta'] },
          { title: 'Rice', items: ['Rice and peas', 'Pumpkin rice', 'Plain rice'] },
          { title: 'Salads', items: ['Garden salad', 'Caprese salad', 'Toast salad', 'Chef salad', 'Caesar salad'] },
          { title: 'Vegetable & Vegan', items: ['Stir-fried vegetables', 'Broccoli', 'Carrots', 'String beans', 'Cauliflower', 'Squash', 'Zucchini'] },
          { title: 'Sides', items: ['Mashed potatoes', 'Potato salad', 'Fried plantains', 'Baked mac and cheese', 'Sweet potato bake', 'Sweet potato mash', 'Candied sweet potatoes'] },
          { title: 'Soups', items: ['Roasted tomatoes and bell peppers', 'Cream of pumpkin', 'Cream of chicken', 'Pepper pot', 'Red peas with beef or chicken', 'Bisque — lobster or shrimp', 'Manish water (optional)'] },
        ],
      },
      {
        name: 'Dessert',
        image: '/assets/menu/cheesecake.jpg',
        imageAlt: 'Slice of cheesecake with strawberry sauce',
        groups: [
          {
            items: [
              'Cheesecake — Oreo, plain, strawberry, blueberry, chocolate',
              'Cakes — plain, red velvet, chocolate',
              'Swiss rolls — carrot, chocolate, red velvet',
              'Pavlova — fruit or ice cream',
              'Mousse — chocolate, mocha, vanilla',
              'Pie — apple, blueberry, banana cream',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'jamaican-joy',
    number: 2,
    name: 'Jamaican Joy',
    tagline: 'Jerk chicken · Rice and peas · Ackee & saltfish · Curry goat',
    image: '/assets/menu/jamaican-joy.jpg',
    imageAlt: 'Ackee and saltfish, the Jamaican national dish',
    courses: [
      {
        name: 'Breakfast',
        image: '/assets/menu/callaloo.jpg',
        imageAlt: 'Bowl of callaloo topped with a scotch bonnet pepper',
        groups: [
          { items: ['Ackee with or without saltfish (codfish)', 'Ackee and corned pork', 'Saltfish (codfish) rundown', 'Callaloo with or without saltfish', 'Salt mackerel rundown', 'Chicken — curry or stew', 'Corned beef with cabbage', 'Braised liver', 'Cooked up saltfish', 'Cooked up corned pork', 'Cooked up liver'] },
          { title: 'Hot Porridge', items: ['Cornmeal', 'Plantain', 'Banana', 'Hominy corn', 'Peanut'] },
          { title: 'Sides', items: ['Fried plantains', 'Boiled green bananas', 'Yams — boiled or roasted', 'Dumplings — boiled or fried', 'Bammy — fried, steamed, or baked', 'Sweet potatoes — roasted, baked, boiled, or fried', 'Frittata — with saltfish, meat, or vegetables'] },
        ],
      },
      {
        name: 'Lunch',
        groups: [
          { items: ['Chicken — jerk, stew, or fried', 'Jerk pork', 'Fish — escovitch (fry), or steamed with okra and crackers'] },
          { title: 'Patties', items: ['Beef, with or without cheese', 'Vegetable', 'Chicken', 'Shrimp', 'Vegan', 'Served with cocoa bread or cheese if desired'] },
          { title: 'Soups', items: ['Chicken', "Red peas — with pig's tail, chicken, or beef", 'Beef', 'Pepperpot — spicy or not spicy'] },
        ],
      },
      {
        name: 'Dinner',
        groups: [
          { items: ['Jamaican curried goat', 'Jamaican oxtail', 'Pork — brown stew, jerk, roast, or pot roast', 'Beef — brown stew, roast, or pot roast', 'Chicken — fried, stew, baked, roasted, jerk, curry, or fricassee', 'Shrimp — garlic, curry, or grilled', 'Lobster — garlic, curry, fried, or grilled', 'Fish — escovitch (fry), steamed, brown stew, or roasted'] },
          { title: 'Sides', items: ['Fried plantains', 'Boiled green bananas', 'Yams — boiled or roasted', 'Dumplings — boiled or fried', 'Bammy — fried, steamed, or baked', 'Sweet potatoes — roasted, baked, boiled, or fried', 'Irish potatoes — mashed, roasted, or baked', 'Rice — rice and peas or plain', 'Mac and cheese', 'Cabbage with carrots'] },
        ],
      },
      {
        name: 'Dessert',
        groups: [
          { title: 'Cakes', items: ['Toto (coconut cake)', 'Jamaican rum cake'] },
          { title: 'Pudding', items: ['Jamaican-style bread pudding, with or without vanilla sauce', 'Sweet potato pone', 'Cornmeal pone'] },
        ],
      },
    ],
  },
  {
    id: 'classic',
    number: 3,
    name: 'Classic Cuisine',
    tagline: 'Pancakes and waffles · Burgers · Apple pie',
    image: '/assets/menu/classic.jpg',
    imageAlt: 'Burger served with a basket of fries',
    courses: [
      {
        name: 'Breakfast',
        groups: [
          { items: ['Eggs — scrambled, fried, poached, boiled, or Benedict', 'Omelettes — meat, vegetable, or plain with cheese', 'Sausages — beef, chicken, or pork', 'Bacon — pork or turkey', 'Fruit platter', 'Breakfast burrito', 'Breakfast sandwich', 'Breakfast hash', 'Smoothies', 'Baked beans', 'Grits'] },
          { title: 'Sides', items: ['Bagels with cream cheese', 'Fries', 'English muffins', 'Toast — regular, French, or French casserole', 'Pancakes', 'Waffles', 'Frittata — with meat or vegetables'] },
        ],
      },
      {
        name: 'Lunch',
        groups: [
          { items: ['Burger — regular or cheese', 'Grilled cheese', 'Pizza — plain, cheese, pepperoni, or pineapple', 'Pasta — chicken or shrimp', 'Chicken wings — buffalo, BBQ, or teriyaki', 'BLT club sandwiches — turkey, bacon, or Swiss', 'Tuna sandwich', 'Pulled sandwiches — chicken, beef, turkey, or pork'] },
          { title: 'Salads', items: ['Caesar salad', 'Cobb salad', "Chef's salad"] },
          { title: 'Soups', items: ['Pumpkin', 'Red pepper', 'Tomato', 'Minestrone', 'Broccoli cheddar', 'Chicken noodle'] },
        ],
      },
      {
        name: 'Dinner',
        groups: [
          { items: ['Pork — brown stew, jerk, roast, or pot roast', 'Beef — brown stew, roast, or pot roast', 'Steak — ribeye or sirloin', 'Chicken — fried, fricassee, baked, roast, jerk, curry, or stew', 'Ribs — BBQ or prime', 'Lamb — brown stew, roast, or pot roast', 'Meatloaf', 'Grilled vegetables', 'Baked salmon', 'Shrimp — garlic, curry, or fried', 'Lobster — garlic, curry, fried, or grilled', 'Fish — steamed, fried, or grilled'] },
        ],
      },
      {
        name: 'Dessert',
        groups: [
          { title: 'Pies', items: ['Apple', 'Pecan', 'Blueberry'] },
          { title: 'Cookies', items: ['Chocolate cookies', 'Brownies'] },
          { title: 'Cakes', items: ['Cheesecake — plain, strawberry, or Oreo', 'Chocolate', 'Plain', 'Banana bread'] },
          { title: 'Ice Cream', items: ['Banana split', 'Banana cream'] },
        ],
      },
    ],
  },
  {
    id: 'vegan',
    number: 4,
    name: 'Vegan Vacation',
    tagline: 'Veggie wraps · Hearty soups · Bowls and salads',
    image: '/assets/menu/vegan.jpg',
    imageAlt: 'Vegan bowl with edamame, cabbage, carrot, cucumber, and tomato',
    courses: [
      {
        name: 'Breakfast',
        groups: [
          { items: ['Chia pudding — chia seeds, plant-based milk, and sweeteners', 'Vegan granola — rolled oats, nuts, seeds, and dried fruit baked with maple syrup', 'Vegan muffins — flavored with fruit or nuts'] },
          { title: 'Bowls', items: ['Vegan oatmeal bowl — oats in plant-based milk, topped with fresh fruit, nuts, and maple syrup', 'Smoothie bowl — frozen fruit and plant-based milk, topped with granola, nuts, and fruit'] },
          { title: 'Burrito', items: ['Vegan breakfast burrito — scrambled tofu, black beans, avocado, salsa, and vegan cheese'] },
          { title: 'Pancakes', items: ['Vegan pancakes — served with fruit and maple syrup'] },
          { title: 'Toast', items: ['Avocado toast — mashed avocado, tomato, salt, and pepper'] },
          { title: 'Salad', items: ['Fruit salad — fresh fruit, drizzled with agave if desired'] },
        ],
      },
      {
        name: 'Lunch',
        groups: [
          { title: 'Bowls', items: ['Vegan Buddha bowl — quinoa or brown rice with roasted veg, chickpeas or lentils, and tahini dressing'] },
          { title: 'Sandwiches & Wraps', items: ['Vegan sandwich — hummus, avocado, veggies, and sprouts', 'Veggie wrap — hummus, lettuce, tomato, cucumber, and shredded carrot', 'Vegan chickpea salad sandwich', 'Avocado and tomato sandwich'] },
          { title: 'Salads', items: ['Vegan salad — mixed greens, veggies, nuts, and citrus vinaigrette', 'Chickpea and roasted vegetable salad'] },
          { title: 'More', items: ['Vegan sushi rolls — nori with sushi rice, avocado, veggies, and tofu or tempeh', 'Vegan tacos — corn tortillas with black beans, guacamole, salsa, and crisp lettuce', 'Vegan pizza — vegan cheese and vegetable toppings', 'Stuffed bell peppers — quinoa, beans, vegetables, and seasonings'] },
        ],
      },
      {
        name: 'Dinner',
        groups: [
          { items: ['Vegan spaghetti and "meatballs" — lentil or mushroom balls with tomato sauce', 'Vegan stir-fry — veggies and tofu in soy or teriyaki sauce with brown rice', 'Vegan chili — beans, veggies, and spices, with cornbread or tortilla chips', 'Vegan curry — veggies and tofu or chickpeas in coconut curry, with rice or naan', "Vegan shepherd's pie — mashed sweet potato over lentils, veggies, and gravy", 'Vegan lentil soup — lentils, veggies, and herbs in vegetable broth with crusty bread', 'Vegan Buddha bowl — grains, roasted or raw vegetables, legumes, and a sauce'] },
        ],
      },
      {
        name: 'Dessert',
        groups: [
          { title: 'Cakes', items: ['Chocolate', 'Cheesecake', 'Carrot'] },
          { title: 'Baked Goods', items: ['Vegan brownies', 'Vegan banana bread', 'Vegan lemon bars', 'Chocolate chip cookies'] },
          { title: 'More', items: ['Vegan ice cream', 'Fruit tart', 'Vegan panna cotta'] },
        ],
      },
    ],
  },
]

// The Bar is priced per bottle/serving, so it renders as tables rather than lists.
export const BAR = {
  id: 'bar',
  number: 5,
  name: 'The Bar',
  tagline: 'Spirits, wines, and mixers',
  image: '/assets/menu/bar.jpg',
  imageAlt: 'Jamaican rum punch garnished with orange, beside fresh tropical fruit',
  note: 'If you are not seeing what you desire, please let us know and we will source it for you.',
  spirits: [
    ['19 Crimes', '—', '$50'],
    ['Appleton Signature', '750ml', '$50'],
    ['Camarena', '—', '$60'],
    ['Casamigos — Gold', '—', '$150'],
    ['Casamigos — White', '—', '$150'],
    ['Cîroc', '1L', '$100'],
    ['Coco Mania Rum', '200ml', '$10'],
    ['Coco Mania Rum', '750ml', '$25'],
    ['Crown Royal Whiskey', '750ml', '$80'],
    ['Don Julio — Gold', '—', '$150'],
    ['Don Julio — Silver', '—', '$150'],
    ['Grey Goose Vodka', '—', '$100'],
    ['Hennessy — Cognac', '—', '$100'],
    ['Hennessy — Pure White', '—', '$120'],
    ['Johnnie Walker Whisky', '750ml', '$80'],
    ['Johnnie Walker Whisky', '1.75L', '$150'],
    ['Kingston 62 Rum', '200ml', '$15'],
    ['Lamothe Parrot', '—', '$40'],
    ['Malibu Rum', '750ml', '$35'],
    ["Maker's Mark", '750ml', '$80'],
    ['Myers Rum Cream', '750ml', '$35'],
    ['Opera Prima Gold Moscato', '—', '$35'],
    ['Ork Leaves', '—', '$30'],
    ["Sangster's Rum Cream", '750ml', '$25'],
    ['SKYY Vodka', '750ml', '$50'],
    ["Tito's", '1L', '$85'],
    ['White Wray & Nephew Rum', '200ml', '$15'],
  ],
  cocktails: [
    ['Mimosa', '—', '$30'],
    ['Piña Colada', '—', '$35'],
    ['Rum Punch', '—', '$30'],
    ['Strawberry Daiquiri', '—', '$35'],
  ],
  wines: [
    ['Red Wine', '—', '$35'],
    ['Mote Chardonnay', '—', '$35'],
    ['Yellow Tail Chardonnay', '750ml', '$40'],
    ['Toso Moscato Gold', '750ml', '$30'],
    ['Toso Moscato Rose', '750ml', '$30'],
  ],
  other: [
    ['Hookah', '—', '$30'],
    ['Hookah — Refill', '—', '$20'],
    ['Newport Cigarettes', 'Per pack', '$15'],
  ],
  chasers: ['Coke', 'Sprite', 'Ting', 'Ginger Ale', 'Ginger Beer', 'Tonic Water', 'Cranberry', 'Fruit Punch', 'Orange Juice', 'Pineapple Juice', 'Red Bull', 'Red Bull Sugar-Free'],
}

export const SNACKS = {
  id: 'snacks',
  number: 6,
  name: 'Snacks',
  tagline: 'Available on request',
  image: '/assets/menu/snacks.jpg',
  imageAlt: 'Bowl of mixed nuts',
  items: ['Banana chips', 'Ripe plantain chips', 'Big Foot', 'Cashew nuts', 'Mixed nuts', 'Pistachios', 'Cheerios', 'Cheetos', 'Doritos', 'Fritos', 'Lays potato chips', 'Pringles', 'Ruffles', 'Tortilla chips', 'Tostitos', 'Chocolate chip cookies', 'Sugar cookies'],
}
