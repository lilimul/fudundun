import React from 'react';

export const Canvas = props => {
  const { reff, option_state, canvas_state, apple } = props;

  function handleMouseDown(e) {
    const canvas = reff.current;
    const canvasBox = canvas.getBoundingClientRect();
    
    const newOptionState = {
        ...option_state,
        mode: "POSITIONStart",
        base: {
            x: e.clientX - canvasBox.left,
            y: e.clientY - canvasBox.top
        }
    };
    apple(newOptionState);
  }

  function handleMouseMove(e) {
    if (option_state.mode === "POSITION") {
        const canvas = reff.current;
        const canvasBox = canvas.getBoundingClientRect();
        
        const newOptionState = {
            ...option_state,
            latest: {
                x: e.clientX - canvasBox.left,
                y: e.clientY - canvasBox.top
            }
        };
        apple(newOptionState);
    }
  }

  function handleMouseUp(e) {
    const newOptionState = {
        ...option_state,
        mode: "POSITIONEnd",
        imgBase: { x: 0, y: 0 },
        base: { x: 0, y: 0 },
        latest: { x: 0, y: 0 }
    };
    apple(newOptionState);
  }

  return (
    <canvas 
        width={canvas_state.size.width} 
        height={canvas_state.size.height} 
        onMouseUp={handleMouseUp} 
        onMouseDown={handleMouseDown} 
        onMouseMove={handleMouseMove} 
        ref={reff} 
        {...props}
    />
  );
};
