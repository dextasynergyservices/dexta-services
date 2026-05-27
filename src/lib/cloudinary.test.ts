import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { getCloudinaryPublicId, isCloudinaryUrl } from "@/lib/cloudinary";

const originalCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

afterEach(() => {
  if (originalCloudName === undefined) {
    delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    return;
  }

  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = originalCloudName;
});

describe("Cloudinary helpers", () => {
  it("recognizes template Cloudinary image URLs from any cloud", () => {
    assert.equal(
      isCloudinaryUrl(
        "https://res.cloudinary.com/dxoorukfj/image/upload/v1776872764/Dexta_4_gxj3vr.png",
      ),
      true,
    );
  });

  it("keeps external Cloudinary URLs intact when deriving a public id", () => {
    const externalUrl =
      "https://res.cloudinary.com/dxoorukfj/image/upload/v1776872764/Dexta_4_gxj3vr.png";

    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "school-admin-cloud";

    assert.equal(getCloudinaryPublicId(externalUrl), externalUrl);
  });

  it("keeps Cloudinary URLs intact when no cloud is configured", () => {
    const externalUrl =
      "https://res.cloudinary.com/dxoorukfj/image/upload/v1776872764/Dexta_4_gxj3vr.png";

    delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    assert.equal(getCloudinaryPublicId(externalUrl), externalUrl);
  });

  it("extracts the public id for URLs from the configured cloud", () => {
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "school-admin-cloud";

    assert.equal(
      getCloudinaryPublicId(
        "https://res.cloudinary.com/school-admin-cloud/image/upload/f_auto,q_auto/v1776872764/folder/campus.png",
      ),
      "folder/campus.png",
    );
  });
});
