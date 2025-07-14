import React, { useRef } from 'react';
import Sketch from 'react-p5';

let leafImage;

const FallingLeavesOverlay = ({ leaves, scrollPosition }) => {
  const imageAspectRatio = useRef(1);

  const preload = (p5) => {
    leafImage = p5.loadImage('/assets/images/grass.svg', img => {
      if (img.width > 0) {
        imageAspectRatio.current = img.width / img.height;
      }
    });
  };

  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    p5.angleMode(p5.DEGREES);
  };

  const windowResized = (p5) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  const updateWithProps = (p5, newProps) => {
    p5.props = { ...p5.props, ...newProps };
  };

  const draw = (p5) => {
    p5.clear();
    if (!leafImage || !p5.props || !p5.props.leaves) return;

    const p5props = p5.props;
    const currentScroll = p5props.scrollPosition || 0;
    const viewportHeight = p5.windowHeight;

    p5props.leaves.forEach((leaf) => {
      // The leaf starts falling from its original spot
      let y = leaf.initialY + currentScroll;
      
      // Stop the leaf at the top of the second page if it's meant to "land" there
      // This creates the effect of moving from page A to page B
      if (y > viewportHeight) {
         y = viewportHeight; // Or some other final position on the new page
      }

      // Add a gentle horizontal sway based on its y position
      const sway = Math.sin(y * 0.01) * 10;
      const x = leaf.initialX + sway;
      
      const w = leaf.wRatio * p5.windowWidth;
      const h = w / imageAspectRatio.current;

      p5.push();
      p5.translate(x, y);
      p5.rotate(Math.sin(y * 0.05) * 15); // Gentle rotation
      p5.imageMode(p5.CENTER);
      p5.tint(leaf.color);
      p5.image(leafImage, 0, 0, w, h);
      p5.pop();
    });
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 5, pointerEvents: 'none' }}>
      <Sketch
        preload={preload}
        setup={setup}
        draw={draw}
        windowResized={windowResized}
        updateWithProps={p5 => updateWithProps(p5, { leaves, scrollPosition })}
      />
    </div>
  );
};

export default FallingLeavesOverlay; 