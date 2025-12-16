
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Ingredient, FilterState, GraphNode, GraphLink, CategoryType } from '../types';
import { CATEGORY_COLORS, INGREDIENTS_DATA } from '../constants';

interface GalaxyGraphProps {
  centerIngredient: Ingredient;
  filters: FilterState;
  onNodeClick: (nodeName: string) => void;
  onNodeHover: (nodeData: Ingredient | null, nodeName: string) => void;
}

const GalaxyGraph: React.FC<GalaxyGraphProps> = ({
  centerIngredient,
  filters,
  onNodeClick,
  onNodeHover
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  // Transform ref to keep track of zoom state across re-renders (navigation)
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);

  // Use refs for callbacks to keep them fresh without triggering effects
  const onNodeClickRef = useRef(onNodeClick);
  const onNodeHoverRef = useRef(onNodeHover);

  useEffect(() => {
    onNodeClickRef.current = onNodeClick;
    onNodeHoverRef.current = onNodeHover;
  }, [onNodeClick, onNodeHover]);
  
  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // INITIALIZATION EFFECT (Runs only once)
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    
    // 1. Defs & Filters (Only if not exists)
    if (svg.select('#glow').empty()) {
       const defs = svg.append('defs');
       const filter = defs.append('filter')
         .attr('id', 'glow')
         .attr('x', '-50%')
         .attr('y', '-50%')
         .attr('width', '200%')
         .attr('height', '200%');
         
       filter.append('feGaussianBlur')
         .attr('stdDeviation', '4')
         .attr('result', 'coloredBlur');
         
       filter.append('feMerge')
         .selectAll('feMergeNode')
         .data(['coloredBlur', 'SourceGraphic'])
         .enter()
         .append('feMergeNode')
         .attr('in', d => d);
    }

    // 2. Container Group (Only if not exists)
    let container = svg.select<SVGGElement>('.galaxy-container');
    if (container.empty()) {
        container = svg.append('g').attr('class', 'galaxy-container');
    }

    // 3. Zoom Behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        // Update the ref so we know where we are
        transformRef.current = event.transform;
        
        container.attr('transform', event.transform);
        
        // Sync Background for Parallax/Depth effect
        if (bgRef.current) {
          const t = event.transform;
          bgRef.current.style.backgroundPosition = `${t.x}px ${t.y}px`;
          bgRef.current.style.backgroundSize = `${40 * t.k}px ${40 * t.k}px`;
        }
      });

    svg.call(zoom).on('dblclick.zoom', null);

  }, []);

  // DATA EFFECT (Runs when data/filters/dimensions change)
  useEffect(() => {
    if (!svgRef.current || !centerIngredient) return;

    // Apply the saved transform immediately to the container to prevent visual reset
    // This handles the case where we navigate back/forth
    const svg = d3.select(svgRef.current);
    const container = svg.select<SVGGElement>('.galaxy-container');
    
    // Manually set the transform from our ref to ensure persistence
    container.attr('transform', transformRef.current.toString());
    // Also update the background immediately
    if (bgRef.current) {
        const t = transformRef.current;
        bgRef.current.style.backgroundPosition = `${t.x}px ${t.y}px`;
        bgRef.current.style.backgroundSize = `${40 * t.k}px ${40 * t.k}px`;
    }
    // IMPORTANT: Sync the D3 zoom internal state to match our ref
    // This prevents the "jump" when you first start zooming after navigation
    svg.call(d3.zoom<SVGSVGElement, unknown>().transform as any, transformRef.current);


    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const orbitRadius = Math.min(dimensions.width, dimensions.height) * 0.35;

    const categoryAngles: Record<string, number> = {
      sale: -Math.PI / 2,
      sucre: -Math.PI / 2 + (Math.PI * 2 / 5) * 1,
      vin: -Math.PI / 2 + (Math.PI * 2 / 5) * 2,
      mixologie: -Math.PI / 2 + (Math.PI * 2 / 5) * 3,
      biere_cidre: -Math.PI / 2 + (Math.PI * 2 / 5) * 4
    };

    // Prepare Data
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const addedNodeIds = new Set<string>();

    // Center Node
    addedNodeIds.add(centerIngredient.nom);
    nodes.push({
      id: centerIngredient.nom,
      group: 'center',
      category: 'main',
      data: centerIngredient,
      name: centerIngredient.nom,
      color: CATEGORY_COLORS.main,
      radius: 50,
      x: centerX,
      y: centerY,
      vx: 0,
      vy: 0,
      fx: centerX,
      fy: centerY
    });

    const addAssociationNodes = (list: string[], category: CategoryType) => {
      const angle = categoryAngles[category] || 0;
      list.forEach((itemName) => {
        if (addedNodeIds.has(itemName)) return;
        addedNodeIds.add(itemName);

        // NOTE: Here we should ideally search in the *passed* full dataset if we passed it as prop.
        // For now, since GalaxyGraph receives 'centerIngredient' which comes from the App's state,
        // we can try to look it up in INGREDIENTS_DATA (fallback) or assume the detailed data 
        // will be fetched when clicked.
        // If we want detailed data on satellites, GalaxyGraph needs the full 'ingredients' list as prop.
        // For this visual layer, checking INGREDIENTS_DATA is a safe static fallback, 
        // but to fully support dynamic data, we'd pass 'allIngredients' to GalaxyGraph.
        const fullData = INGREDIENTS_DATA.find(i => i.nom === itemName) || null;
        
        const dist = 100 + Math.random() * 100;
        const angleJitter = (Math.random() - 0.5) * 0.5; 
        const initX = centerX + Math.cos(angle + angleJitter) * dist;
        const initY = centerY + Math.sin(angle + angleJitter) * dist;

        nodes.push({
          id: itemName,
          group: 'satellite',
          category: category,
          data: fullData, // This might be null if not in static constant, but that's fine for visual
          name: itemName,
          color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.default,
          radius: 22, // Simplified radius logic
          x: initX,
          y: initY,
          vx: 0,
          vy: 0
        });

        links.push({
          source: centerIngredient.nom,
          target: itemName,
          value: 1,
          color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.default
        });
      });
    };

    if (filters.sale) addAssociationNodes(centerIngredient.associations.sale, 'sale');
    if (filters.sucre) addAssociationNodes(centerIngredient.associations.sucre, 'sucre');
    if (filters.vin) addAssociationNodes(centerIngredient.associations.vin, 'vin');
    if (filters.mixologie) addAssociationNodes(centerIngredient.associations.mixologie, 'mixologie');
    if (filters.biere_cidre) addAssociationNodes(centerIngredient.associations.biere_cidre, 'biere_cidre');

    // Clear OLD content
    container.selectAll('*').interrupt().remove();

    // Re-bind Click on Background
    svg.on('click', (event) => {
      if (event.target === svgRef.current) {
        onNodeHoverRef.current(null, '');
      }
    });

    // Simulation
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links).id(d => d.id).distance(180))
      .force('charge', d3.forceManyBody().strength(-1200))
      .force('collide', d3.forceCollide().radius(d => {
         const node = d as GraphNode;
         return node.radius + (node.name.length * 4) + 10;
      }).strength(0.6))
      .force('radialGrouping', alpha => {
        const k = alpha * 0.15;
        nodes.forEach(d => {
            if (d.group === 'satellite') {
                const angle = categoryAngles[d.category] || 0;
                const targetX = centerX + Math.cos(angle) * orbitRadius;
                const targetY = centerY + Math.sin(angle) * orbitRadius;
                
                if (d.vx !== undefined && d.vy !== undefined) {
                    d.vx += (targetX - (d.x || 0)) * k;
                    d.vy += (targetY - (d.y || 0)) * k;
                }
            }
        });
      })
      .velocityDecay(0.55)
      .alphaDecay(0.02);

    // Draw Links
    const link = container.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', d => d.color)
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 2);

    // Draw Nodes
    const nodeGroup = container.append('g').attr('class', 'nodes');
    const node = nodeGroup
      .selectAll('.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .style('cursor', d => (d.group === 'center' || d.data) ? 'pointer' : 'default');

    // Drag Behavior
    let startX = 0;
    let startY = 0;
    
    const dragBehavior = d3.drag<SVGGElement, GraphNode>()
      .on('start', (event, d) => {
        startX = event.x;
        startY = event.y;
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        if (d.group !== 'center') {
          d.fx = null;
          d.fy = null;
        }
        
        const dx = event.x - startX;
        const dy = event.y - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) {
            event.sourceEvent.stopPropagation();
            if (d.group === 'center') return; 
            onNodeClickRef.current(d.name);
        }
      });

    node.call(dragBehavior as any);

    // Circle
    node.append('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => d.color)
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 2);
    
    // Orbit Dashes
    node.filter(d => !!d.data && d.group !== 'center')
      .append('circle')
      .attr('r', d => d.radius + 5)
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-opacity', 0.5)
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '2,2');

    // Glow for Center
    node.filter(d => d.group === 'center')
      .select('circle')
      .style('filter', 'url(#glow)');

    // Text
    node.append('text')
      .text(d => d.name)
      .attr('x', d => d.radius + 8)
      .attr('y', 4)
      .attr('font-size', d => d.group === 'center' ? '24px' : '14px')
      .attr('font-weight', d => d.group === 'center' ? '700' : '600')
      .attr('fill', d => d.group === 'center' ? d.color : '#e2e8f0') 
      .style('pointer-events', 'none')
      .style('text-shadow', '0px 2px 4px rgba(0,0,0,0.9)');

    // Events
    node.on('mouseover', (event, d) => {
      const el = event.currentTarget;
      if (el) {
        d3.select(el).select('circle').attr('stroke', '#fff').attr('stroke-width', 3);
      }
      onNodeHoverRef.current(d.data || null, d.name);
    });

    node.on('mouseout', (event, d) => {
      const el = event.currentTarget;
      if (el) {
        d3.select(el).select('circle').attr('stroke', '#0f172a').attr('stroke-width', 2);
      }
    });

    // Tick
    simulation.on('tick', () => {
      if (nodes.some(d => isNaN(d.x!) || isNaN(d.y!))) return;
      link
        .attr('x1', d => (d.source as GraphNode).x!)
        .attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!)
        .attr('y2', d => (d.target as GraphNode).y!);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [centerIngredient, filters, dimensions]); // Handlers removed from deps!

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-slate-900">
      <div ref={bgRef} className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{
             backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)',
             backgroundSize: '40px 40px',
             backgroundPosition: '0px 0px',
             transition: 'none'
           }}>
      </div>
      
      <svg 
        ref={svgRef} 
        width={dimensions.width} 
        height={dimensions.height}
        className="block cursor-move active:cursor-grabbing"
      />
    </div>
  );
};

export default GalaxyGraph;
