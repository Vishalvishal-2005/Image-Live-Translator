import { useCallback, useState } from "react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const ImageUploader = ({ onCropped }) => {
  const [src, setSrc] = useState(null);
  const [crop, setCrop] = useState();
  const [imageRef, setImageRef] = useState(null);

  // Default crop helper
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

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setSrc(reader.result));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

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
