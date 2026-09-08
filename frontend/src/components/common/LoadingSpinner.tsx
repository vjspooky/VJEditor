export default function LoadingSpinner({ size = 20 }: { size?: number }) {
  return (
    <div
      className="inline-block animate-spin rounded-full border-2 border-neutral-600 border-t-indigo-500"
      style={{ width: size, height: size }}
    />
  );
}
