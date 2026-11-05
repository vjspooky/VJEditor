export interface Keyframe {
  id: string;
  property: string;
  time: number;
  value: number | { x: number; y: number };
  easing:
    | "linear"
    | "ease-in"
    | "ease-out"
    | "ease-in-out";
}
