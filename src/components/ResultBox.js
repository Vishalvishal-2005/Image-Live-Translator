import { useEffect, useState } from "react";

const ResultBox = ({ text }) => {
  const [translatedText, setTranslatedText] = useState("");
  const [targetLang, setTargetLang] = useState("ta"); // default Tamil
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const translateText = async () => {
      if (!text.trim()) {
        setTranslatedText("");
        return;
      }
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/translate/", {
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
