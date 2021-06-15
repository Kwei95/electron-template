import React, { useEffect, useState } from "react";
import {Link} from 'react-router-dom';
import {ipcRenderer,remote} from 'electron'
import useIpcRenderer from '../../hook/useIpcRenderer'
export const HomePage:React.FC= ()=>{ 
  const [progress,setProgress] = useState(0)
  const {Menu,MenuItem} = remote
  const message=(event:any,arg:any,info:any)=>{
    console.log(arg,info)
  }

  const downloadProgress=(event:any,arg:any,info:any)=>{
    console.log('downloadProgress',arg,info)
    console.log(arg&&arg.percent)
    setProgress(arg?.percent)
  }
  
  useEffect(()=>{
    ipcRenderer.on('message', message)
    return ()=>{
      ipcRenderer.removeListener('message',message)
    }
  })

  const mainReply=(event:any,arg:any)=>{
    console.log(arg)
  }

  
  const sendSync=()=>{
    let syncMessage = ipcRenderer.sendSync('render-main-message-sync', '来自render的消息')
    console.log(syncMessage)
  }

  useIpcRenderer({
    'main-reply':mainReply,
    'downloadProgress':downloadProgress
  })

  const handleContexMenu=(e:any)=>{
    e.preventDefault()
    const menu = new Menu()
    menu.append(new MenuItem({label:'复制', role: 'copy' }));
    menu.popup()
  }

  useEffect(()=>{
    window.addEventListener('contextmenu',handleContexMenu);
    return ()=>{
      window.removeEventListener('contextmenu',handleContexMenu)
    }
  })

  return (
    <div>
      <div>首页</div>
      <div onClick={()=>{
        ipcRenderer.send('open-other-window',{},'http://localhost:3000/#/other')
      }}>
        打开窗口
      </div>
      <div onClick={()=>{
        ipcRenderer.send('receive-message','发送')
      }}>
        发送
      </div>
      <div onClick={()=>{
        ipcRenderer.send('render-main-message', '来自render的异步消息')
      }}>
        发送异步信息
      </div>
      <div onClick={()=>{
        sendSync()
      }}>
        发送同步信息
      </div>
      <div onClick={()=>{
        ipcRenderer.send('check-update')
      }}>
        检查更新
      </div>
      <div onClick={()=>{
        ipcRenderer.send('download-update')
      }}>
        开始更新 
        {
          progress!==0&&(
            <span>{progress}</span>
          )
        }
      </div>
      <Link to="/other">其他页面</Link>
    </div>
  )
}