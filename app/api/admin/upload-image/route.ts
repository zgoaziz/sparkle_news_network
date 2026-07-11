import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "drhxafgpq",
  api_key: process.env.CLOUDINARY_API_KEY || "461935458171723",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "x6MhWLxrcEnTr8HdHJAoss1iL44",
  secure: true,
});

function getExtensionFromMime(mimeType: string) {
  switch (mimeType) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    case "image/svg+xml":
      return ".svg";
    default:
      return ".bin";
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const data = typeof body?.data === "string" ? body.data : null;
    const filename =
      typeof body?.filename === "string" ? body.filename : "upload";
    const mimeType =
      typeof body?.mimeType === "string"
        ? body.mimeType
        : "application/octet-stream";

    if (!data) {
      return NextResponse.json(
        { message: "Missing image payload" },
        { status: 400 },
      );
    }

    if (!mimeType.startsWith("image/")) {
      return NextResponse.json(
        { message: "Only image files are supported" },
        { status: 400 },
      );
    }

    const matches = data.match(/^data:(.+);base64,(.+)$/i);
    if (!matches) {
      return NextResponse.json(
        { message: "Invalid base64 payload" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(matches[2], "base64");
    const ext = getExtensionFromMime(mimeType);
    const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_") || "upload"}${ext}`;

    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            public_id: safeName.replace(ext, ""),
            folder: "sparkle-news",
            resource_type: "image",
            use_filename: false,
            unique_filename: false,
          },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error("Cloudinary upload failed"));
              return;
            }
            resolve(result);
          },
        )
        .end(buffer);
    });

    const url = uploadResult.secure_url as string;
    return NextResponse.json({ url, filename: safeName });
  } catch (error) {
    console.error("upload-image error", error);
    return NextResponse.json(
      { message: "Unable to save uploaded image" },
      { status: 500 },
    );
  }
}
