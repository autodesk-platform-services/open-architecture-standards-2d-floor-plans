document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-upload');
    const emptyState = document.getElementById('empty-state');
    const svgWrapper = document.getElementById('svg-wrapper');
    const svgElement = document.getElementById('plan-svg');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const fitViewBtn = document.getElementById('fit-view');

    let currentScale = 1;
    let viewBox = { x: 0, y: 0, width: 1000, height: 1000 };
    let originalViewBox = null; // Store original bounds for fit-to-content
    let isDragging = false;
    let startPan = { x: 0, y: 0 };

    fileInput.addEventListener('change', handleFileUpload);
    zoomInBtn.addEventListener('click', () => zoom(1.2));
    zoomOutBtn.addEventListener('click', () => zoom(0.8));
    fitViewBtn.addEventListener('click', fitToContent);

    // Pan functionality
    svgElement.addEventListener('mousedown', startDrag);
    svgElement.addEventListener('mousemove', drag);
    svgElement.addEventListener('mouseup', endDrag);
    svgElement.addEventListener('mouseleave', endDrag);
    svgElement.addEventListener('wheel', handleWheel);

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const plan = JSON.parse(e.target.result);
                renderPlan(plan);
            } catch (error) {
                console.error('Error parsing JSON:', error);
                alert('Invalid JSON file');
            }
        };
        reader.readAsText(file);
    }

    function renderPlan(plan) {
        // Clear existing SVG content
        svgElement.innerHTML = '';

        // Hide empty state, show SVG
        emptyState.classList.add('hidden');
        svgWrapper.classList.remove('hidden');

        // Render Rooms
        if (plan.rooms) {
            plan.rooms.forEach(room => {
                renderRoom(room);
            });
        }

        // Prepare openings map by wall for wall rendering (so walls can be cut where openings are)
        const openingsByWall = {};
        if (plan.openings) {
            plan.openings.forEach(opening => {
                if (!openingsByWall[opening.in_wall]) openingsByWall[opening.in_wall] = [];
                openingsByWall[opening.in_wall].push(opening);
            });
        }

        // Render Walls (cut segments where openings exist)
        if (plan.walls) {
            plan.walls.forEach(wall => {
                renderWall(wall, openingsByWall[wall.id] || []);
            });
        }

        // Render Openings
        if (plan.openings) {
            plan.openings.forEach(opening => {
                renderOpening(opening, plan.walls);
            });
        }

        // OAS Y-up → screen Y-down: invert Y at the render boundary so
        // high-data-Y (north per OAS spec) appears at the top of the screen.
        // Source data is untouched per oas-render rule.
        let maxY = -Infinity;
        if (plan.rooms) {
            plan.rooms.forEach(room => {
                if (room.boundary_polygon && room.boundary_polygon.points) {
                    room.boundary_polygon.points.forEach(p => { if (p.y > maxY) maxY = p.y; });
                }
            });
        }
        if (maxY > -Infinity) {
            const oasRoot = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            oasRoot.setAttribute('transform', `translate(0, ${maxY}) scale(1, -1)`);
            while (svgElement.firstChild) oasRoot.appendChild(svgElement.firstChild);
            svgElement.appendChild(oasRoot);

            // Counter-flip text labels so they remain upright
            oasRoot.querySelectorAll('text').forEach(t => {
                const tx = parseFloat(t.getAttribute('x')) || 0;
                const ty = parseFloat(t.getAttribute('y')) || 0;
                t.setAttribute('transform', `translate(${tx}, ${ty}) scale(1, -1) translate(${-tx}, ${-ty})`);
            });
        }

        // Calculate bounds and fit view
        calculateBounds(plan);
    }

    function renderRoom(room) {
        if (!room.boundary_polygon || !room.boundary_polygon.points) return;

        const points = room.boundary_polygon.points.map(p => `${p.x},${p.y}`).join(' ');

        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', points);
        polygon.setAttribute('class', 'room-polygon');
        polygon.setAttribute('id', room.id);

        // Add title for hover tooltip
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = `${room.name} (${room.area_m2} m²)`;
        polygon.appendChild(title);

        svgElement.appendChild(polygon);

        // Add Room Label (Centroid approximation)
        const centroid = getPolygonCentroid(room.boundary_polygon.points);
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', centroid.x);
        text.setAttribute('y', centroid.y);
        text.setAttribute('class', 'room-label');
        text.textContent = room.name;
        svgElement.appendChild(text);
    }

    function renderWall(wall, openings = []) {
        // If there are no openings, draw the full wall line
        if (!openings || openings.length === 0) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', wall.from.x);
            line.setAttribute('y1', wall.from.y);
            line.setAttribute('x2', wall.to.x);
            line.setAttribute('y2', wall.to.y);
            line.setAttribute('stroke-width', wall.thickness_mm);
            line.setAttribute('class', 'wall-line');
            svgElement.appendChild(line);
            return;
        }

        // Otherwise, split the wall into segments that exclude opening extents
        const dx = wall.to.x - wall.from.x;
        const dy = wall.to.y - wall.from.y;
        const wallLength = Math.sqrt(dx * dx + dy * dy);
        const unitX = dx / wallLength;
        const unitY = dy / wallLength;

        // Build an array of cut ranges [start, end] along the wall (in mm from wall.from)
        const cuts = openings.map(op => {
            const start = op.position_along_wall_mm;
            const end = op.position_along_wall_mm + op.width_mm;
            return { start: Math.max(0, start), end: Math.min(wallLength, end) };
        }).sort((a, b) => a.start - b.start);

        // Merge overlapping cuts
        const mergedCuts = [];
        cuts.forEach(c => {
            if (mergedCuts.length === 0) {
                mergedCuts.push(c);
            } else {
                const last = mergedCuts[mergedCuts.length - 1];
                if (c.start <= last.end) {
                    last.end = Math.max(last.end, c.end);
                } else {
                    mergedCuts.push(c);
                }
            }
        });

        // Walk along the wall and draw segments between cuts
        let cursor = 0;
        mergedCuts.forEach(cut => {
            if (cut.start > cursor) {
                // draw segment from cursor to cut.start
                const x1 = wall.from.x + unitX * cursor;
                const y1 = wall.from.y + unitY * cursor;
                const x2 = wall.from.x + unitX * cut.start;
                const y2 = wall.from.y + unitY * cut.start;
                const segment = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                segment.setAttribute('x1', x1);
                segment.setAttribute('y1', y1);
                segment.setAttribute('x2', x2);
                segment.setAttribute('y2', y2);
                segment.setAttribute('stroke-width', wall.thickness_mm);
                segment.setAttribute('class', 'wall-line');
                svgElement.appendChild(segment);
            }
            cursor = Math.max(cursor, cut.end);
        });

        // Draw last segment after last cut, if any
        if (cursor < wallLength) {
            const x1 = wall.from.x + unitX * cursor;
            const y1 = wall.from.y + unitY * cursor;
            const x2 = wall.to.x;
            const y2 = wall.to.y;
            const segment = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            segment.setAttribute('x1', x1);
            segment.setAttribute('y1', y1);
            segment.setAttribute('x2', x2);
            segment.setAttribute('y2', y2);
            segment.setAttribute('stroke-width', wall.thickness_mm);
            segment.setAttribute('class', 'wall-line');
            svgElement.appendChild(segment);
        }
    }

    function renderOpening(opening, walls) {
        const wall = walls.find(w => w.id === opening.in_wall);
        if (!wall) return;

        // Calculate position based on wall vector
        const dx = wall.to.x - wall.from.x;
        const dy = wall.to.y - wall.from.y;
        const wallLength = Math.sqrt(dx * dx + dy * dy);

        const unitX = dx / wallLength;
        const unitY = dy / wallLength;

        // Perpendicular vector (for door swing direction)
        const perpX = -unitY;
        const perpY = unitX;

        // Actual opening start/end (used for masking the wall)
        const startDistRaw = opening.position_along_wall_mm || 0;
        const startX = wall.from.x + unitX * startDistRaw;
        const startY = wall.from.y + unitY * startDistRaw;
        const endX = startX + unitX * (opening.width_mm || 0);
        const endY = startY + unitY * (opening.width_mm || 0);

        // Compute visualized (smaller) opening centered inside the real opening
        const effectiveWidth = opening.width_mm || 0;
        // Use full opening width for visualization (no reduction)
        const visualWidth = effectiveWidth;
        let visualStartDist, visualEndDist;
        if (opening.hinge_side === 'right') {
            // anchor visual to the hinge at the end
            visualEndDist = startDistRaw + effectiveWidth;
            visualStartDist = visualEndDist - visualWidth;
        } else {
            // default: hinge at start side, anchor visual at real start
            visualStartDist = startDistRaw;
            visualEndDist = visualStartDist + visualWidth;
        }
        const visualStartX = wall.from.x + unitX * visualStartDist;
        const visualStartY = wall.from.y + unitY * visualStartDist;
        const visualEndX = wall.from.x + unitX * visualEndDist;
        const visualEndY = wall.from.y + unitY * visualEndDist;

        // Create a group for this opening
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', 'opening-group');
        group.setAttribute('id', opening.id);

        // Add title for tooltip
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        const operationText = opening.operation ? ` (${opening.operation})` : '';
        title.textContent = `${opening.opening_type}${operationText} - ${opening.width_mm}mm`;
        group.appendChild(title);

        if (opening.opening_type === 'door') {
            renderDoor(group, opening, startX, startY, endX, endY, visualStartX, visualStartY, visualEndX, visualEndY, unitX, unitY, perpX, perpY, wall);
        } else if (opening.opening_type === 'window') {
            renderWindow(group, opening, startX, startY, endX, endY, visualStartX, visualStartY, visualEndX, visualEndY, unitX, unitY, perpX, perpY, wall);
        } else {
            // Default rendering for unknown types
            renderDefaultOpening(group, opening, startX, startY, endX, endY, wall);
        }

        svgElement.appendChild(group);
    }

    function renderDoor(group, opening, startX, startY, endX, endY, vStartX, vStartY, vEndX, vEndY, unitX, unitY, perpX, perpY, wall) {
        const width = opening.width_mm;

        // Draw the opening gap (mask) using the actual start/end
        const gap = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        gap.setAttribute('x1', startX);
        gap.setAttribute('y1', startY);
        gap.setAttribute('x2', endX);
        gap.setAttribute('y2', endY);
        gap.setAttribute('stroke-width', wall.thickness_mm + 2);
        gap.setAttribute('class', 'door-gap');
        group.appendChild(gap);

        // Determine swing direction multiplier
        const swingDir = opening.swing_direction === 'outward' ? -1 : 1;

        // Determine hinge position (use visual coordinates for hinge/leaf placement)
        let hingeX, hingeY, leafEndX, leafEndY;
        if (opening.hinge_side === 'right') {
            hingeX = vEndX;
            hingeY = vEndY;
            leafEndX = vStartX;
            leafEndY = vStartY;
        } else {
            // Default to left
            hingeX = vStartX;
            hingeY = vStartY;
            leafEndX = vEndX;
            leafEndY = vEndY;
        }

        // Draw door leaf (closed position) using visual extents
        const leaf = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        leaf.setAttribute('x1', hingeX);
        leaf.setAttribute('y1', hingeY);
        leaf.setAttribute('x2', leafEndX);
        leaf.setAttribute('y2', leafEndY);
        leaf.setAttribute('stroke-width', '30');
        leaf.setAttribute('stroke', '#2563eb');
        leaf.setAttribute('class', 'door-leaf');
        group.appendChild(leaf);

        // Draw swing arc (if operation is swing) using visual hinge and visual width
        if (opening.operation === 'swing') {
            const visualWidth = Math.hypot(vEndX - vStartX, vEndY - vStartY);
            const arcEndX = hingeX + perpX * visualWidth * swingDir;
            const arcEndY = hingeY + perpY * visualWidth * swingDir;

            // Calculate sweep flag based on hinge side and swing direction
            let sweepFlag;
            if (opening.hinge_side === 'right') {
                sweepFlag = swingDir > 0 ? 0 : 1;
            } else {
                sweepFlag = swingDir > 0 ? 1 : 0;
            }

            const arc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const pathData = `M ${leafEndX} ${leafEndY} A ${visualWidth} ${visualWidth} 0 0 ${sweepFlag} ${arcEndX} ${arcEndY}`;
            arc.setAttribute('d', pathData);
            arc.setAttribute('fill', 'none');
            arc.setAttribute('stroke', '#3b82f6');
            arc.setAttribute('stroke-width', '15');
            arc.setAttribute('stroke-dasharray', '50,30');
            arc.setAttribute('class', 'door-swing-arc');
            arc.setAttribute('opacity', '0.6');
            group.appendChild(arc);

            // Draw dashed connector from arc end to the hinge (end of the visual solid line)
            const connector = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            connector.setAttribute('x1', arcEndX);
            connector.setAttribute('y1', arcEndY);
            connector.setAttribute('x2', hingeX);
            connector.setAttribute('y2', hingeY);
            connector.setAttribute('class', 'door-connector');
            group.appendChild(connector);
        }

        // Hinge circle removed — arc and leaf indicate hinge/direction
    }

    function renderWindow(group, opening, startX, startY, endX, endY, vStartX, vStartY, vEndX, vEndY, unitX, unitY, perpX, perpY, wall) {
        // Draw window opening (mask) using real start/end
        const gap = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        gap.setAttribute('x1', startX);
        gap.setAttribute('y1', startY);
        gap.setAttribute('x2', endX);
        gap.setAttribute('y2', endY);
        gap.setAttribute('stroke-width', wall.thickness_mm + 2);
        gap.setAttribute('class', 'window-gap');
        group.appendChild(gap);

        // Draw window frame (two parallel lines) using visual start/end to avoid overflow
        const frameOffset = wall.thickness_mm * 0.3;

        const frame1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        frame1.setAttribute('x1', vStartX + perpX * frameOffset);
        frame1.setAttribute('y1', vStartY + perpY * frameOffset);
        frame1.setAttribute('x2', vEndX + perpX * frameOffset);
        frame1.setAttribute('y2', vEndY + perpY * frameOffset);
        frame1.setAttribute('stroke-width', '20');
        frame1.setAttribute('stroke', '#0284c7');
        frame1.setAttribute('class', 'window-frame');
        group.appendChild(frame1);

        const frame2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        frame2.setAttribute('x1', vStartX - perpX * frameOffset);
        frame2.setAttribute('y1', vStartY - perpY * frameOffset);
        frame2.setAttribute('x2', vEndX - perpX * frameOffset);
        frame2.setAttribute('y2', vEndY - perpY * frameOffset);
        frame2.setAttribute('stroke-width', '20');
        frame2.setAttribute('stroke', '#0284c7');
        frame2.setAttribute('class', 'window-frame');
        group.appendChild(frame2);

        // Draw window divider (mullion) in the middle of visual extents
        const midX = (vStartX + vEndX) / 2;
        const midY = (vStartY + vEndY) / 2;

        const mullion = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        mullion.setAttribute('x1', midX + perpX * frameOffset);
        mullion.setAttribute('y1', midY + perpY * frameOffset);
        mullion.setAttribute('x2', midX - perpX * frameOffset);
        mullion.setAttribute('y2', midY - perpY * frameOffset);
        mullion.setAttribute('stroke-width', '15');
        mullion.setAttribute('stroke', '#0284c7');
        mullion.setAttribute('class', 'window-mullion');
        group.appendChild(mullion);
    }

    function renderDefaultOpening(group, opening, startX, startY, endX, endY, wall) {
        // Fallback for unknown opening types
        const openingLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        openingLine.setAttribute('x1', startX);
        openingLine.setAttribute('y1', startY);
        openingLine.setAttribute('x2', endX);
        openingLine.setAttribute('y2', endY);
        openingLine.setAttribute('stroke-width', Math.max(6, (wall.thickness_mm || 6)));
        openingLine.setAttribute('stroke', '#ef4444');
        openingLine.setAttribute('class', 'opening-marker');
        group.appendChild(openingLine);
    }

    function getPolygonCentroid(points) {
        let x = 0, y = 0;
        points.forEach(p => {
            x += p.x;
            y += p.y;
        });
        return { x: x / points.length, y: y / points.length };
    }

    function calculateBounds(plan) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        if (plan.rooms) {
            plan.rooms.forEach(room => {
                room.boundary_polygon.points.forEach(p => {
                    minX = Math.min(minX, p.x);
                    minY = Math.min(minY, p.y);
                    maxX = Math.max(maxX, p.x);
                    maxY = Math.max(maxY, p.y);
                });
            });
        }

        const padding = 1000; // mm
        viewBox = {
            x: minX - padding,
            y: minY - padding,
            width: (maxX - minX) + (padding * 2),
            height: (maxY - minY) + (padding * 2)
        };

        // Store original bounds for fit-to-content
        originalViewBox = { ...viewBox };

        updateViewBox();
    }

    function updateViewBox() {
        svgElement.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
    }

    function zoom(factor) {
        const cx = viewBox.x + viewBox.width / 2;
        const cy = viewBox.y + viewBox.height / 2;

        viewBox.width /= factor;
        viewBox.height /= factor;

        viewBox.x = cx - viewBox.width / 2;
        viewBox.y = cy - viewBox.height / 2;

        updateViewBox();
    }

    function fitToContent() {
        if (originalViewBox) {
            viewBox = { ...originalViewBox };
            updateViewBox();
        }
    }

    function startDrag(e) {
        isDragging = true;
        startPan = { x: e.clientX, y: e.clientY };
        svgElement.style.cursor = 'grabbing';
    }

    function drag(e) {
        if (!isDragging) return;

        const dx = e.clientX - startPan.x;
        const dy = e.clientY - startPan.y;

        // Convert screen pixels to SVG units
        // We need the ratio of viewBox width to screen width
        const rect = svgElement.getBoundingClientRect();
        const scaleX = viewBox.width / rect.width;
        const scaleY = viewBox.height / rect.height;

        viewBox.x -= dx * scaleX;
        viewBox.y -= dy * scaleY;

        startPan = { x: e.clientX, y: e.clientY };
        updateViewBox();
    }

    function endDrag() {
        isDragging = false;
        svgElement.style.cursor = 'grab';
    }

    function handleWheel(e) {
        e.preventDefault();
        const factor = e.deltaY > 0 ? 0.9 : 1.1;
        zoom(factor);
    }
});
