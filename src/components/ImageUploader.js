import { useCallback, useState } from "react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

/**
 * ImageUploader component that allows users to upload an image, crop it, and then perform OCR on the cropped image.
 *
 * It manages state for the uploaded image source, crop coordinates, and the reference to the image element.
 * The component handles file selection, image loading, and cropping logic. After cropping, it can trigger
 * an OCR operation if `onCropped` is provided.
 *
 * @param {Function} onCropped - Callback function called with the cropped image blob when the crop button is clicked.
 */
const ImageUploader = ({ onCropped }) => {
  const [src, setSrc] = useState(null);
  const [crop, setCrop] = useState();
  const [imageRef, setImageRef] = useState(null);

  // Default crop helper
  /**
   * Centers and crops a media to fit a given aspect ratio.
   */
  function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 50,
        },
        aspect,
        mediaWidth,
        mediaHeight
      ),
      mediaWidth,
      mediaHeight
    );
  }

  /**
   * Handles file selection and sets the src with the file's data URL.
   */
  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setSrc(reader.result));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  /**
   * Handles image load event to set initial crop and image reference.
   */
  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1)); // square crop
    setImageRef(e.currentTarget);
  };

  const getCroppedImg = useCallback(() => {
    if (!imageRef || !crop?.width || !crop?.height) return;

    const canvas = document.createElement("canvas");
    const scaleX = imageRef.naturalWidth / imageRef.width;
    const scaleY = imageRef.naturalHeight / imageRef.height;
    canvas.width = Math.floor(crop.width * scaleX);
    canvas.height = Math.floor(crop.height * scaleY);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      imageRef,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob((blob) => {
      if (onCropped) onCropped(blob);
    }, "image/png");
  }, [imageRef, crop, onCropped]);

  return (
    <div>
      <input type="file" accept="image/*" onChange={onSelectFile} />
      {src && (
        <div>
          <ReactCrop
            crop={crop}
            onChange={(newCrop) => setCrop(newCrop)}
            aspect={1}
          >
            <img
              src={src}
              alt="Upload"
              onLoad={onImageLoad}
              style={{ maxWidth: "100%" }}
            />
          </ReactCrop>
          <button onClick={getCroppedImg}>Crop & OCR</button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
