import React, { useState } from 'react';
import {useEffect,useMemo,useRef} from 'react'
import { Button,Typography,Input,Select, Upload, message, Spin  } from 'antd';
import { Slider } from 'antd';
import { FrownOutlined, SmileOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import './App.css';
import {Canvas} from './components/Canvas';
const { Text } = Typography;
const { Option } = Select;

const API_BASE_URL = 'http://localhost:5000';

const App = () => {
  const canvasRef = useRef(null)
  const [loading, setLoading] = useState(false);
  const [composedImageUrl, setComposedImageUrl] = useState('');
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
  const [demo,setSemo] = useState(Option_state);
  const [canvasState,setCanvasState] = useState(canvas_state);
  function apple (e){
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
      newScale=newScale>init_config.scale.max?init_config.scale.max:newScale;
      newScale=newScale<init_config.scale.min?init_config.scale.min:newScale;
      canvasState.img.scale=newScale;
      setCanvasState({...canvasState});
  }
  const draw =(ref,state)=>{
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
    state.mask.obj=new Image();
    state.mask.obj.onload = function() {
     drawMask(canvasRef,state);
  };
  state.mask.obj.src = src;
  setCanvasState({...state});
  }
  const drawMask =(ref,state)=>{
    const canvas = ref.current
    const context = canvas.getContext('2d')
    context.drawImage(state.mask.obj, 0, 0, 250, 250);
  }
  useEffect(() => {

    if(canvas_state.img.obj){
    draw(canvasRef,canvasState);
    drawMask(canvasRef,canvasState);
    }
}, [demo,canvasState])
useEffect(() => {
  initMask('https://s2.loli.net/2022/02/10/XOs3h761HNgt9dW.png',canvasState);
  canvasState.img.obj=new Image();
  canvasState.img.obj.onload = function() {
    draw(canvasRef,canvas_state);
  };
  canvasState.img.obj.src = 'http://5b0988e595225.cdn.sohucs.com/images/20190418/729e09c154d24c44a0e655b706f77bb3.jpeg';
  setCanvasState({...canvasState});
}, []);

const handleCompose = async () => {
  setLoading(true);
  try {
    const response = await fetch(`${API_BASE_URL}/api/compose-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        baseUrl: canvasState.img.src || 'http://5b0988e595225.cdn.sohucs.com/images/20190418/729e09c154d24c44a0e655b706f77bb3.jpeg',
        maskUrl: canvasState.mask.src || 'https://s2.loli.net/2022/02/10/XOs3h761HNgt9dW.png',
        x: canvasState.img.position.x,
        y: canvasState.img.position.y,
        scale: canvasState.img.scale,
        rotate: canvasState.img.rotate,
      }),
    });

    const data = await response.json();
    if (data.success) {
      setComposedImageUrl(`${API_BASE_URL}${data.url}`);
      message.success('图片合成成功！');
    } else {
      message.error('图片合成失败');
    }
  } catch (error) {
    console.error('Compose error:', error);
    message.error('合成失败，请确保后端服务已启动');
  } finally {
    setLoading(false);
  }
};

const handleExport = () => {
  if (composedImageUrl) {
    const link = document.createElement('a');
    link.href = composedImageUrl;
    link.download = 'composed-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    message.info('请先点击合成按钮');
  }
};

const handleBaseImageUpload = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (data.success) {
      canvasState.img.src = `${API_BASE_URL}${data.url}`;
      canvasState.img.obj = new Image();
      canvasState.img.obj.onload = () => {
        draw(canvasRef, canvasState);
      };
      canvasState.img.obj.src = canvasState.img.src;
      setCanvasState({...canvasState});
      message.success('基础图片上传成功！');
    }
  } catch (error) {
    console.error('Upload error:', error);
    message.error('图片上传失败');
  }
  return false;
};

const ScaleSlide = props=>{
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
  canvasState.mask.src = value;
  initMask(value,canvasState);
}
const ImgInputer = props=>{
  return (
    <Input.Group compact style={{ marginBottom: '20px' }}>
      <Upload beforeUpload={handleBaseImageUpload} showUploadList={false}>
        <Button icon={<UploadOutlined />}>上传基础图片</Button>
      </Upload>
      <Select defaultValue={'disabled'} onChange={handleImgChange} style={{ width: 200, marginLeft: 10 }}>
      <Option value="disabled" disabled>
        选择你的dun
      </Option>
        {init_config.maskPreset.map(item=>(
        <Option value={item.src} key={item.src}>{item.name}</Option>
        ))}
      </Select>
    <Button type="primary" onClick={handleCompose} loading={loading} style={{ marginLeft: 10 }}>合成</Button>
  </Input.Group>
  )
};
  return (
  <div className="App">
    <Spin spinning={loading}>
      <Canvas reff={canvasRef} canvas_state={canvasState} option_state={demo} apple={apple} />
      <div style={{ marginTop: 20 }}>
        <Button type="primary" onClick={handleExport} icon={<DownloadOutlined />} disabled={!composedImageUrl}>导出合成图片</Button>
      </div>
      {composedImageUrl && (
        <div style={{ marginTop: 20 }}>
          <h3>合成结果预览：</h3>
          <img src={composedImageUrl} alt="Composed" style={{ maxWidth: '300px', border: '1px solid #ddd' }} />
        </div>
      )}
      <ScaleSlide min={init_config.scale.min} max={init_config.scale.max} value={canvasState.img.scale} step={init_config.scale.step} handleChange={handleScale}/>  
      <ImgInputer/>
      <Text>
      {/* {JSON.stringify(demo)}
      {JSON.stringify(canvasState)} */}
      </Text>
    </Spin>
  </div>
)};

export default App;