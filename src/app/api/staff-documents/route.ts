import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const staffRef = String(formData.get("staffRef") || "").replace(/[^a-zA-Z0-9-]/g, "");
    const side = formData.get("side");

    if (!(file instanceof File) || !staffRef || (side !== "front" && side !== "back")) {
      return NextResponse.json({ error: "Invalid document upload" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Upload a JPG, PNG, WebP or PDF file" }, { status: 415 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File must be 5 MB or smaller" }, { status: 413 });
    }

    const admin = getAdminClient();
    const { data: buckets, error: bucketListError } = await admin.storage.listBuckets();
    if (bucketListError) throw bucketListError;
    if (!buckets.some((bucket) => bucket.name === "staff-documents")) {
      const { error: bucketError } = await admin.storage.createBucket("staff-documents", {
        public: false,
        fileSizeLimit: MAX_FILE_SIZE,
        allowedMimeTypes: [...ALLOWED_TYPES],
      });
      if (bucketError) throw bucketError;
    }

    const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
    const path = `aadhaar/${staffRef}/${side}-${crypto.randomUUID()}.${extension}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error: uploadError } = await admin.storage
      .from("staff-documents")
      .upload(path, bytes, { contentType: file.type, upsert: false });

    if (uploadError) throw uploadError;
    return NextResponse.json({ path });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Document upload failed" },
      { status: 500 }
    );
  }
}
