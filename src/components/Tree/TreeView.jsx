import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import '../../styles/tree.css';

/**
 * Bi-directional TreeView: Shows Ancestors (Up) and Descendants (Down) from Focal Person.
 */
const TreeView = ({ data, focalPersonId, onNodeClick }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!data || !data.individuals || !focalPersonId) return;

        const svg = d3.select(svgRef.current);
        const width = svgRef.current.clientWidth;
        const height = svgRef.current.clientHeight;

        svg.selectAll('*').remove();
        const g = svg.append('g').attr('class', 'zoom-container');

        const zoom = d3.zoom()
            .scaleExtent([0.1, 3])
            .on('zoom', (event) => g.attr('transform', event.transform));

        svg.call(zoom);
        svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8));

        // Helper to find person by ID
        const getPerson = (id) => data.individuals.find(i => i.id === id);

        // 1. Build Descendants Hierarchy (Recursively)
        const buildDescendants = (personId, depth = 0, maxDepth = 3, visited = new Set()) => {
            if (visited.has(personId) || depth > maxDepth) return null;
            visited.add(personId);
            const person = getPerson(personId);
            if (!person) return null;

            const children = [];
            data.families.forEach(fam => {
                if (fam.husband === personId || fam.wife === personId) {
                    fam.children.forEach(childId => {
                        const childNode = buildDescendants(childId, depth + 1, maxDepth, visited);
                        if (childNode) children.push(childNode);
                    });
                }
            });

            return {
                id: person.id,
                name: person.names[0]?.value || 'Unknown',
                sex: person.sex,
                children: children.length > 0 ? children : null
            };
        };

        // 2. Build Ancestors Hierarchy (Recursively)
        const buildAncestors = (personId, depth = 0, maxDepth = 3, visited = new Set()) => {
            if (visited.has(personId) || depth > maxDepth) return null;
            visited.add(personId);
            const person = getPerson(personId);
            if (!person) return null;

            const parents = [];
            if (person.familyAsChild) {
                const fam = data.families.find(f => f.id === person.familyAsChild);
                if (fam) {
                    if (fam.husband) {
                        const fatherNode = buildAncestors(fam.husband, depth + 1, maxDepth, visited);
                        if (fatherNode) parents.push(fatherNode);
                    }
                    if (fam.wife) {
                        const motherNode = buildAncestors(fam.wife, depth + 1, maxDepth, visited);
                        if (motherNode) parents.push(motherNode);
                    }
                }
            }

            return {
                id: person.id,
                name: person.names[0]?.value || 'Unknown',
                sex: person.sex,
                children: parents.length > 0 ? parents : null
            };
        };

        // Layout configuration
        const nodeSepX = 180;
        const nodeSepY = 150;
        const treeLayout = d3.tree().nodeSize([nodeSepX, nodeSepY]);

        // Render Descendants (Grow Downwards)
        const descData = buildDescendants(focalPersonId);
        let descNodes = [];
        let descLinks = [];
        if (descData) {
            const descRoot = d3.hierarchy(descData);
            treeLayout(descRoot);
            descNodes = descRoot.descendants();
            descLinks = descRoot.links();
        }

        // Render Ancestors (Grow Upwards)
        const ancData = buildAncestors(focalPersonId);
        let ancNodes = [];
        let ancLinks = [];
        if (ancData) {
            const ancRoot = d3.hierarchy(ancData);
            treeLayout(ancRoot);
            ancNodes = ancRoot.descendants();
            // Flip Y coordinates for ancestors to grow up
            ancNodes.forEach(d => d.y = -d.y);
            ancLinks = ancRoot.links();
        }

        // Combine Data (Filter out duplicate Focal Person for nodes)
        const allNodes = [...descNodes, ...ancNodes.filter(d => d.data.id !== focalPersonId)];
        const allLinks = [...descLinks, ...ancLinks];

        // Draw combined links
        g.selectAll('.link')
            .data(allLinks)
            .enter()
            .append('path')
            .attr('class', 'link')
            .attr('d', d3.linkVertical().x(d => d.x).y(d => d.y))
            .attr('fill', 'none')
            .attr('stroke', 'rgba(255, 255, 255, 0.15)')
            .attr('stroke-width', 2);

        // Draw combined nodes
        const node = g.selectAll('.node')
            .data(allNodes)
            .enter()
            .append('g')
            .attr('class', d => `node ${d.data.sex === 'F' ? 'female' : 'male'} ${d.data.id === focalPersonId ? 'focal' : ''}`)
            .attr('transform', d => `translate(${d.x},${d.y})`)
            .on('click', (event, d) => onNodeClick(d.data.id));

        node.append('circle')
            .attr('r', d => d.data.id === focalPersonId ? 30 : 25)
            .attr('fill', 'var(--bg-card)')
            .attr('stroke', 'var(--accent)')
            .attr('stroke-width', 2);

        // Add cluster indicators (dots) - Support multiple groups
        const personToClusters = new Map();
        if (data.clusters) {
            data.clusters.forEach(c => {
                c.personIds.forEach(pid => {
                    if (!personToClusters.has(pid)) personToClusters.set(pid, []);
                    personToClusters.get(pid).push(c);
                });
            });
        }

        const dotG = node.filter(d => personToClusters.has(d.data.id))
            .append('g')
            .attr('class', 'cluster-dots');

        dotG.selectAll('circle')
            .data(d => personToClusters.get(d.data.id))
            .enter()
            .append('circle')
            .attr('r', 5)
            .attr('cx', (c, i) => 18 + (i * 12)) // Space dots horizontally
            .attr('cy', -18)
            .attr('fill', c => c.color)
            .attr('stroke', '#fff')
            .attr('stroke-width', 1.5);

        const formatName = (name) => {
            const parts = name.split('/');
            return parts[0].trim() + (parts[1] ? ' ' + parts[1].replace(/\//g, '') : '');
        };

        node.append('text')
            .attr('dy', d => d.y >= 0 ? 45 : -40) // Position labels based on direction
            .attr('text-anchor', 'middle')
            .text(d => formatName(d.data.name))
            .attr('fill', 'var(--text-main)')
            .style('font-size', '12px')
            .style('font-weight', '500')
            .style('pointer-events', 'none');

    }, [data, focalPersonId, onNodeClick]);

    return (
        <div className="tree-container" style={{ width: '100%', height: '100%' }}>
            <svg ref={svgRef} width="100%" height="100%"></svg>
        </div>
    );
};

export default TreeView;
