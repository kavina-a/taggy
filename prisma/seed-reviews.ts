import { prisma } from "../lib/prisma";

interface ReviewerSeed {
  phone: string;
  name: string;
  city: string;
  avatarUrl: string;
  eliteYear?: number;
  friendCount: number;
  photoCount: number;
}

const REVIEWERS: ReviewerSeed[] = [
  {
    phone: "+94771112233",
    name: "Saman Kumara",
    city: "Colombo 07 (Cinnamon Gardens)",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    eliteYear: 2026,
    friendCount: 38,
    photoCount: 42,
  },
  {
    phone: "+94772223344",
    name: "Dilani Perera",
    city: "Colombo 03 (Kollupitiya)",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    eliteYear: 2026,
    friendCount: 52,
    photoCount: 65,
  },
  {
    phone: "+94773334455",
    name: "Nuwan Jayasuriya",
    city: "Rajagiriya",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    friendCount: 19,
    photoCount: 14,
  },
  {
    phone: "+94774445566",
    name: "Ayesha Senanayake",
    city: "Colombo 04 (Bambalapitiya)",
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
    eliteYear: 2025,
    friendCount: 44,
    photoCount: 29,
  },
  {
    phone: "+94775556677",
    name: "Dinesh Fernando",
    city: "Dehiwala",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    friendCount: 27,
    photoCount: 18,
  },
];

interface ReviewData {
  reviewerIndex: number;
  businessSlug: string;
  rating: number;
  text: string;
  photos?: { url: string; caption?: string }[];
  usefulCount: number;
  funnyCount: number;
  coolCount: number;
  daysAgo: number;
}

const REVIEWS: ReviewData[] = [
  {
    reviewerIndex: 0, // Saman Kumara
    businessSlug: "ministry-of-crab",
    rating: 5,
    text: "Ministry of Crab never fails to impress! The Garlic Chilli Crab with fresh Kade Bread is an absolute masterpiece. The crustacean quality is world-class, perfectly cooked with tender, juicy meat in every bite. Service at the Dutch Hospital courtyard was impeccable.",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
        caption: "Colossal Garlic Chilli Crab",
      },
    ],
    usefulCount: 12,
    funnyCount: 1,
    coolCount: 9,
    daysAgo: 2,
  },
  {
    reviewerIndex: 1, // Dilani Perera
    businessSlug: "barefoot-garden-cafe",
    rating: 5,
    text: "The perfect oasis in Colombo. Sitting in the open-air courtyard beneath the frangipani trees listening to acoustic tunes while sipping iced lime tea is sublime. The black pork curry and quiche are consistently delicious. A must-visit whenever friends visit Sri Lanka.",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
        caption: "Courtyard coffee and quiche",
      },
    ],
    usefulCount: 15,
    funnyCount: 2,
    coolCount: 14,
    daysAgo: 4,
  },
  {
    reviewerIndex: 2, // Nuwan Jayasuriya
    businessSlug: "upalis-by-nawaloka",
    rating: 5,
    text: "Authentic Sri Lankan culinary heritage at its finest. The mutton curry, pol sambol, and hot hoppers are out of this world. Clean, comfortable, and great view of Victoria Park across the road. Always take visiting relatives here.",
    usefulCount: 8,
    funnyCount: 0,
    coolCount: 6,
    daysAgo: 6,
  },
  {
    reviewerIndex: 3, // Ayesha Senanayake
    businessSlug: "spa-ceylon-colombo",
    rating: 5,
    text: "Pure bliss! The de-stress body massage melted away all fatigue from the week. The therapists are exceptionally skilled, the aromatic oils smell heavenly, and the serene ambiance makes you forget you are in the middle of bustling Colombo.",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
        caption: "Herbal relaxation oils",
      },
    ],
    usefulCount: 10,
    funnyCount: 1,
    coolCount: 8,
    daysAgo: 8,
  },
  {
    reviewerIndex: 0, // Saman Kumara
    businessSlug: "cafe-kumbuk",
    rating: 4,
    text: "Wonderful healthy brunch options and high quality locally sourced ingredients. The iced oat latte and sourdough avocado toast with poached eggs were spot on. Cozy, welcoming atmosphere with plenty of natural light.",
    usefulCount: 6,
    funnyCount: 0,
    coolCount: 4,
    daysAgo: 12,
  },
  {
    reviewerIndex: 4, // Dinesh Fernando
    businessSlug: "dimo-automobile-service-centre",
    rating: 5,
    text: "First rate service diagnostics and maintenance. The service advisors were transparent with quotation and delivered the vehicle on the exact promised hour. Best place in Western Province for modern vehicle care.",
    usefulCount: 7,
    funnyCount: 0,
    coolCount: 3,
    daysAgo: 15,
  },
  {
    reviewerIndex: 1, // Dilani Perera
    businessSlug: "nihonbashi",
    rating: 5,
    text: "Exceptional Japanese gastronomy right in Colombo. The sashimi is fresh off the southern coast boats, and the charcoal yakitori skewers are grilled to perfection. A tranquil garden ambiance reminiscent of Kyoto.",
    usefulCount: 9,
    funnyCount: 1,
    coolCount: 11,
    daysAgo: 18,
  },
];

async function seedReviews() {
  console.log("Seeding authentic reviewers and public reviews...");

  // 1. Create or upsert reviewers
  const createdUsers = [];
  for (const r of REVIEWERS) {
    const user = await prisma.user.upsert({
      where: { phone: r.phone },
      update: {
        name: r.name,
        city: r.city,
        avatarUrl: r.avatarUrl,
        eliteYear: r.eliteYear,
        friendCount: r.friendCount,
        photoCount: r.photoCount,
      },
      create: {
        phone: r.phone,
        name: r.name,
        city: r.city,
        avatarUrl: r.avatarUrl,
        eliteYear: r.eliteYear,
        friendCount: r.friendCount,
        photoCount: r.photoCount,
      },
    });
    createdUsers.push(user);
    console.log(`User created/updated: ${user.name} (${user.id})`);
  }

  // 2. Create reviews
  for (const item of REVIEWS) {
    const user = createdUsers[item.reviewerIndex];
    if (!user) continue;

    const business = await prisma.business.findUnique({
      where: { slug: item.businessSlug },
      select: { id: true, name: true },
    });

    if (!business) {
      console.warn(`Business not found: ${item.businessSlug}, skipping`);
      continue;
    }

    const reviewDate = new Date();
    reviewDate.setDate(reviewDate.getDate() - item.daysAgo);

    const review = await prisma.review.upsert({
      where: {
        userId_businessId: {
          userId: user.id,
          businessId: business.id,
        },
      },
      update: {
        rating: item.rating,
        text: item.text,
        visibilityStatus: "recommended",
        usefulCount: item.usefulCount,
        funnyCount: item.funnyCount,
        coolCount: item.coolCount,
        createdAt: reviewDate,
      },
      create: {
        userId: user.id,
        businessId: business.id,
        rating: item.rating,
        text: item.text,
        visibilityStatus: "recommended",
        usefulCount: item.usefulCount,
        funnyCount: item.funnyCount,
        coolCount: item.coolCount,
        createdAt: reviewDate,
        photos: item.photos
          ? {
              create: item.photos.map((p) => ({
                url: p.url,
                caption: p.caption,
              })),
            }
          : undefined,
      },
    });

    console.log(`Review added: ${user.name} -> ${business.name} (${review.rating} stars)`);

    // Recompute business rating
    const aggregate = await prisma.review.aggregate({
      where: {
        businessId: business.id,
        visibilityStatus: "recommended",
      },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.business.update({
      where: { id: business.id },
      data: {
        avgRating: aggregate._avg.rating ? Number(aggregate._avg.rating.toFixed(1)) : null,
        reviewCount: aggregate._count.rating,
      },
    });
  }

  // Update user review counters
  for (const user of createdUsers) {
    const count = await prisma.review.count({
      where: { userId: user.id, visibilityStatus: "recommended" },
    });
    await prisma.user.update({
      where: { id: user.id },
      data: { reviewCount: count },
    });
  }

  console.log("Seeding reviews and reviewers completed successfully!");
}

seedReviews()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
