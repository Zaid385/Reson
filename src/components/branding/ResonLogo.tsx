import React, { useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { engine } from '@audio-engine/AudioEngine'

interface ResonLogoProps {
  size?: number
  animated?: boolean
  interactive?: boolean
  audioReactive?: boolean
  className?: string
}

const PATHS = {
  dot: "M34 241.992C34 232.603 26.3888 224.992 17 224.992C7.61116 224.992 0 232.603 0 241.992V257.992C0 267.381 7.61116 274.992 17 274.992C26.3888 274.992 34 267.381 34 257.992V241.992Z",
  left: "M103 194.492C103 185.379 95.6127 177.992 86.5 177.992C77.3873 177.992 70 185.379 70 194.492V306.492C70 315.605 77.3873 322.992 86.5 322.992C95.6127 322.992 103 315.605 103 306.492V194.492Z",
  center: "M173 138.992C173 129.603 165.389 121.992 156 121.992C146.611 121.992 139 129.603 139 138.992V362.992C139 372.381 146.611 379.992 156 379.992C165.389 379.992 173 372.381 173 362.992V138.992Z",
  right: "M243 194.992C243 185.603 235.389 177.992 226 177.992C216.611 177.992 209 185.603 209 194.992V305.992C209 315.381 216.611 322.992 226 322.992C235.389 322.992 243 315.381 243 305.992V194.992Z",
  outerR: "M74.8761 1.73938C60.5761 7.93936 58.7761 26.6394 71.6761 35.6394C76.0761 38.6394 76.0761 38.6394 208.676 39.1394C341.176 39.6394 341.376 39.6394 349.076 41.8394C367.976 47.2394 382.076 55.2394 395.676 68.5394C409.476 81.8394 418.776 98.0394 424.076 117.439C426.076 124.539 426.376 128.139 426.376 144.139C426.376 160.239 426.076 163.639 424.076 170.639C412.976 210.439 385.176 237.239 344.876 247.139C342.376 247.839 330.076 248.639 317.376 249.039C290.776 249.839 288.076 250.539 282.876 258.739C278.976 264.939 278.376 269.739 280.376 276.839C281.976 282.639 282.276 282.939 374.176 374.939C424.876 425.739 467.476 467.839 468.876 468.639C483.076 476.039 499.176 464.439 495.776 449.239C495.276 446.839 494.276 444.039 493.576 443.139C492.876 442.139 458.176 406.839 416.376 364.639C374.576 322.439 340.276 287.639 340.076 287.239C339.976 286.939 344.376 285.839 349.876 284.839C375.976 280.439 400.876 267.639 421.176 248.139C442.276 227.939 455.076 205.339 461.976 176.139C464.676 164.939 465.676 135.039 463.876 121.839C461.076 101.439 452.976 80.0394 441.176 62.2394C433.276 50.3394 415.076 32.3394 402.376 23.8394C384.276 11.9394 366.676 4.93936 346.376 1.63937C332.676 -0.660614 80.0761 -0.460632 74.8761 1.73938Z"
}

// Reusable animation variants
const dotVariants = {
  startup: { 
    opacity: [0, 1], 
    transition: { duration: 0.15 } 
  },
  idle: { opacity: 1 },
  hit: { opacity: 1 }
}

const leftBarVariants = {
  startup: { scaleY: [0, 1], transition: { delay: 0.15, duration: 0.2, type: 'spring' } },
  idle: { scaleY: 1 },
  hit: { scaleY: [1, 1.25, 1], transition: { duration: 0.15 } }
}

const centerBarVariants = {
  startup: { scaleY: [0, 1], transition: { delay: 0.20, duration: 0.2, type: 'spring' } },
  idle: { scaleY: 1 },
  hit: { scaleY: [1, 1.45, 1], transition: { duration: 0.15 } }
}

const rightBarVariants = {
  startup: { scaleY: [0, 1], transition: { delay: 0.25, duration: 0.2, type: 'spring' } },
  idle: { scaleY: 1 },
  hit: { scaleY: [1, 1.25, 1], transition: { duration: 0.15 } }
}

const outerRVariants = {
  startup: { 
    pathLength: [0, 1], 
    fill: ["rgba(0, 240, 255, 0)", "var(--accent-cyan)"],
    stroke: ["var(--accent-cyan)", "rgba(0, 240, 255, 0)"],
    strokeWidth: [4, 0],
    transition: { 
      pathLength: { delay: 0.35, duration: 0.35, ease: "easeInOut" },
      fill: { delay: 0.65, duration: 0.15 },
      stroke: { delay: 0.65, duration: 0.15 },
      strokeWidth: { delay: 0.65, duration: 0.15 }
    }
  },
  idle: { 
    pathLength: 1, 
    fill: "var(--accent-cyan)",
    stroke: "rgba(0, 240, 255, 0)",
    strokeWidth: 0
  },
  hit: { 
    pathLength: 1, 
    fill: "var(--accent-cyan)",
    stroke: "rgba(0, 240, 255, 0)",
    strokeWidth: 0
  }
}

const glowVariants = {
  startup: {
    filter: [
      "drop-shadow(0px 0px 0px var(--accent-cyan))",
      "drop-shadow(0px 0px 0px var(--accent-cyan))", 
      "drop-shadow(0px 0px 15px var(--accent-cyan))", 
      "drop-shadow(0px 0px 6px var(--accent-cyan))"
    ],
    transition: {
      duration: 0.9,
      times: [0, 0.77, 0.88, 1] 
    }
  },
  idle: { filter: "drop-shadow(0px 0px 6px var(--accent-cyan))" },
  hit: { 
    filter: ["drop-shadow(0px 0px 6px var(--accent-cyan))", "drop-shadow(0px 0px 20px var(--accent-cyan))", "drop-shadow(0px 0px 6px var(--accent-cyan))"], 
    transition: { duration: 0.15 } 
  },
  hover: {
    filter: "drop-shadow(0px 0px 10px var(--accent-cyan))"
  }
}

const wrapperVariants = {
  idle: { scale: 1, rotate: 0 },
  hover: { 
    scale: 1.04, 
    rotate: 2, 
    transition: { duration: 0.18, type: 'spring' } 
  }
}

export const ResonLogo: React.FC<ResonLogoProps> = ({ 
  size = 100, 
  animated = false, 
  interactive = false,
  audioReactive = false,
  className = "" 
}) => {
  const controls = useAnimation()
  
  // Handle startup/idle state
  useEffect(() => {
    if (animated) {
      controls.start("startup")
    } else {
      controls.start("idle")
    }
  }, [animated, controls])

  // Sub for pad hits
  useEffect(() => {
    if (!audioReactive) return
    
    const unsubscribe = engine.on('voice:started', () => {
      // Overrides current state briefly with 'hit' then back to 'idle'
      controls.start("hit").then(() => {
        // Only return to idle if not unmounted/changed
        controls.start("idle")
      })
    })

    return unsubscribe
  }, [audioReactive, controls])

  return (
    <motion.div 
      className={`inline-flex items-center justify-center ${interactive ? 'cursor-pointer' : ''} ${className}`}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      variants={wrapperVariants as any}
      initial="idle"
      animate="idle"
      whileHover={interactive ? "hover" : "idle"}
    >
      <motion.svg 
        width={size} 
        height={size * (471 / 497)} 
        viewBox="0 0 497 471" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        animate={controls}
        variants={glowVariants}
      >
        <motion.path 
          d={PATHS.dot} 
          fill="var(--accent-cyan)"
          variants={dotVariants}
        />
        <motion.path 
          d={PATHS.left} 
          fill="var(--accent-cyan)"
          style={{ originY: 1 }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          variants={leftBarVariants as any}
        />
        <motion.path 
          d={PATHS.center} 
          fill="var(--accent-cyan)"
          style={{ originY: 1 }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          variants={centerBarVariants as any}
        />
        <motion.path 
          d={PATHS.right} 
          fill="var(--accent-cyan)"
          style={{ originY: 1 }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          variants={rightBarVariants as any}
        />
        <motion.path 
          d={PATHS.outerR} 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          variants={outerRVariants as any}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.svg>
    </motion.div>
  )
}
