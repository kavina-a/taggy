import { prisma } from "../lib/prisma";

async function seedCollections() {
  console.log("Seeding official LankaReview collections...");

  // 1. Create or get official editorial user
  let curator = await prisma.user.findUnique({
    where: { phone: "+94770000000" },
  });

  if (!curator) {
    curator = await prisma.user.create({
      data: {
        phone: "+94770000000",
        name: "LankaReview Editorial",
        city: "Colombo",
        languagePref: "en",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        reviewCount: 42,
        photoCount: 128,
        eliteYear: 2026,
      },
    });
  }

  // 2. Fetch businesses to link
  const ministry = await prisma.business.findFirst({ where: { slug: "ministry-of-crab" } });
  const upalis = await prisma.business.findFirst({ where: { slug: "upalis-by-nawaloka" } });
  const nihonbashi = await prisma.business.findFirst({ where: { slug: "nihonbashi-colombo" } });
  const cafeKumbuk = await prisma.business.findFirst({ where: { slug: "cafe-kumbuk" } });
  const barefoot = await prisma.business.findFirst({ where: { slug: "barefoot-garden-cafe" } });
  const spaCeylon = await prisma.business.findFirst({ where: { slug: "spa-ceylon-colombo" } });
  const toniGuy = await prisma.business.findFirst({ where: { slug: "toni-and-guy-colombo" } });
  const abans = await prisma.business.findFirst({ where: { slug: "abans-elite-service-center" } });
  const dimo = await prisma.business.findFirst({ where: { slug: "dimo-automobile-service-centre" } });
  const threeWheel = await prisma.business.findFirst({ where: { slug: "three-wheel-auto-care" } });

  const collectionsData = [
    {
      name: "Colombo's Iconic Dining & Seafood",
      slug: "colombo-iconic-dining",
      isPublic: true,
      businessIds: [ministry?.id, upalis?.id, nihonbashi?.id].filter(Boolean) as string[],
    },
    {
      name: "Must-Visit Artisan Cafes & Bakeries",
      slug: "artisan-cafes-and-bakeries",
      isPublic: true,
      businessIds: [cafeKumbuk?.id, barefoot?.id].filter(Boolean) as string[],
    },
    {
      name: "Ayurvedic Retreats & Premier Spas",
      slug: "ayurvedic-retreats-and-spas",
      isPublic: true,
      businessIds: [spaCeylon?.id, toniGuy?.id].filter(Boolean) as string[],
    },
    {
      name: "Trusted Vehicle Workshops & Tuk Care",
      slug: "trusted-vehicle-workshops",
      isPublic: true,
      businessIds: [dimo?.id, threeWheel?.id, abans?.id].filter(Boolean) as string[],
    },
  ];

  for (const c of collectionsData) {
    const existing = await prisma.collection.findUnique({ where: { slug: c.slug } });
    if (!existing) {
      const created = await prisma.collection.create({
        data: {
          userId: curator.id,
          name: c.name,
          slug: c.slug,
          isPublic: true,
          isDefault: false,
        },
      });

      for (const bizId of c.businessIds) {
        await prisma.collectionItem.upsert({
          where: {
            collectionId_businessId: {
              collectionId: created.id,
              businessId: bizId,
            },
          },
          update: {},
          create: {
            collectionId: created.id,
            businessId: bizId,
          },
        });
      }
      console.log(`Created collection: ${c.name} (${c.slug})`);
    } else {
      console.log(`Collection already exists: ${c.slug}`);
    }
  }

  console.log("Seeding complete!");
}

seedCollections()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
