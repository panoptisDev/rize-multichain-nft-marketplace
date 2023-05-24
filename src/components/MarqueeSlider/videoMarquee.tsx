import React from "react";
import Marquee from "react-easy-marquee";
import VideoForPreview from "components/VideoForPreview";
import { config } from 'app/config';

interface HighlightPropArg {
  items: any;
  className?: string;
  speed?: number;
  delay?: number;
  width?: number;
  spaceBetween?: number;
}

const Highlight: React.FC<HighlightPropArg> = ({
  className = "",
  items,
  delay = 10,
  speed = 5,
  width = 300,
  spaceBetween = 500,
}) => {
  return (
    <div className="highlight-section w-full">
      <Marquee
        height={`${width}px`}
        duration={speed}
        reverse={true}
        align="center"
        width="100%"
      >
        {items?.map((item: any, index: number) => (
          <div
            className={`card`}
            key={index}
            style={{
              width: `${width}px`,
              aspectRatio: "1",
              marginLeft: `${spaceBetween}px`,
              marginRight: `${spaceBetween}px`,
              cursor: "pointer"
            }}
          >
            <VideoForPreview
              src={config.ipfsGateway + item}
              nftId={""}
              className="object-cover w-full h-full flex items-center justify-center"
            />
          </div>
        ))}
      </Marquee>
    </div>
  );
};

export default Highlight;
