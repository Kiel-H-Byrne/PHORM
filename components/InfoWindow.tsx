import { memo, useCallback } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { GLocation, IListing } from "../types";
import { MultipleInfoContent, SingleInfoContent } from "./";

// Error fallback component
const InfoWindowErrorFallback = ({
  error,
  resetErrorBoundary,
}: FallbackProps) => {
  return (
    <div
      style={{
        padding: "10px",
        backgroundColor: "white",
        border: "1px solid #ccc",
        borderRadius: "4px",
      }}
    >
      <h3 style={{ color: "red", margin: "0 0 8px 0" }}>
        Something went wrong
      </h3>
      <p style={{ fontSize: "12px", margin: "0" }}>{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        style={{
          marginTop: "8px",
          padding: "4px 8px",
          backgroundColor: "#f0f0f0",
          border: "1px solid #ccc",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
};

const MyInfoWindow = ({
  activeData,
  position: clusterCenter,
}: {
  activeData: IListing[];
  position: GLocation;
}) => {
  // Handle error boundary reset
  const handleErrorReset = useCallback(() => {
    console.log("InfoWindow error boundary reset");
  }, []);

  // Validate data
  if (!activeData || activeData.length === 0) {
    return null;
  }

  const hasOneItem = activeData.length === 1;

  // Configure InfoWindow options
  const options = {
    pixelOffset: { height: -40, width: 0, equals: () => false },
    disableAutoPan: true,
    position:
      hasOneItem && activeData[0].lat && activeData[0].lng
        ? { lat: activeData[0].lat, lng: activeData[0].lng }
        : clusterCenter,
    maxWidth: 300,
    zIndex: 10,
  };

  return (
    <ErrorBoundary
      FallbackComponent={InfoWindowErrorFallback}
      onReset={handleErrorReset}
    >
      {hasOneItem ? (
        <SingleInfoContent data={activeData} options={options} />
      ) : (
        <MultipleInfoContent data={activeData} options={options} />
      )}
    </ErrorBoundary>
  );
};

export default memo(MyInfoWindow);
