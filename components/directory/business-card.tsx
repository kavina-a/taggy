import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface BusinessCardProps {
  slug: string;
  name: string;
  primaryCategory: string;
  district: string;
}

export function BusinessCard({
  slug,
  name,
  primaryCategory,
  district,
}: BusinessCardProps) {
  return (
    <Link
      href={`/business/${slug}`}
      data-primary-category={primaryCategory}
      className="block min-h-11 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="h-full transition-colors hover:bg-secondary/60">
        <CardContent className="flex flex-col gap-2">
          <h3 className="text-xl leading-[1.2] font-semibold">{name}</h3>
          <Badge variant="secondary" className="w-fit">
            {primaryCategory}
          </Badge>
          <p className="text-sm leading-normal text-muted-foreground">
            {district}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default BusinessCard;
