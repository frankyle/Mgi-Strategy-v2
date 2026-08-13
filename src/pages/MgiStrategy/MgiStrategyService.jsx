// MgiStrategyService.js
import { supabase } from "../../supabaseClient";

// --- NEW CONSTANTS ---
const MGI_TABLE = "mgi_strategies";
const MGI_BUCKET = "mgi-images"; // Ensure this bucket exists in Supabase Storage

const CHART_FIELDS = [
  "daily_chart",
  "two_hr_chart",
  "one_hr_chart",
  "fifteen_min_chart",
  "mt5_chart",
  "profit_chart",
  "pnl_chart",
];
// ---------------------


const formatError = (error) => {
  console.error("MGI Service Error:", error);
  let message = "Unknown error occurred.";
  
  if (error && typeof error === "object") {
    if (error.message) {
      message = error.message;
    }
    if (error.details) {
      message += ` Details: ${error.details}`;
    }
    if (error.code) {
      message += ` [Code: ${error.code}]`;
    }
  } else if (typeof error === "string") {
    message = error;
  }
  
  return {
    success: false,
    error: { message },
  };
};

const getAuthUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
};

// --- RENAME: Uploads to the new MGI_BUCKET ---
export const uploadMgiImage = async (file, path) => {
  if (!file) return formatError("No file provided for upload.");

  try {
    const { error: uploadError } = await supabase.storage.from(MGI_BUCKET).upload(path, file, { upsert: true });
    if (uploadError) return formatError(uploadError);

    const { data: urlData } = supabase.storage.from(MGI_BUCKET).getPublicUrl(path);
    if (!urlData.publicUrl) return formatError("Failed to retrieve public URL after upload.");
    
    return { success: true, url: urlData.publicUrl };
  } catch (err) {
    return formatError(err);
  }
};

// --- RENAME: Deletes from the new MGI_BUCKET ---
export const deleteMgiImage = async (url) => {
  if (!url) return { success: true };
  try {
    let cleanPath = null;
    const publicMarker = "/object/public/";
    const idx = url.indexOf(publicMarker);

    if (idx !== -1) {
      const after = url.substring(idx + publicMarker.length);
      if (after.startsWith(`${MGI_BUCKET}/`)) {
        cleanPath = after.substring(MGI_BUCKET.length + 1);
      } else {
        const parts = after.split("/");
        parts.shift(); 
        cleanPath = parts.join("/");
      }
    }

    if (!cleanPath) {
      const fallback = url.split(`${MGI_BUCKET}/`)[1];
      if (fallback) cleanPath = fallback;
    }

    if (!cleanPath) {
        console.warn("Could not determine storage path for deletion:", url);
        return { success: true };
    }

    const { error } = await supabase.storage.from(MGI_BUCKET).remove([cleanPath]);
    if (error) {
        console.error("Storage deletion failed, continuing operation:", formatError(error).error.message);
    }
    return { success: true };
  } catch (err) {
    return formatError(err);
  }
};

// --- RENAME: Selects from the new MGI_TABLE ---
export const getMgiStrategies = async () => {
  try {
    const user = await getAuthUser();
    if (!user) return formatError("Authentication required: User not logged in.");

    const { data, error } = await supabase
      .from(MGI_TABLE)
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) return formatError(error);
    return { success: true, data };
  } catch (err) {
    return formatError(err);
  }
};

// --- RENAME: Inserts into the new MGI_TABLE, uses CHART_FIELDS ---
export const addMgiStrategy = async (idea) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return formatError("Authentication required: User not logged in.");

    if (!idea.date || !idea.pair) return formatError("Missing required fields: Date and Pair must be provided.");

    const payload = {
      date: idea.date,
      pair: idea.pair,
      signal: idea.signal || "Buy",
      day: new Date(idea.date).toLocaleDateString("en-US", { weekday: "long" }),
      user_id: user.id,
    };

    for (const field of CHART_FIELDS) {
      const fileOrUrl = idea[field];
      if (!fileOrUrl) continue;

      if (fileOrUrl instanceof File || (typeof Blob !== "undefined" && fileOrUrl instanceof Blob)) {
        let ext = "jpg";
        if (fileOrUrl.name) {
          const parts = fileOrUrl.name.split(".");
          if (parts.length > 1) ext = parts.pop();
        }
        
        const path = `${user.id}/${idea.pair.toUpperCase()}_${Date.now()}_${field}.${ext}`;
        const uploadRes = await uploadMgiImage(fileOrUrl, path);
        
        if (!uploadRes.success) {
            return formatError(`Failed to upload image ${field} (${fileOrUrl.name}): ${uploadRes.error.message}`);
        }
        payload[field] = uploadRes.url;
      } else if (typeof fileOrUrl === "string") {
        payload[field] = fileOrUrl;
      }
    }

    const { data, error } = await supabase
      .from(MGI_TABLE)
      .insert([payload])
      .select();

    if (error) return formatError(error);
    if (!data || data.length === 0) return formatError("Insert operation returned no data.");
    
    return { success: true, data };
  } catch (err) {
    return formatError(err);
  }
};

// --- RENAME: Updates the new MGI_TABLE, uses CHART_FIELDS ---
export const updateMgiStrategy = async (id, updatedFields = {}, existingIdea = {}) => {
  try {
    const user = await getAuthUser();
    if (!user) return formatError("Authentication required: User not logged in.");

    if (updatedFields.date) {
      updatedFields.day = new Date(updatedFields.date).toLocaleDateString("en-US", { weekday: "long" });
    }
    
    if (updatedFields.pair !== undefined && !updatedFields.pair.trim()) {
        return formatError("Pair field cannot be empty.");
    }


    for (const field of CHART_FIELDS) {
      const newVal = updatedFields[field];
      const oldVal = existingIdea[field];

      if (newVal && (newVal instanceof File || (typeof Blob !== "undefined" && newVal instanceof Blob))) {
        let ext = "jpg";
        if (newVal.name) {
          const parts = newVal.name.split(".");
          if (parts.length > 1) ext = parts.pop();
        }
        
        const pairName = updatedFields.pair || existingIdea.pair || "UNKNOWN";
        const path = `${user.id}/${pairName.toUpperCase()}_${Date.now()}_${field}.${ext}`;
        const uploadRes = await uploadMgiImage(newVal, path);
        
        if (!uploadRes.success) {
             return formatError(`Failed to upload new image ${field} (${newVal.name}): ${uploadRes.error.message}`);
        }

        updatedFields[field] = uploadRes.url;

        if (oldVal && typeof oldVal === "string" && oldVal !== uploadRes.url) {
          await deleteMgiImage(oldVal);
        }

        continue;
      }

      if (newVal === null && oldVal) {
        await deleteMgiImage(oldVal);
        continue;
      }

      if (typeof newVal === "string") continue;

      if (newVal === undefined) delete updatedFields[field];
    }

    if (Object.keys(updatedFields).length === 0) {
        return formatError("No fields provided for update.");
    }

    const { data, error } = await supabase.from(MGI_TABLE).update(updatedFields).eq("id", id).select();
    if (error) return formatError(error);
    if (!data || data.length === 0) return formatError("Update operation returned no data.");
    
    return { success: true, data };
  } catch (err) {
    return formatError(err);
  }
};

// --- RENAME: Deletes from the new MGI_TABLE, uses CHART_FIELDS ---
export const deleteMgiStrategyById = async (ideaOrId) => {
  try {
    let idea = null;
    let ideaId = (typeof ideaOrId === "object") ? ideaOrId.id : ideaOrId;

    if (typeof ideaOrId === "object") {
      idea = ideaOrId;
    } else {
      const { data, error } = await supabase.from(MGI_TABLE).select("*").eq("id", ideaId).single();
      if (error) return formatError(error);
      idea = data;
    }

    if (!idea) return formatError({ message: `MGI Strategy with ID ${ideaId} not found.` });

    // Delete all associated images (using new chart keys)
    for (const field of CHART_FIELDS) {
      if (idea[field]) await deleteMgiImage(idea[field]);
    }

    // Delete the database record
    const { error } = await supabase.from(MGI_TABLE).delete().eq("id", idea.id);
    if (error) return formatError(error);
    
    return { success: true };
  } catch (err) {
    return formatError(err);
  }
};



// curl -X POST 'https://pfkmawmztxmzgkottumd.supabase.co/storage/v1/bucket' \
// -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBma21hd216dHhtemdrb3R0dW1kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDMyMDEwMCwiZXhwIjoyMDc5ODk2MTAwfQ.6rWdOeXX8aT-qRHnqMGqOLR8WTBL_j0xnum9mWZTE0I' \
// -H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBma21hd216dHhtemdrb3R0dW1kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDMyMDEwMCwiZXhwIjoyMDc5ODk2MTAwfQ.6rWdOeXX8aT-qRHnqMGqOLR8WTBL_j0xnum9mWZTE0I' \
// -H 'Content-Type: application/json' \
// -d '{"id": "mgi-images", "name": "mgi-images", "public": true}'