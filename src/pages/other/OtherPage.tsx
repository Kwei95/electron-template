import { ipcRenderer } from "electron";
import React from "react";
import {Link} from 'react-router-dom';
import useIpcRenderer from '../../hook/useIpcRenderer'
export const OtherPage:React.FC= ()=>{
  const message=(event:any,arg:any)=>{
    console.log(event)
    console.log(arg)
  }

  const mainReply=(event:any,arg:any)=>{
    console.log(arg)
  }

  useIpcRenderer({
    'send-message':message,
    'main-reply':mainReply
  })

  return (
    <div>
      <div>其他</div>
      <Link to="/home">首页</Link>

      <div onClick={()=>{
        ipcRenderer.send('render-main-message', '来自render的异步消息')
      }}>
        发送异步信息
      </div>
    </div>
  )
}