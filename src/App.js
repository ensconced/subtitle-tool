import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import convert from "./convert";

function MyDropzone() {
  const onDrop = useCallback((acceptedFiles) => {
    const reader = new FileReader();
    reader.readAsText(acceptedFiles[0], "utf8");
    reader.addEventListener("loadend", () => {
      const result = convert(reader.result);
      const myBlob = new Blob([result], {
        type: "text/plain",
      });
      const blobUrl = URL.createObjectURL(myBlob);
      window.location.replace(blobUrl);
    });
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      style={{
        border: "20px solid pink",
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
      }}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the file here ...</p>
      ) : (
        <>
          <p>Drag 'n' drop your .srt file here, or click to select a file</p>
          <p>only supports .srt files!</p>
        </>
      )}
    </div>
  );
}
export default MyDropzone;
