"use server";

import * as XLSX from "xlsx";

const N8N_WEBHOOK_URL = "https://n8n.srv1068103.hstgr.cloud/webhook/f787f9c7-012d-4c22-ae84-e8b7dee694e2";

interface ParsedRow {
  [key: string]: string | number | null;
}

interface BulkUploadResult {
  success: boolean;
  error?: string;
  rowCount?: number;
}

/**
 * Parse Excel or CSV file and send to n8n webhook
 * @param file - File data as ArrayBuffer
 * @param fileName - Original file name
 * @param selectedUserId - Selected user ID
 * @returns Result with success status and row count
 */
export async function bulkUploadPosts(
  file: ArrayBuffer,
  fileName: string,
  selectedUserId: string
): Promise<BulkUploadResult> {
  try {
    // Validate user ID
    if (!selectedUserId || selectedUserId.trim() === "") {
      return {
        success: false,
        error: "User ID is required",
      };
    }

    // Validate file type
    const fileExtension = fileName.split(".").pop()?.toLowerCase();
    if (fileExtension !== "xlsx" && fileExtension !== "csv") {
      return {
        success: false,
        error: "Invalid file type. Only .xlsx and .csv files are allowed.",
      };
    }

    // Parse the file
    let workbook: XLSX.WorkBook;
    try {
      if (fileExtension === "csv") {
        // Parse CSV
        const text = new TextDecoder().decode(file);
        workbook = XLSX.read(text, { type: "string" });
      } else {
        // Parse XLSX
        workbook = XLSX.read(file, { type: "array" });
      }
    } catch (parseError) {
      return {
        success: false,
        error: `Failed to parse file: ${parseError instanceof Error ? parseError.message : "Unknown error"}`,
      };
    }

    // Get the first sheet
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return {
        success: false,
        error: "No sheets found in the file",
      };
    }

    const worksheet = workbook.Sheets[firstSheetName];

    // Convert sheet to JSON array
    const rows: ParsedRow[] = XLSX.utils.sheet_to_json(worksheet, {
      raw: false, // Convert all values to strings
      defval: null, // Use null for empty cells
    });

    if (rows.length === 0) {
      return {
        success: false,
        error: "No data rows found in the file",
      };
    }

    // Send to n8n webhook
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedUserId,
          rows,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        return {
          success: false,
          error: `Webhook request failed: ${response.status} ${response.statusText}. ${errorText}`,
        };
      }

      return {
        success: true,
        rowCount: rows.length,
      };
    } catch (webhookError) {
      return {
        success: false,
        error: `Failed to send data to webhook: ${webhookError instanceof Error ? webhookError.message : "Unknown error"}`,
      };
    }
  } catch (error) {
    console.error("Error in bulkUploadPosts:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}


