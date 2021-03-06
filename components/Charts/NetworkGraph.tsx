import * as d3 from "d3";
import { SimulationNodeDatum } from "d3";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef } from "react";
import useMeasure from "react-use-measure";
import useNetwork from "../../lib/hooks/useNetwork";
import { capitalize, shortPrincipal } from "../../lib/strings";

type NodeType = "Subnet" | "Node" | "Principal" | "Provider" | "Operator";
type Node = {
  id: string;
  idx: number;
  type: NodeType;
  title: string;
  radius: number;
  color: string;
};
type Link = {
  source: string;
  target: string;
};

function mergeRecordSets<T>(recs: Record<string, Set<T>>[]) {
  return recs
    .flatMap((r) => Object.entries(r))
    .reduce((acc, [key, val]) => {
      if (acc[key]) {
        acc[key] = new Set([...acc[key], ...val]);
      } else {
        acc[key] = val;
      }
      return acc;
    }, {});
}

const color = d3.scaleOrdinal(d3.schemeCategory10);
const LABELS = ["Subnet", "Node", "Provider", "Operator"];

const NetworkGraph = ({
  activeType,
  activeId,
}: {
  activeType?: NodeType;
  activeId?: string;
}) => {
  const router = useRouter();
  const svgRef = useRef(null);
  const [ref, { width: containerWidth }] = useMeasure();
  const { data: network } = useNetwork();

  const width = containerWidth ? Math.max(500, containerWidth) : null;
  let height = 600;

  const principalsMap = useMemo(
    () =>
      network
        ? network.nodes.reduce(
            (acc, [nodeId, _, operatorIdx, providerIdx], idx) => {
              const keyOp = network.principals[operatorIdx][0];
              if (!acc[keyOp]) {
                acc[keyOp] = {};
              }
              if (!acc[keyOp].operator) {
                acc[keyOp].operator = [];
              }
              acc[keyOp].operator.push(idx);

              const keyPr = network.principals[providerIdx][0];
              if (!acc[keyPr]) {
                acc[keyPr] = {};
              }
              if (!acc[keyPr].provider) {
                acc[keyPr].provider = [];
              }
              acc[keyPr].provider.push(idx);
              return acc;
            },
            {}
          )
        : null,
    [network]
  );

  const selectRelatedIds = useCallback(
    (
      {
        type,
        id,
        subnetIdx,
      }: { type: NodeType; id?: string; subnetIdx?: number },
      depth = 1
    ): Record<string, Set<string>> => {
      if (!network) return;

      if (type === "Subnet") {
        const arr = network.nodes
          .filter(([_, subnet]) => subnet === subnetIdx)
          .map(([nodeId]) => nodeId);
        const res = { [depth]: new Set(arr) };
        if (depth < 2) {
          return mergeRecordSets(
            arr
              .map((nodeId) =>
                selectRelatedIds({ type: "Node", id: nodeId }, depth + 1)
              )
              .concat(res)
          );
        }
        return res;
      } else if (type === "Node") {
        const [_, subnet, operator, provider] = network.nodes.find(
          ([nodeId]) => nodeId === id
        );
        const arr = [
          network.subnets[subnet][0],
          network.principals[provider][0],
          network.principals[operator][0],
        ];
        const res = { [depth]: new Set(arr) };
        if (depth < 2) {
          return mergeRecordSets([
            res,
            selectRelatedIds({ type: "Subnet", subnetIdx: subnet }, depth + 1),
            ...arr
              .slice(1)
              .map((principalId) =>
                selectRelatedIds(
                  { type: "Provider", id: principalId },
                  depth + 1
                )
              ),
          ]);
        }
        return res;
      } else {
        const arr = (Object.values(principalsMap[id])[0] as number[]).map(
          (idx_) => network.nodes[idx_][0]
        );
        const res = { [depth]: new Set(arr) };
        if (depth < 2) {
          return mergeRecordSets(
            arr
              .map((nodeId) =>
                selectRelatedIds({ type: "Node", id: nodeId }, depth + 1)
              )
              .concat(res)
          );
        }
        return res;
      }
    },
    [network]
  );

  useEffect(() => {
    if (!width || !network) return;

    // Generate all nodes and links
    const nodes: Node[] = network.nodes
      .map(([id, _s, _o, _p, name], idx) => ({
        id,
        idx,
        type: "Node" as NodeType,
        title: name || shortPrincipal(id),
        radius: 6,
        color: color("Node"),
      }))
      .concat(
        network.principals.map(([id, name], idx) => {
          const type = capitalize(
            Object.keys(principalsMap[id])[0]
          ) as NodeType;
          return {
            id,
            idx,
            type,
            title: name || shortPrincipal(id),
            radius: 4,
            color: color(type),
          };
        })
      )
      .concat(
        network.subnets.map(([id, title], idx) => ({
          id,
          idx,
          type: "Subnet",
          title,
          radius: 8,
          color: color("Subnet"),
        }))
      );

    const links: Link[] = network.nodes.flatMap(
      ([id, subnet, operator, provider], i) => {
        return [
          {
            source: id,
            target: network.principals[operator][0],
          },
          {
            source: id,
            target: network.principals[provider][0],
          },
          {
            source: id,
            target: network.subnets[subnet][0],
          },
        ];
      }
    );

    // Filter nodes and links
    let activeNode,
      visibleLinks = links,
      visibleNodes = nodes;
    if (activeId && activeType) {
      // Smaller chart if viewing subset
      height = 300;

      let peers;
      if (activeType === "Subnet") {
        peers = selectRelatedIds({
          type: activeType,
          id: activeId,
          subnetIdx: network.subnets.findIndex(([id]) => id === activeId),
        });
      } else {
        peers = selectRelatedIds({
          type: activeType,
          id: activeId,
        });
      }

      visibleLinks = links.filter(
        (link) =>
          (peers[1].has(link.source) || peers[2].has(link.source)) &&
          (peers[1].has(link.target) || peers[2].has(link.target))
      );
      visibleNodes = nodes.filter(
        ({ id }) => peers[1].has(id) || peers[2].has(id)
      );
      activeNode = nodes.find(({ id }) => id === activeId);
    }

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0, 0, ${width}, ${height}`);

    svg.selectAll("*").remove();

    const drag = (simulation) => {
      return d3
        .drag()
        .on("start", (e) => {
          if (!e.active) simulation.alphaTarget(0.3).restart();
          e.subject.fx = e.subject.x;
          e.subject.fy = e.subject.y;
        })
        .on("drag", (e) => {
          e.subject.fx = e.x;
          e.subject.fy = e.y;
        })
        .on("end", (e) => {
          if (!e.active) simulation.alphaTarget(0);
          e.subject.fx = null;
          e.subject.fy = null;
        });
    };

    const onClick = (e: MouseEvent, d: Node) => {
      if (d.type === "Node") {
        router.push(`/node/${d.id}`);
      } else if (d.type === "Subnet") {
        router.push(`/subnet/${d.id}`);
      } else {
        router.push(`/principal/${d.id}`);
      }
    };
    const activateNode = (d: Node) => {
      const peers = selectRelatedIds({
        type: d.type,
        id: d.id,
        subnetIdx: d.idx,
      });
      svg
        .selectAll(".link")
        .filter(
          (n: any) =>
            !(
              n.target.id === d.id ||
              n.source.id === d.id ||
              peers[1].has(n.target.id) ||
              peers[1].has(n.source.id)
            )
        )
        .classed("inactive", true);

      svg
        .selectAll(".link")
        .filter((n: any) => n.target.id === d.id || n.source.id === d.id)
        .classed("active", true);

      svg
        .selectAll(".node")
        .filter((n: Node) => {
          return !(n.id === d.id || peers[1].has(n.id) || peers[2].has(n.id));
        })
        .classed("inactive", true);

      svg
        .selectAll(".node")
        .filter(
          (n: Node) => n.id === d.id || peers[1].has(n.id) || peers[2].has(n.id)
        )
        .classed("active", true);
      svg
        .selectAll(".node")
        .filter((n: Node) => n.id === d.id)
        .classed("selected", true);
    };
    const onMouseOut = (e: MouseEvent, d: Node) => {
      if (!activeId) {
        svg.selectAll(".node").classed("active inactive selected", false);
        svg.selectAll(".link").classed("active inactive", false);
      }
    };

    const simulation = d3
      .forceSimulation(visibleNodes as SimulationNodeDatum[])
      .force(
        "link",
        d3
          .forceLink(visibleLinks)
          .id((d: any) => d.id)
          .distance((d) => (activeNode ? 50 : 1))
      )
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg
      .append("g")
      .selectAll("line")
      .data(visibleLinks)
      .join("line")
      .attr(
        "class",
        `link stroke-current stroke-1 transition-colors transition-opacity pointer-events-none`
      );

    const node = svg
      .append("g")
      .selectAll(".node")
      .data(visibleNodes)
      .join("g")
      .attr(
        "class",
        "node transition-colors transition-opacity transition-100"
      );

    node
      .append("circle")
      .attr("class", "cursor-pointer")
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => d.color)
      .call(drag(simulation))
      .on("click", onClick)
      .on("mouseover", (e: MouseEvent, d: Node) => {
        if (!activeId) {
          activateNode(d);
        }
      })
      .on("mouseout", onMouseOut);

    node
      .append("text")
      .attr(
        "class",
        `fill-current text-xs pointer-events-none transition-opacity`
      )
      .attr("x", 5)
      .attr("y", 5)
      .text((d) => d.title);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => {
        const x = Math.max(d.radius, Math.min(width - d.radius, d.x));
        const y = Math.max(d.radius, Math.min(height - d.radius, d.y));
        return `translate(${x},${y})`;
      });
    });

    const legend = svg
      .append("g")
      .attr("class", "legend pointer-events-none")
      .attr("transform", "translate(30,30)");
    legend
      .selectAll("text")
      .data(LABELS)
      .join("text")
      .attr("class", "fill-current")
      .text((d) => d)
      .attr("x", 15)
      .attr("y", (d, i) => 5 + i * 25);
    legend
      .selectAll("circle")
      .data(LABELS)
      .join("circle")
      .attr("cx", 0)
      .attr("cy", (d, i) => i * 25)
      .attr("r", 7)
      .style("fill", (d) => color(d));

    if (activeNode) {
      activateNode(activeNode);
    }
  }, [network, activeId, width]);

  return (
    <div className="flex" ref={ref}>
      <svg className="w-full" width={width} height={height} ref={svgRef} />
    </div>
  );
};

export default NetworkGraph;
