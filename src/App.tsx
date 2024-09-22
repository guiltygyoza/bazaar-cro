import { useState, useEffect } from 'react';
import './App.css';
import { TopologyNode } from "@topology-foundation/node";
// import type { TopologyObject } from "@topology-foundation/object";
// import { Bazaar } from "./objects/bazaar";
import { hslToRgb, rgbToHex, rgbToHsl } from "./util/color";

const formatNodeId = (id: string): string => {
	return `${id.slice(0, 4)}...${id.slice(-4)}`;
};

const hashCode = (str: string): number => {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = (hash << 5) - hash + str.charCodeAt(i);
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
};

function App() {
	const [node, setNode] = useState<TopologyNode>();
	const [peerId, setPeerId] = useState<string>("");
	const [peers, setPeers] = useState<string[]>([]);
	const [discoveryPeers, setDiscoveryPeers] = useState<string[]>([]);

	const colorMap: Map<string, string> = new Map();

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
			if (index > 0) {
				acc.push(<span>,</span>);
			}
			acc.push(peerTag);
			return acc;
		}, [] as JSX.Element[]);
	};

	// init
	useEffect(() => {

		const startNode = async () => {
			const node_ = new TopologyNode;
			await node_.start();
			setPeerId(node_.networkNode.peerId);
			node_.addCustomGroupMessageHandler("", (e) => {
				setPeers(node_.networkNode.getAllPeers());
				setDiscoveryPeers(node_.networkNode.getGroupPeers("topology::discovery"));
				console.log('group message handler fired')
			});
			setNode(node_);
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
