export interface ClipEffect {
  id: string;
  type:
    | "blur"
    | "brightness"
    | "contrast"
    | "saturation"
    | "grayscale"
    | "sepia"
    | "vignette";
  intensity: number;
  enabled: boolean;
}

export interface Transition {
  id: string;
  type: "fade" | "dissolve" | "wipe" | "slide" | "zoom";
  duration: number;
}
