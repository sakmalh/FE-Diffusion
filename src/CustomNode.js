import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { useCallback, useState } from 'react';

const ROOM_COLORS = {
    "Living Room": "#EE4D4D",
    "Kitchen": "#C67C7B",
    "Bedroom": "#FFD274",
    "Bathroom": "#BEBEBE",
    "Balcony": "#BFE3E8",
    "Entrance": "#7BA779",
    "Dining Room": "#E87A90",
    "Study Room": "#FF8C69",
    "Front Door": "#1F849B",
    "Unknown": "#727171",
    "Interior Door": "#D3A2C7"
  };

function CustomNode({ data }) {
  const type = data.type;
  const nodeColor = ROOM_COLORS[type] || '#FFFFFF';
  const [inputValue, setInputValue] = useState('0'); // Initialize the input value

  const onChange = useCallback((evt) => {
    const newValue = evt.target.value;
    // Validate if the input value is a valid number
    if (!isNaN(newValue) && newValue.trim() !== '') {
      // Update the input value if it's a valid number
      setInputValue(newValue);
      // Update the data object
      data.corners = newValue;
    }
  }, [data]);

  return (
    <div
      className="px-4 py-2 shadow-md rounded-md border-2 border-stone-400"
      style={{ backgroundColor: nodeColor }}
    >
      <div className="flex">
        <div className="ml-2">
          <div className="text-lg font-bold">{data.type}</div>
        </div>
        <input id="text" type="text" style={{ backgroundColor: nodeColor }} value={inputValue} name="text" onChange={onChange} className="nodrag w-10 px-2 mx-2 border-1 border-black" />
      </div>
      <Handle type="target" position={Position.Top} className="w-16 !bg-blue-200" />
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-blue-200" />
    </div>
  );
}

export default memo(CustomNode);
