import React from "react";

interface ClickableBaseEdgeProps {
  interactionWidth?: number;
  onClick?: React.MouseEventHandler<SVGPathElement>;
  path?: string;
  id?: string;
  style?: React.CSSProperties;
  markerEnd?: string;
  markerStart?: string;
}

const ClickableBaseEdge = ({
  id,
  path,
  style,
  markerEnd,
  markerStart,
  interactionWidth = 20,
  onClick,
}: ClickableBaseEdgeProps) => {
  return (
    <>
      <path
        id={id}
        style={style}
        d={path}
        fill="none"
        className="react-flow__edge-path"
        markerEnd={markerEnd}
        markerStart={markerStart}
      />
      {interactionWidth && (
        <path
          d={path}
          fill="none"
          strokeOpacity={0}
          strokeWidth={interactionWidth}
          className="react-flow__edge-interaction"
          onClick={onClick}
        />
      )}
    </>
  );
};

ClickableBaseEdge.displayName = "BaseEdge";

export default ClickableBaseEdge;
