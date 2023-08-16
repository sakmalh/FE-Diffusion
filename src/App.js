import React, { useEffect, useState, useRef, useCallback } from 'react';
import ReactFlow, { ReactFlowProvider, useNodesState, useEdgesState, updateEdge, addEdge, MiniMap, Controls } from 'reactflow';
import Sidebar from './Sidebar';
import Loader from "react-loading";
import Modal from 'react-modal';
import 'reactflow/dist/base.css';

import CustomNode from './CustomNode';

const nodeTypes = {
  custom: CustomNode,
};

const getId = (nodes) => {
  let id = 0;
  while (true) {
    const isTaken = nodes.some((obj) => parseInt(obj.id) === id);
    if (!isTaken) {
      return id.toString()
    }
    id++
  }
};

const apiHostname = process.env.REACT_APP_API_HOSTNAME;

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


const roomTypes = Object.keys(ROOM_COLORS);

const initNodes = [
  {
    id: '0',
    type: 'custom',
    data: { type: 'Living Room', corners: '0'},
    position: { x: 0, y: 50 },
  },
  {
    id: '1',
    type: 'custom',
    data: { type: 'Bedroom', corners: '0'},
    position: { x: -200, y: 200 },
  },
];

const initEdges = [
  {
    id: 'e1-2',
    source: '0',
    target: '1',
  },
];

const extractProperties = (object) => {
  return {
    id: object.id,
    room_type: object.data.type,
    corners: object.data.corners,
  };
};

export default function App() {
  const edgeUpdateSuccessful = useRef(true);
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [Error, setError] = useState(false);
  const [dataURIs, setDataURIs] = useState([]);
  const [errorMessage, seterrorMessage] = useState('')
  const defaultViewport = { x: 0, y: 0, zoom: 2 };
  const [isToggleOn, setIsToggleOn] = useState(false);

  const handleToggleChange = () => {
    setIsToggleOn(!isToggleOn);
  };

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);
  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false;
  }, []);

  const onEdgeUpdate = useCallback((oldEdge, newConnection) => {
    edgeUpdateSuccessful.current = true;
    setEdges((els) => updateEdge(oldEdge, newConnection, els));
  }, []);

  const onEdgeUpdateEnd = useCallback((_, edge) => {
    if (!edgeUpdateSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }

    edgeUpdateSuccessful.current = true;
  }, []);

  const handleClose = () => setModalIsOpen(false);
  const handleErrorClose = () => setError(false)

  const generate = () => {
    const simplifiedList = nodes.map(extractProperties);
    console.log({ nodes: simplifiedList, edges: edges })
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes: simplifiedList, edges: edges, metrics: isToggleOn })
    };
    
    setLoading(true);
    setModalIsOpen(true);
    setError(false)

    fetch(`${apiHostname}/generate`, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        if (data.dataUri) {
          setDataURIs(data.dataUri);
        } else if (data.Error) {
          setError(true)
          seterrorMessage(data.Error)
        }
      });
  }

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      console.log(type)
    
      const newNode = {
        id: getId(nodes),
        type: 'custom',
        position,
        data: { type: `${type}`, corners: '0' },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, nodes]
  );

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <ReactFlowProvider>
        <div className="reactflow-wrapper" ref={reactFlowWrapper} style={{ width: '65vw', height: '65vh' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onEdgeUpdate={onEdgeUpdate}
            onEdgeUpdateStart={onEdgeUpdateStart}
            onEdgeUpdateEnd={onEdgeUpdateEnd}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            defaultViewport={defaultViewport}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            className="bg-teal-50"
          >
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
        <Sidebar />
      </ReactFlowProvider>
      <label class="relative inline-flex items-center mb-3 cursor-pointer mt-5">
        <input type="checkbox"
          className="sr-only peer"
          checked={isToggleOn}
          onChange={handleToggleChange}/> 
        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        <span class="ml-3 text-md font-medium text-gray-900 dark:text-gray-300">Metrics</span>
      </label>
      <button className='mt-5 bg-transparent hover:bg-green-500 text-green-700 text-2xl hover:text-white py-2 px-4 border-2  border-green-500 hover:border-transparent rounded' onClick={() => generate()} disabled={loading}>Generate</button>
        <Modal className="h-screen flex py-10 bg-gray-100 bg-opacity-75 items-center justify-center" ariaHideApp={false} isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)}>
        {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin inline-block w-12 h-12 border-[3px] border-current border-t-transparent text-blue-600 rounded-full" role="status" aria-label="loading">
                <span className="sr-only">Loading...</span>
              </div>
              <div className='text-2xl f font-semibold px-5'>Loading...</div>
            </div>       
          ) : Error ? ( 
            <div className="text-2xl text-red-600">Error occurred while generating layouts. {errorMessage}. Press Anywhere to Continue</div>
          ) : (
            <div>
                <div className='flex flex-row p-5'>
                  <div className="flex-1 text-3xl font-semibold">Generated Layouts</div>
                  <button onClick={() => generate()} disabled={loading} className="mx-4 px-2 text-xl items-center align-center h-8  bg-white text-gray-500 border-2 border-gray-500 rounded-md hover:text-white hover:bg-gray-500">
                    Generate
                  </button>
                  <button onClick={handleClose} className="items-center align-center h-8  bg-white text-red-400 hover:text-white hover:bg-red-400">
                  <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  </button>
                </div>
                <div className="grid px-5 py-5 gap-4">
                {dataURIs.map((dataUri, index) => (
                    <img src={dataUri} className="w-full h-full border-2 border-black" alt={`Data URI ${index + 1}`} />
                ))}
                </div>
                <div className='grid grid-cols-3 gap-1 text-center'>
                {roomTypes.map((type) => (
                  <div
                    key={type}
                    className="p-4 ml-2 rounded-md"
                    style={{ backgroundColor: ROOM_COLORS[type] }}
                  >
                    {type.replace('_', ' ').toUpperCase()}
                  </div>
                ))}
                </div>
            </div>
            )}
        </Modal>
      </div>
  );
};  