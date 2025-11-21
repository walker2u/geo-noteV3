function withValidProperties(
  properties: Record<string, undefined | string | string[]>
) {
  return Object.fromEntries(
    Object.entries(properties).filter(([_, value]) =>
      Array.isArray(value) ? value.length > 0 : !!value
    )
  );
}

export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL as string;
  return Response.json({
    accountAssociation: {
      // these will be added in step 5
      header: "",
      payload: "",
      signature: "",
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
        "https://ex.co/s1.png",
        "https://ex.co/s2.png",
        "https://ex.co/s3.png",
      ],
      primaryCategory: "social",
      tags: ["example", "miniapp", "baseapp"],
      heroImageUrl: "https://geo-note-v3.vercel.app/uni-bg.png",
      tagline: "Play instantly",
      ogTitle: "Example Mini App",
      ogDescription: "Challenge friends in real time.",
      ogImageUrl: "https://ex.co/og.png",
      noindex: true,
    },
  }); // see the next step for the manifest_json_object
}
