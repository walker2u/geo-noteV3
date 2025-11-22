function withValidProperties(properties) {
  return Object.fromEntries(
    Object.entries(properties).filter(([_, value]) =>
      Array.isArray(value) ? value.length > 0 : !!value
    )
  );
}

export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL;
  return Response.json({
    "accountAssociation": {
      "header": "eyJmaWQiOjE1MDMyMzcsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg1QzA3MDVFNTk0RjBkMGM1QUMwZkJCMTI0RDA0NzEyRTdDRTJFZjk0In0",
      "payload": "eyJkb21haW4iOiJnZW8tbm90ZS12My52ZXJjZWwuYXBwIn0",
      "signature": "br7vgbWQyhc7ELT5AaJvB8XTPQPCXa03wKlNsAOApkQsjeq6Epbq2v/i4xuec8M96guHBgPBI50uTfLg/Jzi2xs="
    },
    baseBuilder: {
      ownerAddress: "0x", // add your Base Account address here
    },
    miniapp: {
      version: "1",
      name: "GeoNote",
      iconUrl: "https://geo-note-v3.vercel.app/icon.png",
      homeUrl: "https://geo-note-v3.vercel.app",
      splashImageUrl: "https://geo-note-v3.vercel.app/uni-bg.jpg",
      splashBackgroundColor: "#171717",
      webhookUrl: "https://geo-note-v3.vercel.app/api/webhook",
      subtitle: "Fast, fun, social",
      description: "A map-based notes application.",
      screenshotUrls: [
        "https://geo-note-v3.vercel.app/s1.png",
        "https://geo-note-v3.vercel.app/s2.png",
        "https://geo-note-v3.vercel.app/s3.png",
      ],
      primaryCategory: "social",
      tags: ["example", "miniapp", "baseapp"],
      heroImageUrl: "https://geo-note-v3.vercel.app/uni-bg.png",
      tagline: "Play instantly",
      ogTitle: "Example Mini App",
      ogDescription: "Challenge friends in real time.",
      ogImageUrl: "https://ex.co/og.png",
      // noindex: true,
    },
  }); // see the next step for the manifest_json_object
}
