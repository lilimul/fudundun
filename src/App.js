import React, { useState } from 'react';
import {useEffect,useMemo,useRef} from 'react'
import { Button,Typography,Input,Select  } from 'antd';
import { Slider } from 'antd';
import { FrownOutlined, SmileOutlined } from '@ant-design/icons';
import './App.css';
import {Canvas} from './components/Canvas';
const { Text } = Typography;
const { Option } = Select;


const App = () => {
  // Canvas DOM 引用（由 Canvas 组件内部绑定到 <canvas>）
  const canvasRef = useRef(null)
  // 画布侧状态：尺寸、蒙版、底图（位置/旋转/缩放等）
  let canvas_state = useMemo(
    () => ( {
    size :{
        width: 300,
        height: 300,
    },
    mask : {
        mid:1,
        src:"",
        obj:null,
    },
    img:{
      src:"",
        obj:null,
        position:{
            x:0,
            y:0
        },
        rotate:0,
        filter:"Origin",
        scale:1,
    }
  }),[]);
  // 交互侧状态：模式（绘制/移动等）以及拖拽过程需要的基准点
  let Option_state =useMemo(
    () => ( {
    mode: "DRAW",
    imgBase:{x:0,y:0},
    base:{x:0,y:0},
    latest:{
        x:0,
        y:0
    }
  }),[]);
  // 初始化配置：内置蒙版列表与缩放范围
  let init_config={
    maskPreset:[
      {name:"dundun挥手",src:"https://s2.loli.net/2022/02/10/HU59ItdyTJAuLBk.png"},
      {name:"dundun滑冰",src:"https://s2.loli.net/2022/02/10/XOs3h761HNgt9dW.png"},
    ],
    scale:{
      min:0.1,
      max:2,
      step:0.05
    }};
  // demo：保存 option_state（交互状态）；canvasState：保存 canvas_state（绘制状态）
  const [demo,setSemo] = useState(Option_state);
  const [canvasState,setCanvasState] = useState(canvas_state);
  function apple (e){
    // 状态机：根据 mode 更新图片位置/模式切换等，再触发重绘
    switch(e.mode){
        case "POSITION":
          canvasState.img.position = {x: e.imgBase.x+e.latest.x-e.base.x,y: e.imgBase.y+e.latest.y-e.base.y};
          break ;
        case "POSITIONStart":
          e.imgBase=canvasState.img.position;
          e.mode="POSITION";
          break ;
        case "POSITIONEnd":
          e.mode="DRAW";
          break ;  
          
        case "DRAW":
        default:
          break ;}
          
      setSemo({...e});
      setCanvasState({...canvasState});
  }
  function handleScale(newScale){
      // 缩放滑块：限制到 min/max 之间，并更新绘制状态
      newScale=handleScale>init_config.scale.max?init_config.scale.max:newScale;
      newScale=handleScale<init_config.scale.min?init_config.scale.min:newScale;
      canvasState.img.scale=newScale;
      setCanvasState({...canvasState});
  }
  const draw =(ref,state)=>{
    // 绘制底图：先清空画布，再按缩放/旋转/位移绘制图片
    const canvas = ref.current
    const context = canvas.getContext('2d')
    context.clearRect(0, 0, canvas.width, canvas.height);
    let imgWidth= 250*state.img.scale;
    let imgHeight=  250*state.img.scale * state.img.obj.height / state.img.obj.width;
    if(state.img.rotate!==0){
      let x = canvas.width / 2;
      let y = canvas.height / 2;
      context.translate(x, y);
      context.rotate(state.img.rotate);
      context.drawImage(state.img.obj, -imgWidth / 2+state.img.position.x, -imgHeight / 2+state.img.position.y, imgWidth, imgHeight);
      context.rotate(-state.img.rotate);
      context.translate(-x, -y);
    }else{
      context.drawImage(state.img.obj, state.img.position.x, state.img.position.y, imgWidth, imgHeight);
    }
    
  }
  const initMask=(src,state)=>{
    // 初始化蒙版：加载图片资源，加载完成后绘制到画布上层
    state.mask.obj=new Image();
    state.mask.obj.onload = function() {
     drawMask(canvasRef,state);
  };
  state.mask.obj.src = src;
  setCanvasState({...state});
  }
  const drawMask =(ref,state)=>{
    // 绘制蒙版：叠加到当前画布内容之上（不清空画布）
    const canvas = ref.current
    const context = canvas.getContext('2d')
    context.drawImage(state.mask.obj, 0, 0, 250, 250);
  }
  useEffect(() => {

    // 当交互状态或绘制状态变化时，重绘底图并叠加蒙版
    if(canvas_state.img.obj){
    draw(canvasRef,canvasState);
    drawMask(canvasRef,canvasState);
    }
    //const canvasBox = canvas.getBoundingClientRect();

    //setSemo(Option_state);
}, [demo,canvasState])
useEffect(() => {
  // 组件挂载后初始化默认蒙版与默认底图
  initMask('https://s2.loli.net/2022/02/10/XOs3h761HNgt9dW.png',canvasState);
  //https://s2.loli.net/2022/02/10/XOs3h761HNgt9dW.png 
  canvasState.img.obj=new Image();
  canvasState.img.obj.onload = function() {
    draw(canvasRef,canvas_state);
  };
  canvasState.img.obj.src = 'http://5b0988e595225.cdn.sohucs.com/images/20190418/729e09c154d24c44a0e655b706f77bb3.jpeg';
  setCanvasState({...canvasState});
}, []);
const ScaleSlide = props=>{
  // 缩放滑块：根据当前 value 高亮左右图标，并把变化回传给 handleChange
  const {min,max,value,handleChange} = props;
  const mid = ((max - min) / 2).toFixed(5);
  const preColorCls = value >= mid ? '' : 'icon-wrapper-active';
  const nextColorCls = value >= mid ? 'icon-wrapper-active' : '';
  return (
    <div className="icon-wrapper">
    <FrownOutlined className={preColorCls} />
    <Slider {...props} onChange={handleChange} value={value} />
    <SmileOutlined className={nextColorCls} />
  </div>
  )
}
const handleImgChange= (value)=>{
  // 选择不同预置蒙版后，重新加载并绘制蒙版
  initMask(value,canvasState);
}
const ImgInputer = props=>{
  // 选择预置蒙版（后续可扩展：输入自定义图片链接并合成）
  return (
    <Input.Group compact>
      <Select defaultValue={'disabled'} onChange={handleImgChange}>
      <Option value="disabled" disabled>
        选择你的dun
      </Option>
        {init_config.maskPreset.map(item=>(
        <Option value={item.src} key={item.src}>{item.name}</Option>
        ))}
      </Select>
    <Input style={{ width: 'calc(100% - 500px)' }} defaultValue="输入照片链接" />
    <Button type="primary">合成</Button>
  </Input.Group>
  )
};
  return (
  <div className="App">
    <Canvas reff={canvasRef} canvas_state={canvasState} option_state={demo} apple={apple} />
    <Button type="primary">导出</Button>
    <ScaleSlide min={init_config.scale.min} max={init_config.scale.max} value={canvasState.img.scale} step={init_config.scale.step} handleChange={handleScale}/>  
    <ImgInputer/>
    <Text>
    {/* {JSON.stringify(demo)}
    {JSON.stringify(canvasState)} */}
    </Text>
  </div>
)};

export default App;
