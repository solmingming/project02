import React, { useRef, useEffect } from 'react';
import p5 from 'p5';

let leafImage;

export default function NextPageWithLeaves({ leaves }) {
  const canvasRef = useRef(null);
  const p5Instance = useRef(null);

  useEffect(() => {
    // Prevent multiple p5 instances
    if (p5Instance.current) {
      p5Instance.current.remove();
    }

    const sketch = (p) => {
      let imageAspectRatio = 1;

      p.preload = () => {
        leafImage = p.loadImage('/assets/images/grass.svg', img => {
          if (img.width > 0) {
            imageAspectRatio = img.width / img.height;
          }
        });
      };

      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight).parent(canvasRef.current);
        p.noLoop(); // Draw only once
      };

      p.draw = () => {
        // Background gradient from the original component
        for (let y = 0; y < p.height; y++) {
          const t = Math.min(Math.max(y / p.height, 0), 1);
          p.stroke(p.lerpColor(p.color('#BBFFD9'), p.color('#D8F0FF'), t));
          p.line(0, y, p.width, y);
        }

        // Draw the leaves at their final positions
        if (leaves && leafImage) {
          leaves.forEach(leaf => {
            const w = leaf.wRatio * p.width;
            const h = w / imageAspectRatio;
            const x = leaf.xRatio * p.width;
            const y = leaf.yRatio * p.height;

            p.push();
            p.imageMode(p.CENTER);
            p.tint(leaf.color);
            p.image(leafImage, x, y, w, h);
            p.pop();
          });
        }
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        p.draw(); // Redraw on resize
      };
    };

    p5Instance.current = new p5(sketch);
    
    return () => {
      if (p5Instance.current) {
        p5Instance.current.remove();
      }
    };
  }, [leaves]);

  return <div ref={canvasRef} style={{ height: '100vh', width: '100vw' }} />;
} 