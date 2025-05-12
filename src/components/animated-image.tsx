"use client"

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

export function AnimatedImage() {
  const [isVisible, setIsVisible] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const currentImg = imgRef.current;
          if (currentImg) {
            currentImg.classList.add('animate-float');
          }
        }
      },
      { threshold: 0.5 }
    );

    const currentImg = imgRef.current;
    if (currentImg) {
      observer.observe(currentImg);
    }

    return () => {
      if (currentImg) {
        observer.unobserve(currentImg);
      }
    };
  }, []);

  return (
    <div ref={imgRef} className="relative h-full w-full">
      <Image
        src="/img/home/home_section1_right_cropped.png"
        alt="Woman running"
        width={3264}
        height={4896}
        className={`transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
        style={{
          objectFit: 'contain',
          objectPosition: 'center',
        }}
      />
    </div>
  )
}

