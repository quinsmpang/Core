import {Node} from '../../node/Node';
import {NodeRenderer} from '../../renderer/NodeRenderer';
import {Constructor} from '../../../../Core/types';
import {Dictionary} from '../../../../Core/Collections/Dictionary';


export class NodeRendererMap {

    private readonly renderers: Dictionary<Constructor<Node>, NodeRenderer> =
        new Dictionary<Constructor<Node>, NodeRenderer>();


    public add(nodeRenderer: NodeRenderer): void {
        for (let nodeType of nodeRenderer.getNodeTypes()) {
            // Overwrite existing renderer
            this.renderers.set(nodeType, nodeRenderer);
        }
    }

    public render(node: Node): void {
        let nodeRenderer: NodeRenderer = this.renderers.get(node.constructor as Constructor<Node>);
        if (nodeRenderer != null) {
            nodeRenderer.render(node);
        }
    }
}
