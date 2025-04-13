import { graphColors } from "@/components/assets/constants/color";
import { useTheme } from "@mui/material";
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const Recharts = ({ data, XAxisKey, toolTipLabels, YAxisKeys, label }) => {
  const { palette } = useTheme();

  const CustomLegend = ({ payload }) => {
    return (
      <div
        style={{ maxHeight: 60, overflowY: "auto" }}
        className="flex justify-center"
      >
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexWrap: "wrap",
            textAlign: "center",
          }}
        >
          {payload.map((entry, index) => (
            <li
              key={`legend-item-${index}`}
              style={{ marginRight: 10, cursor: "pointer" }}
              // onMouseOver={() => setActiveLabel(entry.dataKey)}
              // onMouseOut={() => setActiveLabel("")}
              // onClick={() =>
              //   setHardActiveLabel((prev) => ({
              //     label: prev.label === entry.dataKey ? null : entry.dataKey,
              //     color: prev.label === entry.dataKey ? null : entry.color,
              //   }))
              // }
            >
              <span style={{ color: entry.color }}>⬤</span> {entry.value}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <ResponsiveContainer
      width="100%"
      height={350}
      style={{
        transition: "all 0.5s",
      }}
    >
      <LineChart data={data}>
        {YAxisKeys.map((item, index) => (
          <Line
            key={index}
            type="monotone"
            dataKey={item}
            dot={false}
            // strokeWidth={activeLabel === item + "Request" ? 3 : 1}
            stroke={
              graphColors[palette.mode === "light" ? "lightMode" : "darkMode"][
                index
              ]
            }
            // label={activeLabel === item + "Request" ? customLabel : null}
          />
        ))}
        <XAxis
          dataKey={XAxisKey}
          tick={{ fill: palette.text.primary }}
          tickLine={{ stroke: palette.text.primary }}
          axisLine={{ stroke: palette.text.primary }}
        />
        <YAxis
          tick={{ fill: palette.text.primary }}
          tickLine={{ stroke: palette.text.primary }}
          axisLine={{ stroke: palette.text.primary }}
          label={{
            //   value: "Requests used",
            angle: -90,
            position: "insideLeft",
            fill: palette.text.primary,
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: palette.background.defaultSolid,
            color: palette.text.primary,
            borderRadius: "0.5rem",
          }}
          itemStyle={{ color: palette.text.primary }}
          cursor={{ stroke: "transparent", strokeWidth: 1 }}
          formatter={(value, name) => [
            `${value} ${label}`,
            toolTipLabels[name] || name,
          ]}
        />
        <Legend
          content={<CustomLegend />}
          verticalAlign="bottom"
          align="center"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Recharts;
