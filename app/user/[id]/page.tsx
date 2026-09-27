import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star,
  MapPin,
  Calendar,
  Users,
  Camera,
  Bookmark,
  Building2,
  ChevronRight,
  ThumbsUp,
  Smile,
  Flame,
  User as UserIcon,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getRatingTierColor } from "@/components/ui/star-rating";
import { EditProfileDialog } from "@/components/user/edit-profile-dialog";
import { UserAvatar } from "@/components/ui/user-avatar";

interface UserProfilePageProps {
  params: Promise<{ id: string }>;
}

function ReadOnlyStars({ rating }: { rating: number }) {
  const tierColor = getRatingTierColor(rating);
  return (
    <span aria-label={`Rating: ${rating} out of 5`} className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          style={{ backgroundColor: n <= rating ? tierColor : "#C8C9CA" }}
          className="inline-flex size-4 items-center justify-center rounded-[3px] text-white"
        >
          <svg className="size-3 fill-current" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8-4.2-4.1 5.9-.9z" />
          </svg>
        </span>
      ))}
    </span>
  );
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-LK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-LK", {
    year: "numeric",
    month: "long",
  });
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { id } = await params;
  const session = await getSession();

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { id },
        { phone: id },
      ],
    },
    include: {
      reviews: {
        where: { visibilityStatus: "recommended" },
        orderBy: { createdAt: "desc" },
        include: {
          business: {
            select: {
              id: true,
              name: true,
              slug: true,
              district: true,
              primaryCategories: true,
              photos: { take: 1, select: { url: true } },
            },
          },
          photos: { select: { id: true, url: true, caption: true } },
        },
      },
      collections: {
        where: { isPublic: true },
        include: {
          _count: { select: { items: true } },
        },
      },
      uploadedPhotos: {
        take: 8,
        orderBy: { createdAt: "desc" },
        select: { id: true, url: true, caption: true },
      },
      _count: {
        select: {
          reviews: true,
          uploadedPhotos: true,
          collections: true,
        },
      },
    },
  });

  if (!user) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 mb-4">
          <UserIcon className="size-8" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">User Profile Not Found</h1>
        <p className="mt-2 text-neutral-500 max-w-md mx-auto">
          We couldn&apos;t find an active member profile for this user ID. The account may have been removed or updated.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="default" className="bg-[#D71616] hover:bg-[#B80F0F]">
            <Link href="/">Back to Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/directory">Browse Directory</Link>
          </Button>
        </div>
      </main>
    );
  }

  const isOwnProfile = session.userId === user.id;
  const displayName = user.name || "Community Reviewer";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const totalReviews = user._count.reviews;
  const totalPhotos = user._count.uploadedPhotos || user.photoCount;
  const totalFriends = user.friendCount;

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Yelp-style User Profile Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar Circle with Respective Profile Picture or Fallback Initials */}
            <UserAvatar src={user.avatarUrl} name={displayName} size="xl" />

            {/* User Bio & Meta */}
            <div className="flex flex-col items-center sm:items-start flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                  {displayName}
                </h1>
                {user.eliteYear && (
                  <span className="text-xs font-black uppercase px-2.5 py-1 rounded bg-[#D71616] text-white tracking-wider shadow-xs">
                    Elite &apos;{String(user.eliteYear).slice(-2)}
                  </span>
                )}
                {isOwnProfile && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                      Your Profile
                    </span>
                    <EditProfileDialog
                      initialName={user.name}
                      initialCity={user.city}
                      initialAvatarUrl={user.avatarUrl}
                    />
                  </div>
                )}
              </div>

              {/* City and Member Since */}
              <div className="mt-1.5 flex items-center gap-3 text-sm text-neutral-500 flex-wrap">
                {user.city && (
                  <span className="flex items-center gap-1 text-neutral-700 font-medium">
                    <MapPin className="size-4 text-neutral-400" />
                    {user.city}
                  </span>
                )}
                {user.city && <span>·</span>}
                <span className="flex items-center gap-1 text-neutral-500">
                  <Calendar className="size-4 text-neutral-400" />
                  Member since {formatMonthYear(user.createdAt)}
                </span>
              </div>

              {/* Yelp Stats Badges */}
              <div className="mt-4 flex items-center gap-4 sm:gap-6 flex-wrap pt-3 border-t border-neutral-100 w-full">
                <div className="flex items-center gap-1.5 text-neutral-700">
                  <Users className="size-4 text-sky-600" />
                  <span className="font-bold text-neutral-900">{totalFriends}</span>
                  <span className="text-xs text-neutral-500">Friends</span>
                </div>

                <div className="flex items-center gap-1.5 text-neutral-700">
                  <Star className="size-4 text-amber-500 fill-amber-500" />
                  <span className="font-bold text-neutral-900">{totalReviews}</span>
                  <span className="text-xs text-neutral-500">Reviews</span>
                </div>

                <div className="flex items-center gap-1.5 text-neutral-700">
                  <Camera className="size-4 text-emerald-600" />
                  <span className="font-bold text-neutral-900">{totalPhotos}</span>
                  <span className="text-xs text-neutral-500">Photos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Body */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {/* Quick Profile Navigation */}
            <Card className="bg-white border-neutral-200 shadow-xs">
              <CardContent className="p-4 flex flex-col gap-1">
                <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Profile Navigation
                </div>
                <div className="flex items-center justify-between px-3 py-2 rounded-md bg-neutral-100 font-semibold text-sm text-neutral-900">
                  <span className="flex items-center gap-2">
                    <Star className="size-4 text-[#D71616]" />
                    Reviews
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700">
                    {totalReviews}
                  </span>
                </div>

                {user.collections.length > 0 && (
                  <div className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-neutral-50 font-medium text-sm text-neutral-700">
                    <span className="flex items-center gap-2">
                      <Bookmark className="size-4 text-neutral-500" />
                      Collections
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                      {user.collections.length}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* About Me / Local Knowledge */}
            <Card className="bg-white border-neutral-200 shadow-xs">
              <CardContent className="p-5 flex flex-col gap-3">
                <h3 className="font-bold text-base text-neutral-900">About {displayName.split(" ")[0]}</h3>
                <div className="flex flex-col gap-2 text-sm text-neutral-600">
                  <div>
                    <span className="font-semibold text-neutral-900 block text-xs uppercase tracking-wider text-neutral-400 mb-0.5">
                      Hometown
                    </span>
                    <span>{user.city || "Colombo, Sri Lanka"}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-900 block text-xs uppercase tracking-wider text-neutral-400 mb-0.5">
                      Community Status
                    </span>
                    <span>
                      {user.eliteYear ? `Verified Yelp Elite Member (${user.eliteYear})` : "Active Local Contributor"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Main Content: Reviews */}
          <div className="md:col-span-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-neutral-900">
                Reviews written by {displayName.split(" ")[0]} ({user.reviews.length})
              </h2>
            </div>

            {user.reviews.length === 0 ? (
              <Card className="bg-white border-neutral-200 p-8 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 mb-3">
                  <Star className="size-6" />
                </div>
                <h3 className="font-bold text-base text-neutral-900">No public reviews yet</h3>
                <p className="mt-1 text-sm text-neutral-500">
                  {displayName} hasn&apos;t published any business reviews yet.
                </p>
              </Card>
            ) : (
              <div className="flex flex-col gap-4">
                {user.reviews.map((rev) => {
                  const leadPhoto = rev.business.photos[0]?.url;

                  return (
                    <Card key={rev.id} className="bg-white border-neutral-200 shadow-xs p-5">
                      <div className="flex flex-col gap-3">
                        {/* Business Header Link */}
                        <div className="flex items-start gap-3 pb-3 border-b border-neutral-100">
                          {leadPhoto ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={leadPhoto}
                              alt={rev.business.name}
                              className="size-14 rounded-md object-cover border border-neutral-200 shrink-0"
                            />
                          ) : (
                            <div className="flex size-14 items-center justify-center rounded-md bg-neutral-100 border border-neutral-200 text-neutral-400 shrink-0">
                              <Building2 className="size-6" />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <Link
                              href={`/business/${rev.business.slug}`}
                              className="font-bold text-base text-neutral-900 hover:text-[#D71616] hover:underline transition-colors flex items-center gap-1 group"
                            >
                              <span>{rev.business.name}</span>
                              <ChevronRight className="size-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                            </Link>
                            <span className="text-xs text-neutral-500">
                              {rev.business.primaryCategories.join(", ")} · {rev.business.district}
                            </span>
                          </div>
                        </div>

                        {/* Rating and Date */}
                        <div className="flex items-center gap-2 pt-1">
                          <ReadOnlyStars rating={rev.rating} />
                          <span className="text-xs text-neutral-500">
                            {formatDate(rev.createdAt)}
                          </span>
                        </div>

                        {/* Review Content */}
                        <p className="text-sm leading-relaxed text-neutral-800">
                          {rev.text}
                        </p>

                        {/* Photos */}
                        {rev.photos.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {rev.photos.map((photo) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                key={photo.id}
                                src={photo.url}
                                alt={photo.caption || "Review photo"}
                                className="size-20 rounded-md object-cover border border-neutral-200"
                              />
                            ))}
                          </div>
                        )}

                        {/* Reaction votes counter */}
                        <div className="flex items-center gap-3 pt-2 text-xs text-neutral-500 border-t border-neutral-100 mt-1">
                          <span className="flex items-center gap-1 text-neutral-600">
                            <ThumbsUp className="size-3.5 text-neutral-400" />
                            {rev.usefulCount} Useful
                          </span>
                          <span className="flex items-center gap-1 text-neutral-600">
                            <Smile className="size-3.5 text-neutral-400" />
                            {rev.funnyCount} Funny
                          </span>
                          <span className="flex items-center gap-1 text-neutral-600">
                            <Flame className="size-3.5 text-neutral-400" />
                            {rev.coolCount} Cool
                          </span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Public Collections if any */}
            {user.collections.length > 0 && (
              <div className="mt-4 flex flex-col gap-4">
                <h3 className="font-extrabold text-lg text-neutral-900">
                  Curated Collections by {displayName.split(" ")[0]}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.collections.map((col) => (
                    <Link
                      key={col.id}
                      href={`/collections/${col.slug}`}
                      className="flex items-center justify-between p-4 rounded-lg bg-white border border-neutral-200 hover:border-[#D71616]/40 hover:shadow-xs transition-all group"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-neutral-900 group-hover:text-[#D71616]">
                          {col.name}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {col._count.items} {col._count.items === 1 ? "place" : "places"}
                        </span>
                      </div>
                      <ChevronRight className="size-4 text-neutral-400 group-hover:text-[#D71616] transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
