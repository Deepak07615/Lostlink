import { useState } from "react";
import { supabase } from "../lib/supabase";
import { findMatches } from "../lib/matchReports";

function ReportFound() {
  const [submitted, setSubmitted] = useState(false);
  const [matchMessage, setMatchMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSubmitted(false);
    setMatchMessage("");
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const itemName = formData.get("itemName") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const eventTime = formData.get("eventTime") as string;
    const imageFile = formData.get("image") as File;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Please log in before reporting an item.");
      return;
    }

    let imagePath: string | null = null;

    if (imageFile && imageFile.size > 0) {
      const fileExtension =
        imageFile.name.split(".").pop()?.toLowerCase() || "jpg";

      const filePath = `${user.id}/${crypto.randomUUID()}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from("item-images")
        .upload(filePath, imageFile, {
          contentType: imageFile.type,
          upsert: false,
        });

      if (uploadError) {
        setError(`Image upload failed: ${uploadError.message}`);
        return;
      }

      imagePath = filePath;
    }

    const { data: newReport, error: insertError } = await supabase
      .from("reports")
      .insert({
        user_id: user.id,
        report_type: "found",
        item_name: itemName,
        category,
        description,
        location,
        event_time: new Date(eventTime).toISOString(),
        image_url: imagePath,
      })
      .select()
      .single();

    if (insertError || !newReport) {
      setError(
        `Could not save report: ${
          insertError?.message || "Unknown error"
        }`
      );
      return;
    }

    setSubmitted(true);

    try {
      const matches = await findMatches(newReport);

      if (matches.length > 0) {
        setMatchMessage(
          `🔔 ${matches.length} potential match${
            matches.length > 1 ? "es" : ""
          } found!`
        );
      } else {
        setMatchMessage(
          "No potential matches found yet. LostLink will keep this report active."
        );
      }
    } catch (matchError) {
      console.error(matchError);

      setMatchMessage(
        "✅ Report saved. Matching could not be completed right now."
      );
    }

    form.reset();
  };

  return (
    <div style={{ maxWidth: "700px", margin: "40px auto", padding: "20px" }}>
      <h1>Report a Found Item</h1>

      <p>
        Tell us about the item you found so LostLink can look for its owner.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "16px" }}>
          <label>Item Name</label>

          <input
            name="itemName"
            type="text"
            placeholder="Black Backpack"
            required
            style={{ width: "100%", padding: "12px" }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label>Category</label>

          <select
            name="category"
            required
            defaultValue=""
            style={{ width: "100%", padding: "12px" }}
          >
            <option value="" disabled>
              Select category
            </option>

            <option>Electronics</option>
            <option>Wallet / Purse</option>
            <option>Bag</option>
            <option>Documents</option>
            <option>Keys</option>
            <option>Clothing</option>
            <option>Other</option>
          </select>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label>Description</label>

          <textarea
            name="description"
            placeholder="Describe the item and unique marks..."
            rows={5}
            required
            style={{ width: "100%", padding: "12px" }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label>Where did you find it?</label>

          <input
            name="location"
            type="text"
            placeholder="Central Library"
            required
            style={{ width: "100%", padding: "12px" }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label>When did you find it?</label>

          <input
            name="eventTime"
            type="datetime-local"
            required
            style={{ width: "100%", padding: "12px" }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label>Upload Item Photo</label>

          <input
            name="image"
            type="file"
            accept="image/*"
          />
        </div>

        <button type="submit">
          Submit Found Item
        </button>
      </form>

      {submitted && (
        <p style={{ marginTop: "20px" }}>
          ✅ Found item saved successfully.
        </p>
      )}

      {matchMessage && (
        <p style={{ marginTop: "10px" }}>
          {matchMessage}
        </p>
      )}

      {error && (
        <p style={{ marginTop: "10px" }}>
          ❌ {error}
        </p>
      )}
    </div>
  );
}

export default ReportFound;