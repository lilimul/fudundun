import React, { useRef, useEffect } from 'react'


export const Canvas = props => {
  
 
  let {reff,option_state,canvas_state,apple} =props;
  function handleClick(e){
    option_state.mode="POSITION";
    option_state.base = canvas_state.img.position;
    option_state = Object.assign({},option_state);
}

function handleMouseMove(e){
    const canvas = reff.current
    const canvasBox = canvas.getBoundingClientRect();
    if(option_state.mode==="POSITION"){
        option_state.latest.x = e.clientX - canvasBox.left;
        option_state.latest.y = e.clientY - canvasBox.top;
        option_state = Object.assign({},option_state);
        apple(option_state);
    }
}
function handleDoubleClick(e){
    console.log(e)
}
function handleMouseDown(e){
    option_state.mode="POSITIONStart";
    const canvas = reff.current
    const canvasBox = canvas.getBoundingClientRect();
    option_state.base.x = e.clientX - canvasBox.left;
    option_state.base.y = e.clientY - canvasBox.top;
    option_state = Object.assign({},option_state);
    apple(option_state);
}
function handleMosueUp(e){
    option_state.mode="POSITIONEnd";
    option_state.imgBase={x:0,y:0};
    option_state.base={x:0,y:0};
    option_state.latest={x:0,y:0};
    option_state = Object.assign({},option_state);
    apple(option_state);
}
  return <canvas width={canvas_state.size.width} height={canvas_state.size.height} onMouseUp={handleMosueUp} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} ref={reff} {...props}/>
}

