import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { TopologyNode } from "@topology-foundation/node";

const node = new TopologyNode();
await node.start();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App node={node}/>
  </StrictMode>,
)