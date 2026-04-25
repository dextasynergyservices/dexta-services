import { Buffer } from "node:buffer";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadRawBufferToCloudinary({
  buffer,
  fileName,
  folder,
}: {
  buffer: Buffer;
  fileName: string;
  folder: string;
}) {
  const publicId = fileName.replace(/\.zip$/i, "");

  const result = await new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: "raw",
          format: "zip",
          overwrite: true,
        },
        (error, uploadResult) => {
          if (error) {
            reject(error);
            return;
          }

          if (!uploadResult?.secure_url) {
            reject(new Error("Cloudinary did not return an export URL."));
            return;
          }

          resolve({
            secure_url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
          });
        },
      );

      uploadStream.end(buffer);
    },
  );

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}
