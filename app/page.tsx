"use client"

import { useEffect } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ServicesSection } from "@/components/services-section"
import { ProjectsSection } from "@/components/projects-section"
import { SkillsSection } from "@/components/skills-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { Footer } from "@/components/footer"

export default function Home() {
  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const theme =
      localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    }
  }, [])

  return (
    <div className="w-full">
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <ProjectsSection />
        <SkillsSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  )
}
