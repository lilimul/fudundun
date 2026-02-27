import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Button, Typography, Input, Select, Slider } from 'antd';
import { FrownOutlined, SmileOutlined } from '@ant-design/icons';
import './App.css';
import { Canvas } from './components/Canvas';

const { Text } = Typography;
const { Option } = Select;

const INIT_CONFIG = {
  maskPreset: [
    { name: "dundun挥手", src: "https://s2.loli.net/2022/02/10/HU59ItdyTJAuLBk.png" },
    { name: "dundun滑冰", src: "https://s2.loli.net/2022/02/10/XOs3h761HNgt9dW.png" },
  ],
  scale: {
    min: 0.1,
    max: 2,
    step: 0.05
  }
};

const ScaleSlide = ({ min, max, value, handleChange }) => {
  const mid = ((max - min) / 2).toFixed(5);
  const preColorCls = value >= mid ? '' : 'icon-wrapper-active';
  const nextColorCls = value >= mid ? 'icon-wrapper-active' : '';
  return (
    <div className="icon-wrapper">
      <FrownOutlined className={preColorCls} />
      <Slider min={min} max={max} step={INIT_CONFIG.scale.step} onChange={handleChange} value={value} />
      <SmileOutlined className={nextColorCls} />
    </div>
  );
};

const ImgInputer = ({ onImgChange }) => {
  return (
    <Input.Group compact>
      <Select defaultValue={'disabled'} onChange={onImgChange}>
        <Option value="disabled" disabled>
          选择你的dun
        </Option>
        {INIT_CONFIG.maskPreset.map(item => (
          <Option value={item.src} key={item.src}>{item.name}</Option>
        ))}
      </Select>
      <Input style={{ width: 'calc(100% - 500px)' }} defaultValue="输入照片链接" />
      <Button type="primary">合成</Button>
    </Input.Group>
  );
};

const App = () => {
  const canvasRef = useRef(null);

  const [optionState, setOptionState] = useState({
    mode: "DRAW",
    imgBase: { x: 0, y: 0 },
    base: { x: 0, y: 0 },
    latest: { x: 0, y: 0 }
  });

  const [canvasState, setCanvasState] = useState({
    size: {
      width: 300,
      height: 300,
    },
    mask: {
      mid: 1,
      src: "",
      obj: null,
    },
    img: {
      src: "",
      obj: null,
      position: {
        x: 0,
        y: 0
      },
      rotate: 0,
      filter: "Origin",
      scale: 1,
    }
  });

  const draw = useCallback((state) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!state.img.obj) return;

    let imgWidth = 250 * state.img.scale;
    let imgHeight = 250 * state.img.scale * state.img.obj.height / state.img.obj.width;
    
    if (state.img.rotate !== 0) {
      let x = canvas.width / 2;
      let y = canvas.height / 2;
      context.translate(x, y);
      context.rotate(state.img.rotate);
      context.drawImage(state.img.obj, -imgWidth / 2 + state.img.position.x, -imgHeight / 2 + state.img.position.y, imgWidth, imgHeight);
      context.rotate(-state.img.rotate);
      context.translate(-x, -y);
    } else {
      context.drawImage(state.img.obj, state.img.position.x, state.img.position.y, imgWidth, imgHeight);
    }
  }, []);

  const drawMask = useCallback((state) => {
    const canvas = canvasRef.current;
    if (!canvas || !state.mask.obj) return;
    const context = canvas.getContext('2d');
    context.drawImage(state.mask.obj, 0, 0, 250, 250);
  }, []);

  const initMask = useCallback((src, currentState) => {
    const maskObj = new Image();
    maskObj.crossOrigin = "Anonymous"; // Often needed for canvas operations
    maskObj.onload = function () {
      // Create a new state with the loaded image
      setCanvasState(prev => {
        const newState = {
            ...prev,
            mask: {
                ...prev.mask,
                obj: maskObj,
                src: src
            }
        };
        // We can't rely on 'currentState' here because it might be stale inside the callback
        // But drawMask needs the state.
        // Actually, we should trigger a re-render and let useEffect handle drawing.
        return newState;
      });
    };
    maskObj.src = src;
  }, []);

  const handleCanvasEvent = (newOptionState) => {
    // We receive the updated optionState from Canvas.js
    // Logic for updating canvas position based on drag
    
    // Create a copy of canvasState to modify
    let newCanvasState = { ...canvasState, img: { ...canvasState.img, position: { ...canvasState.img.position } } };

    switch (newOptionState.mode) {
      case "POSITION":
        newCanvasState.img.position = {
          x: newOptionState.imgBase.x + newOptionState.latest.x - newOptionState.base.x,
          y: newOptionState.imgBase.y + newOptionState.latest.y - newOptionState.base.y
        };
        break;
      case "POSITIONStart":
        newOptionState.imgBase = { ...canvasState.img.position };
        newOptionState.mode = "POSITION";
        break;
      case "POSITIONEnd":
        newOptionState.mode = "DRAW";
        break;
      case "DRAW":
      default:
        break;
    }

    setOptionState({ ...newOptionState });
    if (newOptionState.mode === "POSITION") {
        setCanvasState(newCanvasState);
    }
  };

  const handleScale = (value) => {
    let newScale = value;
    if (newScale > INIT_CONFIG.scale.max) newScale = INIT_CONFIG.scale.max;
    if (newScale < INIT_CONFIG.scale.min) newScale = INIT_CONFIG.scale.min;
    
    setCanvasState(prev => ({
      ...prev,
      img: {
        ...prev.img,
        scale: newScale
      }
    }));
  };

  const handleImgChange = (value) => {
    initMask(value, canvasState);
  };

  // Initial load
  useEffect(() => {
    // Load initial mask
    initMask('https://s2.loli.net/2022/02/10/XOs3h761HNgt9dW.png', canvasState);

    // Load initial image
    const imgObj = new Image();
    imgObj.crossOrigin = "Anonymous";
    imgObj.onload = function () {
      setCanvasState(prev => ({
        ...prev,
        img: {
          ...prev.img,
          obj: imgObj,
          src: 'http://5b0988e595225.cdn.sohucs.com/images/20190418/729e09c154d24c44a0e655b706f77bb3.jpeg'
        }
      }));
    };
    imgObj.src = 'http://5b0988e595225.cdn.sohucs.com/images/20190418/729e09c154d24c44a0e655b706f77bb3.jpeg';
  }, []); // Run once on mount

  // Redraw whenever state changes
  useEffect(() => {
    if (canvasState.img.obj) {
      draw(canvasState);
      drawMask(canvasState);
    }
  }, [canvasState, draw, drawMask]);

  return (
    <div className="App">
      <Canvas 
        reff={canvasRef} 
        canvas_state={canvasState} 
        option_state={optionState} 
        apple={handleCanvasEvent} 
      />
      <Button type="primary">导出</Button>
      <ScaleSlide 
        min={INIT_CONFIG.scale.min} 
        max={INIT_CONFIG.scale.max} 
        value={canvasState.img.scale} 
        handleChange={handleScale} 
      />
      <ImgInputer onImgChange={handleImgChange} />
      <Text>
        {/* Debug info if needed */}
      </Text>
    </div>
  );
};

export default App;
