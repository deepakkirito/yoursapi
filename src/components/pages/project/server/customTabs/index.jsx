import Link from "next/link";
import { useRouter } from "next/navigation";

const { Box } = require("@mui/material");
const { useState, useRef, useEffect, useMemo } = require("react");

const CustomTabs = ({
  tabs = [],
  activeTab,
  setActiveTab,
  projectId,
  shared,
  disabled,
}) => {
  const [hoverStyle, setHoverStyle] = useState({
    left: 0,
    width: 0,
    height: 0,
  });
  const containerRef = useRef(null);
  const router = useRouter();

  const handleHover = (index) => {
    const container = containerRef.current;
    const tabs = container?.querySelectorAll(".tab-item");
    const hovered = tabs?.[index];

    if (hovered) {
      setHoverStyle({
        left: hovered.offsetLeft,
        width: hovered.offsetWidth,
        height: hovered.offsetHeight,
      });
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const tabs = container?.querySelectorAll(".tab-item");
    const hovered = tabs?.[activeTab];

    if (hovered) {
      setHoverStyle({
        left: hovered.offsetLeft,
        width: hovered.offsetWidth,
        height: hovered.offsetHeight,
      });
    }
  }, [containerRef, activeTab]);

  const updatedTabs = useMemo(() => {
    return tabs.map((item, index) => ({
      ...item,
      link: `/projects/${shared ? "shared/" : ""}${projectId}/${item.linkValue}`,
    }));
  }, [tabs, projectId, shared]);

  return (
    <>
      <div className="hidden md:flex gap-2 items-center absolute transition-all duration-300">
        <Box
          className="tab-indicator"
          sx={{
            backgroundColor: "background.default",
            borderRadius: "0.5rem",
            color: "transparent",
            transition: "all 300ms ease",
            position: "absolute",
            top: 0,
            left: `${hoverStyle.left}px`,
            width: `${hoverStyle.width}px`,
            height: `${hoverStyle.height}px`,
            transform: "translateY(-50%)",
          }}
        >
          <span></span>
        </Box>
      </div>

      <div
        ref={containerRef}
        className="flex gap-4 items-center relative z-10 cursor-pointer"
      >
        {updatedTabs.map((item, index) => (
          <Box
            key={index}
            component={disabled ? "div" : Link}
            href={item?.link || "/"}
            name={item.value}
            className="flex gap-2 items-center text-sm font-medium p-2 tab-item"
            onMouseEnter={() => handleHover(index)}
            onMouseLeave={() => handleHover(activeTab)}
            onClick={() => (disabled ? null : setActiveTab(index))}
            sx={(theme) => ({
              backgroundColor:
                activeTab === index && !disabled
                  ? "background.defaultSolid"
                  : "transparent",
              borderRadius: "0.5rem",
              transition: "all 300ms ease",
              color: "text.primary",
              boxShadow:
                activeTab === index
                  ? "0 0 0.1rem " +
                    theme.palette.background.defaultSolid +
                    " inset"
                  : "none",
            })}
          >
            <span>{item.label}</span>
          </Box>
        ))}
      </div>
    </>
  );
};

export default CustomTabs;
