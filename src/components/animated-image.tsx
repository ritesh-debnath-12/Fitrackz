"use client"

import { useEffect, useRef } from 'react'
import Image from 'next/image'

export function AnimatedImage() {
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
        className="transition-all duration-1000"
        style={{
          objectFit: 'contain',
          objectPosition: 'center',
        }}
      />
    </div>
  )
}

