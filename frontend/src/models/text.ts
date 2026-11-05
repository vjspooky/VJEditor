export interface TextElement {
  id: string;
  content: string;

  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: "normal" | "italic";

  color: string;
  opacity: number;

  alignment: "left" | "center" | "right";

  letterSpacing: number;
  lineHeight: number;

  x: number;
  y: number;
  width: number;
  height: number;

  scale: number;
  rotation: number;

  strokeColor?: string;
  strokeWidth?: number;

  shadow?: boolean;
  shadowColor?: string;

  backgroundColor?: string;
  backgroundOpacity?: number;
  padding?: number;
  borderRadius?: number;
}
