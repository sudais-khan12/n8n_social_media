"use server";

import { createClient } from "@supabase/supabase-js";

/**
 * Get Supabase admin client
 */
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Upload image to Supabase Storage
 * @param file - File to upload (as base64 string or File)
 * @param fileName - Name for the file
 * @returns Public URL of the uploaded image
 */
export async function uploadImage(
  file: File | string,
  fileName?: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const bucketName = "post-images"; // You may need to create this bucket in Supabase

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = fileName
      ? fileName.split(".").pop()
      : file instanceof File
      ? file.name.split(".").pop()
      : "jpg";
    const uniqueFileName = `${timestamp}-${randomString}.${fileExtension}`;

    let fileData: ArrayBuffer | Uint8Array;

    if (file instanceof File) {
      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      fileData = new Uint8Array(arrayBuffer);
    } else {
      // Handle base64 string
      const base64Data = file.replace(/^data:image\/\w+;base64,/, "");
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      fileData = bytes;
    }

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(uniqueFileName, fileData, {
        contentType: file instanceof File ? file.type : "image/jpeg",
        upsert: false,
      });

    if (error) {
      // If bucket doesn't exist, return error
      if (error.message.includes("Bucket not found")) {
        return {
          success: false,
          error:
            "Storage bucket 'post-images' not found. Please create it in Supabase Storage.",
        };
      }
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(bucketName).getPublicUrl(uniqueFileName);

    return {
      success: true,
      url: publicUrl,
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while uploading the image",
    };
  }
}

/**
 * Delete image from Supabase Storage
 * @param imageUrl - URL of the image to delete
 * @returns Success status
 */
export async function deleteImage(
  imageUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!imageUrl) {
      return { success: true }; // Nothing to delete
    }

    const supabaseAdmin = getSupabaseAdmin();
    const bucketName = "post-images";

    // Extract filename from URL
    const urlParts = imageUrl.split("/");
    const fileName = urlParts[urlParts.length - 1].split("?")[0];

    // Delete from storage
    const { error } = await supabaseAdmin.storage
      .from(bucketName)
      .remove([fileName]);

    if (error) {
      // Don't throw error if file doesn't exist
      console.warn("Error deleting image:", error);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting image:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while deleting the image",
    };
  }
}


