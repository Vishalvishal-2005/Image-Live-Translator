import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import ImageUploader from "./components/ImageUploader";
import ResultBox from "./components/ResultBox";

/**
 * Main component for an OCR and text extraction tool with live camera functionality.
 *
 * This component manages state for OCR text, bounding boxes, image URL, and target language.
 * It includes handlers for image cropping, OCR processing, and starting a live camera feed for translation.
 * The UI consists of a header, uploader, image display with text boxes, extracted text result,
 * and a section to start the live camera with language selection.
 *
 * @returns JSX element representing the main application interface.
 */
const App = () => {
  const [ocrText, setOcrText] = useState("");
  const [boxes, setBoxes] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);
  const [targetLang, setTargetLang] = useState("en"); // Default target language

  /**
   * Handles the cropped image processing and OCR functionality.
   *
   * This function takes a blob, constructs a FormData object with it,
   * sends it to an OCR endpoint, and processes the response to update
   * the state with boxes data, OCR text, and image URL. It handles errors
   * by alerting the user in case of failure.
   *
   * @param {Blob} blob - The cropped image as a Blob object.
   */
  const handleCropped = async (blob) => {
    if (!blob) return;

    const formData = new FormData();
    formData.append("file", blob);

    try {
      const res = await fetch("http://localhost:8000/ocr/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        alert("OCR failed");
        return;
      }

      const data = await res.json();
      setBoxes(data.boxes || []);
      setOcrText(data.boxes.map((b) => b.text).join(" "));
      setImageUrl(URL.createObjectURL(blob));
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  /**
   * Starts the live camera and displays an alert on success or failure.
   */
  const startLiveCamera = async () => {
    try {
      await fetch(`http://localhost:8000/start-camera?lang=${targetLang}`);
      alert("Live camera started — check the Python window. Press 'q' to stop.");
    } catch (error) {
      alert("Error starting camera: " + error.message);
    }
  };

  return (
    <div className="container py-5">
      {/* Header */}
      <header className="text-center mb-5">
        <h1 className="fw-bold text-primary">📄 OCR & Crop Tool</h1>
        <p className="text-muted">
          Upload an image, crop it, extract text, and translate instantly.
        </p>
      </header>

      {/* Card */}
      <div className="card shadow-lg border-0 rounded-4 p-4">
        {/* Uploader */}
        <div className="mb-4">
          <ImageUploader onCropped={handleCropped} />
        </div>

        {/* Image with boxes */}
        {imageUrl && boxes.length > 0 && (
          <div className="position-relative mt-4">
            <img
              src={imageUrl}
              alt="Cropped"
              className="img-fluid rounded-3 border border-2 border-light shadow-sm"
            />
            <svg
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            >
              {boxes
                .filter((b) => b.w && b.h)
                .map((box) => (
                  <rect
                    key={box.id}
                    x={box.x ?? 0}
                    y={box.y ?? 0}
                    width={box.w ?? 1}
                    height={box.h ?? 1}
                    stroke="#ff4d4d"
                    strokeWidth="2"
                    rx="4"
                    fill="transparent"
                  />
                ))}
            </svg>
          </div>
        )}

        {/* Result Text */}
        <div className="mt-5">
          <h5 className="fw-semibold mb-3">📜 Extracted Text</h5>
          <ResultBox text={ocrText} />
        </div>

        {/* Live Camera Section */}
        <div className="mt-5">
          <h5 className="fw-semibold mb-3">🎥 Live Camera Translation</h5>
          <div className="d-flex align-items-center gap-3">
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="form-select w-auto"
            >
              <option value="en">English</option>
              <option value="ta">Tamil</option>
              <option value="hi">Hindi</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
              <option value="de">German</option>
              <option value="ar">Arabic</option>
              <option value="zh">Chinese</option>
              <option value="ja">Japanese</option>
            </select>
            <button
              className="btn btn-success fw-semibold"
              onClick={startLiveCamera}
            >
              🚀 Start Live Camera
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center mt-5 text-muted small">
        Built with ❤️ using React, FastAPI & Tesseract OCR
      </footer>
    </div>
  );
};

export default App;
