import React from 'react';

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
  }
  ;

export default () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const roomTypes = Object.keys(ROOM_COLORS);

  return (
    <div>
    <div className="py-4 text-xl text-center">You can drag these nodes to the pane on top. Specify corners in each nodes. For default enter 0.</div>
    <div className='border-r border-gray-200 p-4 text-sm bg-gray-100 flex flex-row'>    
    
      {roomTypes.map((type) => (
        <div
          key={type}
          className="p-4 ml-2 rounded-md"
          onDragStart={(event) => onDragStart(event, type)}
          draggable
          style={{ backgroundColor: ROOM_COLORS[type] }}
        >
          {type.replace('_', ' ').toUpperCase()}
        </div>
      ))}
    </div>
    </div>
  );
};