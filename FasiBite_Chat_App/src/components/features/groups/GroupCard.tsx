// src/components/features/groups/GroupCard.tsx

import Link from "next/link";
import Image from "next/image";
import { Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { PublicGroupDto, GroupType } from "@/types/customer/group";

interface GroupCardProps {
  group: PublicGroupDto;
}

export function GroupCard({ group }: GroupCardProps) {
  const getGroupTypeColor = (groupType: GroupType) => {
    switch (groupType) {
      case GroupType.Chat:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case GroupType.Community:
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getGroupTypeLabel = (groupType: GroupType) => {
    switch (groupType) {
      case GroupType.Chat:
        return "Nhóm chat";
      case GroupType.Community:
        return "Cộng đồng";
      default:
        return groupType;
    }
  };

  // Validate and get the image source
  const getImageSrc = () => {
    const placeholder = "/images/group-placeholder.svg";

    if (!group.groupAvatarUrl) {
      return placeholder;
    }

    // Check if it's a valid URL (starts with http/https) or a valid relative path (starts with /)
    const isValidUrl =
      group.groupAvatarUrl.startsWith("http://") ||
      group.groupAvatarUrl.startsWith("https://") ||
      group.groupAvatarUrl.startsWith("/");

    // Check if it's not just the string "string" or other invalid values
    const isValidValue =
      group.groupAvatarUrl !== "string" &&
      group.groupAvatarUrl.trim() !== "" &&
      group.groupAvatarUrl !== "null" &&
      group.groupAvatarUrl !== "undefined";

    // Skip Cloudinary URLs entirely since they're returning 404s
    const isCloudinaryUrl = group.groupAvatarUrl.includes("cloudinary.com");

    if (isCloudinaryUrl) {
      // Use placeholder for all Cloudinary URLs to avoid 404 errors
      return placeholder;
    }

    return isValidUrl && isValidValue ? group.groupAvatarUrl : placeholder;
  };

  // Handle image load errors
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const target = e.target as HTMLImageElement;
    target.src = "/images/group-placeholder.svg";
  };

  return (
    <Link href={`/groups/${group.groupId}`} className="block">
      <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
        <CardHeader className="p-0">
          <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-t-lg">
            <Image
              src={getImageSrc()}
              alt={group.groupName}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={handleImageError}
            />
          </AspectRatio>
        </CardHeader>

        <CardContent className="p-4">
          <CardTitle className="text-lg font-semibold line-clamp-2 mb-2">
            {group.groupName}
          </CardTitle>

          {group.description && (
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {group.description}
            </CardDescription>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <Users className="h-4 w-4" />
            <span>{group.memberCount.toLocaleString()} thành viên</span>
          </div>

          <Badge
            variant="secondary"
            className={getGroupTypeColor(group.groupType)}
          >
            {getGroupTypeLabel(group.groupType)}
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}
