// WaterReflection.jsx
import React from "react";
import "./WaterReflection.css";
import buildingImg from "./flower2.svg"; // 프로젝트에 건물 이미지를 넣어두세요

export default function WaterReflection() {
  return (
    <div className="water-scene">
      {/* SVG 필터 정의 */}
      <svg className="svg-filters" xmlns="http://www.w3.org/2000/svg">
        <filter id="ripples">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02"
            numOctaves="3"
            result="noise"
          >
            {/* baseFrequency를 애니메이션으로 바꿔가며 파동 효과를 줍니다 */}
            <animate
              attributeName="baseFrequency"
              dur="5s"
              values="0.02;0.05;0.02"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" />
        </filter>
      </svg>

      {/* 원본 건물 */}
      <img src={buildingImg} alt="Building" className="building" />

      {/* 뒤집어서 비친 모습 */}
      <img
        src={buildingImg}
        alt="Reflection"
        className="reflection"
        style={{ filter: "url(#ripples)" }}
      />
    </div>
  );
}
