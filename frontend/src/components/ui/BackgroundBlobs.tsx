export default function BackgroundBlobs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Red blob top-right */}
      <div
        className="absolute -top-40 -right-20 w-[600px] h-[600px] animate-blob"
        style={{
          background:
            "radial-gradient(circle, rgba(230,57,70,0.28) 0%, transparent 70%)",
        }}
      />
      {/* Purple blob bottom-left */}
      <div
        className="absolute -bottom-40 -left-20 w-[500px] h-[500px] animate-blob"
        style={{
          background:
            "radial-gradient(circle, rgba(138,43,226,0.15) 0%, transparent 70%)",
          animationDelay: "3s",
        }}
      />
      {/* Center ambient */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px]"
        style={{
          background:
            "radial-gradient(ellipse, rgba(230,57,70,0.07) 0%, transparent 60%)",
        }}
      />
    </div>
  );
}
