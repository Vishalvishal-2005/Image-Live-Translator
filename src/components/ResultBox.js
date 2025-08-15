import { useEffect, useState } from "react";

/**
 * ResultBox component for displaying recognized text and its translation.
 *
 * This component renders a card containing the original OCR output text,
 * a dropdown to select the target language for translation, and the translated text.
 * It fetches the translated text from an external API when the original text or
 * target language changes. The component manages loading states and handles errors
 * gracefully by displaying an error message if the translation fails.
 */
const ResultBox = ({ text }) => {
  const [translatedText, setTranslatedText] = useState("");
  const [targetLang, setTargetLang] = useState("ta"); // default Tamil
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    /**
     * Asynchronously translates text using a translation service and updates the UI with the result.
     *
     * This function checks if the input text is empty or contains only whitespace. If so, it clears any previously translated text.
     * Otherwise, it sets a loading state to true, sends a POST request to a translation API with the input text and target language,
     * processes the response to update the translated text, handles errors by setting an error message, and finally resets the
     * loading state.
     */
    const translateText = async () => {
      if (!text.trim()) {
        setTranslatedText("");
        return;
      }
      setLoading(true);
      try {
        const res = await fetch("https://translator-backend-r9zp.onrender.com/translate/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, target_lang: targetLang }),
        });
        const data = await res.json();
        setTranslatedText(data.translatedText);
      } catch (err) {
        setTranslatedText("❌ Translation failed");
      } finally {
        setLoading(false);
      }
    };
    translateText();
  }, [text, targetLang]);

  return (
    <div className="card shadow-sm mt-4">
      <div className="card-body">
        <h5 className="card-title text-primary">📄 Recognized Text (OCR Output)</h5>
        <textarea className="form-control mb-3" rows="5" value={text} readOnly />
        <div className="mb-3">
          <label className="form-label fw-bold">🌍 Select Target Language</label>
          <select className="form-select" value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
            <option value="ta">Tamil</option>
            <option value="hi">Hindi</option>
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
            <option value="de">German</option>
            <option value="ar">Arabic</option>
            <option value="zh">Chinese</option>
            <option value="ja">Japanese</option>
          </select>
        </div>

        {loading ? <div className="alert alert-info">⏳ Translating...</div> :
          translatedText && (
            <>
              <h5 className="text-success mt-4">✅ Translated Text</h5>
              <textarea className="form-control" rows="5" value={translatedText} readOnly />
            </>
          )}
      </div>
    </div>
  );
};

export default ResultBox;
