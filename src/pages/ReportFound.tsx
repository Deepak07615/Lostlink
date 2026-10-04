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
    <div className="report-page">
      <div className="report-header">
        <div className="report-eyebrow">FOUND ITEM REPORT</div>

        <h1>Report a Found Item</h1>

        <p>
          Tell us about the item you found and we'll help connect it with its
          owner.
        </p>
      </div>

      <div className="report-card">
        <div className="report-card-header">
          <div className="report-card-icon">🔎</div>

          <div>
            <h2>Found Item Details</h2>
            <p>Provide as much information as possible.</p>
          </div>
        </div>

        <form className="report-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="itemName">
              Item Name <span>*</span>
            </label>

            <input
              id="itemName"
              name="itemName"
              type="text"
              placeholder="Example: Black Backpack"
              required
            />

            <small>Give the item a simple, recognizable name.</small>
          </div>

          <div className="form-field">
            <label htmlFor="category">
              Category <span>*</span>
            </label>

            <select
              id="category"
              name="category"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Select a category
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

          <div className="form-field">
            <label htmlFor="description">
              Description <span>*</span>
            </label>

            <textarea
              id="description"
              name="description"
              rows={5}
              placeholder="Describe the item, colour, brand, unique marks, stickers, scratches, or anything that can help identify it..."
              required
            />

            <small>
              Unique details make matching more accurate.
            </small>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="location">
                Where did you find it? <span>*</span>
              </label>

              <input
                id="location"
                name="location"
                type="text"
                placeholder="Example: Central Library"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="eventTime">
                When did you find it? <span>*</span>
              </label>

              <input
                id="eventTime"
                name="eventTime"
                type="datetime-local"
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label>Item Photo</label>

            <div className="upload-box">
              <div className="upload-icon">📷</div>

              <div className="upload-text">
                <strong>Upload a photo of the item</strong>
                <span>JPG, PNG or other image formats</span>
              </div>

              <input
                name="image"
                type="file"
                accept="image/*"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="submit-report-button"
            >
              Submit Found Item
              <span>→</span>
            </button>

            <p>Your information will be securely stored in LostLink.</p>
          </div>
        </form>

        {submitted && (
          <div className="success-message">
            <strong>✓ Found item saved successfully.</strong>
          </div>
        )}

        {matchMessage && (
          <div className="match-result-message">
            {matchMessage}
          </div>
        )}

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}
      </div>

      <div className="report-help">
        <div className="report-help-card">
          <div>🔎</div>
          <h3>Smart Matching</h3>
          <p>
            LostLink automatically checks your report against lost items.
          </p>
        </div>

        <div className="report-help-card">
          <div>🔒</div>
          <h3>Private & Secure</h3>
          <p>
            Your personal information stays protected during the process.
          </p>
        </div>

        <div className="report-help-card">
          <div>🔔</div>
          <h3>Get Notified</h3>
          <p>
            We'll notify you when a potential match is found.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ReportFound;