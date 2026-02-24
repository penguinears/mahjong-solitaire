// images.js
/*
  images.js
  Reworked to provide colored tile art instead of Japanese logos.
  Exports a function getTileGraphic(id, size) that returns an HTMLCanvasElement
  with a polished colored tile rendering (rounded, bevel, subtle glow).
*/

const TileImages = (function(){
  // Color palette for tiles (expandable)
  const PALETTES = [
    ['#FF6B6B','#FF9F43','#FFD93D','#6BCB77','#4D96FF','#9B59B6','#FF7AB6','#7AFCFF','#FFD36E','#B8FFB0'],
    ['#FF9AB3','#FF7AB6','#FFD36E','#7AFCFF','#7AD1FF','#B8FFB0','#FF9AB3','#7AD1FF','#FFD36E','#FF7AB6']
  ];

  // Map tile ids (1..34 or more) to colors deterministically
  function colorForId(id){
    // id may be number or string; normalize to number
    const n = (typeof id === 'number') ? id : parseInt(String(id).replace(/\D/g,''),10) || 0;
    const palette = PALETTES[n % PALETTES.length];
    return palette[n % palette.length];
  }

  // Create a polished tile canvas for a given id and size (px)
  function createTileCanvas(id, size){
    const canvas = document.createElement('canvas');
    const DPR = window.devicePixelRatio || 1;
    canvas.width = Math.floor(size * DPR);
    canvas.height = Math.floor(size * DPR);
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(DPR, DPR);

    const color = colorForId(id);
    const w = size, h = size;
    const radius = Math.max(6, Math.floor(size * 0.08));

    // Background rounded rect with subtle gradient
    const g = ctx.createLinearGradient(0,0,w,h);
    g.addColorStop(0, shadeColor(color, 8));
    g.addColorStop(1, shadeColor(color, -6));
    roundRect(ctx, 0, 0, w, h, radius);
    ctx.fillStyle = g;
    ctx.fill();

    // Inner inset to create bevel
    ctx.save();
    roundRect(ctx, 2, 2, w-4, h-4, Math.max(4, radius-2));
    ctx.clip();
    const gloss = ctx.createLinearGradient(0,0,0,h*0.6);
    gloss.addColorStop(0, 'rgba(255,255,255,0.18)');
    gloss.addColorStop(0.6, 'rgba(255,255,255,0.04)');
    gloss.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gloss;
    ctx.fillRect(2,2,w-4,h*0.6);
    ctx.restore();

    // Subtle inner shadow
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    roundRect(ctx, 2, h*0.6, w-4, h*0.4-2, Math.max(4, radius-2));
    ctx.fill();
    ctx.restore();

    // Decorative center emblem: simple geometric mark to differentiate tiles
    // Use a lighter tint of the base color
    const emblemColor = shadeColor(color, 30);
    ctx.fillStyle = emblemColor;
    ctx.globalAlpha = 0.95;
    const cx = w/2, cy = h/2;
    const es = Math.floor(size * 0.22);
    // Draw a rounded square or circle depending on id parity
    if((parseInt(id,10) || 0) % 2 === 0){
      roundRect(ctx, cx - es, cy - es, es*2, es*2, Math.max(4, Math.floor(es*0.25)));
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(cx, cy, es, 0, Math.PI*2);
      ctx.fill();
    }

    // Add soft outer glow (additive)
    const glow = ctx.createRadialGradient(cx, cy, es*0.2, cx, cy, es*2.2);
    glow.addColorStop(0, hexToRgba(color, 0.28));
    glow.addColorStop(0.6, hexToRgba(color, 0.08));
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, es*2.2, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();

    // Thin border
    ctx.lineWidth = Math.max(1, size*0.02);
    ctx.strokeStyle = hexToRgba(shadeColor(color, -18), 0.9);
    roundRect(ctx, 1, 1, w-2, h-2, radius);
    ctx.stroke();

    return canvas;
  }

  // Helpers (copied/compatible with project)
  function roundRect(ctx,x,y,w,h,r){
    const radius = r || 6;
    ctx.beginPath();
    ctx.moveTo(x+radius,y);
    ctx.arcTo(x+w,y,x+w,y+h,radius);
    ctx.arcTo(x+w,y+h,x,y+h,radius);
    ctx.arcTo(x,y+h,x,y,radius);
    ctx.arcTo(x,y,x+w,y,radius);
    ctx.closePath();
  }
  function shadeColor(hex, percent) {
    const f = hex.slice(1);
    const t = percent<0?0:255;
    const p = Math.abs(percent)/100;
    const R = parseInt(f.substring(0,2),16);
    const G = parseInt(f.substring(2,4),16);
    const B = parseInt(f.substring(4,6),16);
    const newR = Math.round((t - R) * p) + R;
    const newG = Math.round((t - G) * p) + G;
    const newB = Math.round((t - B) * p) + B;
    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
  }
  function toHex(n){ const s = n.toString(16); return s.length===1 ? '0'+s : s; }
  function hexToRgba(hex, a){
    const h = hex.replace('#','');
    const r = parseInt(h.substring(0,2),16);
    const g = parseInt(h.substring(2,4),16);
    const b = parseInt(h.substring(4,6),16);
    return `rgba(${r},${g},${b},${a})`;
  }

  return {
    createTileCanvas,
    colorForId
  };
})();

if(typeof module !== 'undefined' && module.exports) module.exports = TileImages;
