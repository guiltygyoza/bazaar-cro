import { useState, useEffect } from 'react';
import './App.css';
import { TopologyNode } from "@topology-foundation/node";
// import type { TopologyObject } from "@topology-foundation/object";
// import { Bazaar } from "./objects/bazaar";
import { hslToRgb, rgbToHex, rgbToHsl } from "./util/color";

const formatNodeId = (id: string): string => {
	return `${id.slice(0, 4)}...${id.slice(-4)}`;
};

const colorMap: Map<string, string> = new Map();

const hashCode = (str: string): number => {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = (hash << 5) - hash + str.charCodeAt(i);
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
};

const getColorForNodeId = (id: string): string => {
	if (!colorMap.has(id)) {
		const hash = hashCode(id);
		let r = (hash & 0xff0000) >> 16;
		let g = (hash & 0x00ff00) >> 8;
		let b = hash & 0x0000ff;

		// Convert to HSL and adjust lightness to be below 50%
		let [h, s, l] = rgbToHsl(r, g, b);
		l = l * 0.5; // Set lightness to below 50%

		// Convert back to RGB
		[r, g, b] = hslToRgb(h, s, l);
		const color = rgbToHex(r, g, b); // Convert RGB to hex
		colorMap.set(id, color);
	}
	return colorMap.get(id) || "#000000";
};

const createPeerTags = (peerIds: string[]): JSX.Element[] => {
    return peerIds.reduce((acc, peer, index) => {
        const peerTag = (
            <strong key={peer} style={{ color: getColorForNodeId(peer) }}>
                {formatNodeId(peer)}
            </strong>
        );

        // If it's not the first element, add a comma before the current element
        if (index > 0) {
            acc.push(<span>,</span>);
        }
        acc.push(peerTag);
        return acc;
    }, [] as JSX.Element[]);
};

function App() {
    const [node, setNode] = useState<TopologyNode>();
	const [peerId, setPeerId] = useState<string>("");
	const [peers, setPeers] = useState<string[]>([]);
	const [discoveryPeers, setDiscoveryPeers] = useState<string[]>([]);

	useEffect(() => {

		const startNode = async () => {
            const node = new TopologyNode;
			await node.start();
			setPeerId(node.networkNode.peerId);
			node.addCustomGroupMessageHandler("", (e) => {
				setPeers(node.networkNode.getAllPeers());
				setDiscoveryPeers(node.networkNode.getGroupPeers("topology::discovery"));
			});
            setNode(node);
			console.log('startNode() completed')
		};

		startNode();

		return () => {
			// Cleanup if necessary
		};
	}, []);

	return (
		<>
			<h1>Bazaar</h1>
			<p>Your Peer ID: <strong style={{color:getColorForNodeId(peerId)}}>{formatNodeId(peerId)}</strong></p>
			<p>Peers on dRAM: {createPeerTags(peers)}</p>
			<p>Discovery Peers: {createPeerTags(discoveryPeers)}</p>
		</>
	);
}

export default App;
