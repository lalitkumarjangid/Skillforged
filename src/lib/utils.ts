import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalize resource type to valid enum values
 * Maps invalid types to the closest valid type
 */
export function normalizeResourceType(type: string): "article" | "video" | "exercise" | "project" | "documentation" {
  const validTypes = ["article", "video", "exercise", "project", "documentation"] as const;
  const normalizedType = String(type || "").toLowerCase().trim();
  
  // If already valid, return it
  if (validTypes.includes(normalizedType as any)) {
    return normalizedType as any;
  }
  
  // Map common invalid types to valid ones
  const typeMapping: Record<string, typeof validTypes[number]> = {
    "tutorial": "video",        // tutorials are typically video-based
    "guide": "article",         // guides are articles
    "document": "documentation", // documents are documentation
    "doc": "documentation",
    "reference": "documentation",
    "test": "exercise",         // tests are exercises
    "example": "article",       // examples are articles
    "sample": "article",
    "source": "article",
    "repo": "project",          // repos are projects
    "repository": "project",
    "github": "project",
    "code": "project",
  };
  
  // Check if there's a mapping for this type
  if (typeMapping[normalizedType]) {
    return typeMapping[normalizedType];
  }
  
  // Default to article if we can't determine
  return "article";
}
