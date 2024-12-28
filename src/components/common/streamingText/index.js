import React, { memo, useEffect, useState } from "react";

const StreamingText = ({ text, speed = 50 }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    let index = 0;

    const intervalId = setInterval(() => {
      if (index <= text.length) {
        setDisplayedText(text.slice(0, index));
        index += 2;
      } else {
        clearInterval(intervalId);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed]);

  return <>{displayedText}</>;
};

export default memo(StreamingText);
