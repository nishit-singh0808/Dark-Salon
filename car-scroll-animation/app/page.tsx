"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default function Home() {

  const sectionRef = useRef<HTMLDivElement | null>(null)
  const carRef = useRef<HTMLImageElement | null>(null)
  const greenRef = useRef<HTMLDivElement | null>(null)
  const textContainerRef = useRef<HTMLDivElement | null>(null)
  const statsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sectionRef.current,
      start: "top top",
      end: "+=2000",
      scrub: true,
      pin: true
    }
  })

  // car movement (total timeline = 4)
  tl.to(carRef.current, {
    x: 1550,
    duration: 4
  }, 0)

  // green strip
  tl.to(greenRef.current, {
    width: "100%",
    duration: 3.9
  }, 0)

  // text reveal
  tl.to(textContainerRef.current, {
    width: "100%",
    duration: 3.9
  }, 0)

  // stats appear every 25%
  // card 1 (0% → 25%)
    tl.to(statsRef.current[0], {
      opacity: 1,
      y: 0,
      duration: 1
    }, 0)

    // card 2 (25% → 50%)
    tl.to(statsRef.current[1], {
      opacity: 1,
      y: 0,
      duration: 1
    }, 1)

    // card 3 (50% → 75%)
    tl.to(statsRef.current[2], {
      opacity: 1,
      y: 0,
      duration: 1
    }, 2)

    // card 4 (75% → 100%)
    tl.to(statsRef.current[3], {
      opacity: 1,
      y: 0,
      duration: 1
    }, 3)

  }, [])

  return (

    <main className="bg-gray-100">

      <section
        ref={sectionRef}
        className="h-screen flex items-center justify-center relative overflow-hidden"
      >

        {/* Black Road */}
        <div className="absolute w-full h-40 bg-black top-1/2 -translate-y-1/2"></div>

        {/* Green Strip */}
        <div
          ref={greenRef}
          className="absolute h-40 bg-green-400 top-1/2 -translate-y-1/2 left-0"
          style={{ width: "0%" }}
        ></div>

       {/* Text Reveal Container */}
        <div
          ref={textContainerRef}
          className="absolute top-1/2 -translate-y-1/2 left-0 right-0 overflow-hidden"
          style={{ width: "0%" }}
        >
          <h1 className="text-9xl font-bold tracking-[20px] text-center whitespace-nowrap">
            WELCOME ITZFIZZ
          </h1>
        </div>

        {/* Car */}
        <img
          ref={carRef}
          src="/car.png"
          alt="car"
          className="absolute w-132 left-0 top-1/2 -translate-y-1/2"
        />

  <div className="grid grid-cols-2 gap-10 absolute bottom-20">

  <div
    ref={(el) => { if (el) statsRef.current[0] = el }}
    className="bg-lime-400 p-10 rounded-xl text-center opacity-0"
  >
    <h2 className="text-4xl font-bold">58%</h2>
    <p>Increase in pick up point use</p>
  </div>

  <div
    ref={(el) => { if (el) statsRef.current[1] = el }}
    className="bg-gray-800 text-white p-10 rounded-xl text-center opacity-0"
  >
    <h2 className="text-4xl font-bold">27%</h2>
    <p>Increase in pick up point use</p>
  </div>

  <div
    ref={(el) => { if (el) statsRef.current[2] = el }}
    className="bg-blue-400 p-10 rounded-xl text-center opacity-0"
  >
    <h2 className="text-4xl font-bold">23%</h2>
    <p>Decreased in customer phone calls</p>
  </div>

  <div
    ref={(el) => { if (el) statsRef.current[3] = el }}
    className="bg-orange-500 p-10 rounded-xl text-center opacity-0"
  >
    <h2 className="text-4xl font-bold">40%</h2>
    <p>Decreased in customer phone calls</p>
  </div>

</div>

      </section>

    </main>
  )
}