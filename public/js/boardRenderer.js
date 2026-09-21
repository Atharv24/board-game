import { SNAKES, LADDERS } from './constants.js';

export class BoardRenderer {
  constructor(boardEl, overlayEl, containerEl) {
    this.boardEl = boardEl;
    this.overlayEl = overlayEl;
    this.containerEl = containerEl;
  }

  build() {
    this.boardEl.innerHTML = '';
    this.overlayEl.innerHTML = '';

    // Alternating grid row order (rows 9 down to 0)
    for (let row = 9; row >= 0; row--) {
      const isEvenRow = row % 2 === 0;
      for (let col = 0; col < 10; col++) {
        const squareNum = isEvenRow ? (row * 10 + (10 - col)) : (row * 10 + col + 1);
        const square = document.createElement('div');
        square.className = `square ${(squareNum % 2 === 0) ? 'even' : ''}`;
        square.id = `sq-${squareNum}`;

        let badge = '';
        if (SNAKES[squareNum]) {
          square.classList.add('has-snake');
          badge = `<span class="badge">🐍->${SNAKES[squareNum]}</span>`;
        } else if (LADDERS[squareNum]) {
          square.classList.add('has-ladder');
          badge = `<span class="badge">🪜->${LADDERS[squareNum]}</span>`;
        }

        square.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span>${squareNum}</span>${badge}
          </div>
          <div class="tokens"></div>
        `;
        this.boardEl.appendChild(square);
      }
    }

    requestAnimationFrame(() => this.drawConnections());
  }

  drawConnections() {
    const cRect = this.containerEl.getBoundingClientRect();
    if (cRect.width === 0 || cRect.height === 0) return;

    this.overlayEl.setAttribute('viewBox', `0 0 ${cRect.width} ${cRect.height}`);
    this.overlayEl.innerHTML = `
      <defs>
        <marker id="snake-head" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <circle cx="5" cy="5" r="4" fill="#e74c3c" />
        </marker>
        <marker id="ladder-top" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <polygon points="0,0 10,5 0,10" fill="#2ecc71" />
        </marker>
      </defs>
    `;

    const getCenter = (sqNum) => {
      const el = document.getElementById(`sq-${sqNum}`);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        x: r.left - cRect.left + r.width / 2,
        y: r.top - cRect.top + r.height / 2
      };
    };

    // Draw Ladders
    for (const [start, end] of Object.entries(LADDERS)) {
      const p1 = getCenter(start);
      const p2 = getCenter(end);
      if (!p1 || !p2) continue;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', p1.x);
      line.setAttribute('y1', p1.y);
      line.setAttribute('x2', p2.x);
      line.setAttribute('y2', p2.y);
      line.setAttribute('stroke', '#2ecc71');
      line.setAttribute('stroke-width', '4');
      line.setAttribute('stroke-linecap', 'round');
      line.setAttribute('stroke-dasharray', '6 3');
      line.setAttribute('opacity', '0.85');
      line.setAttribute('marker-end', 'url(#ladder-top)');
      this.overlayEl.appendChild(line);
    }

    // Draw Snakes
    for (const [start, end] of Object.entries(SNAKES)) {
      const p1 = getCenter(start);
      const p2 = getCenter(end);
      if (!p1 || !p2) continue;

      const midX = (p1.x + p2.x) / 2 + (p2.y - p1.y) * 0.15;
      const midY = (p1.y + p2.y) / 2 - (p2.x - p1.x) * 0.15;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${p1.x} ${p1.y} Q ${midX} ${midY} ${p2.x} ${p2.y}`);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#e74c3c');
      path.setAttribute('stroke-width', '4');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('opacity', '0.85');
      path.setAttribute('marker-start', 'url(#snake-head)');
      this.overlayEl.appendChild(path);
    }
  }

  renderTokens(players) {
    document.querySelectorAll('.tokens').forEach(el => el.innerHTML = '');
    players.forEach(p => {
      const square = document.getElementById(`sq-${p.position}`);
      if (square) {
        const token = document.createElement('div');
        token.className = 'token';
        token.style.backgroundColor = p.color;
        token.title = `${p.name} (Tile ${p.position})`;
        square.querySelector('.tokens').appendChild(token);
      }
    });
  }
}
