"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Users, PiggyBank, Vote, TrendingUp, Shield, Zap, ArrowRight, Star, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [currentStat, setCurrentStat] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const features = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "Savings Groups",
      description: "Create or join community-driven savings groups with transparent governance",
      delay: "delay-100",
    },
    {
      icon: <PiggyBank className="h-8 w-8" />,
      title: "Smart Contributions",
      description: "Make regular contributions and track your savings progress automatically",
      delay: "delay-200",
    },
    {
      icon: <Vote className="h-8 w-8" />,
      title: "Democratic Governance",
      description: "Participate in group decisions through weighted voting and proposal systems",
      delay: "delay-300",
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Reputation System",
      description: "Build your financial reputation through consistent contributions and repayments",
      delay: "delay-400",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "KYC Verification",
      description: "Secure identity verification with reputation scoring and compliance tracking",
      delay: "delay-500",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Instant Settlements",
      description: "Fast loan disbursements and automatic repayment processing",
      delay: "delay-600",
    },
  ]

  const stats = [
    { label: "Active Groups", value: "1,234", icon: <Users className="h-6 w-6" /> },
    { label: "Total Members", value: "12,456", icon: <PiggyBank className="h-6 w-6" /> },
    { label: "Loans Disbursed", value: "$2.3M", icon: <TrendingUp className="h-6 w-6" /> },
    { label: "Success Rate", value: "98.5%", icon: <CheckCircle className="h-6 w-6" /> },
  ]

  const testimonials = [
    {
      name: "Amara Ngao",
      role: "Small Business Owner",
      content:
        "Jamii Fund helped me grow my business with a fair loan from my community. The democratic process made me feel heard and valued.",
      avatar: "AO",
    },
    {
      name: "Kwame Asante",
      role: "Tech Professional",
      content:
        "The transparency and governance features are amazing. I can see exactly how my contributions are being used and vote on important decisions.",
      avatar: "KA",
    },
    {
      name: "Fatima Al-Rashid",
      role: "Community Leader",
      content:
        "This platform brings the traditional concept of community savings into the digital age. It's exactly what our community needed.",
      avatar: "FR",
    },
  ]

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [stats.length])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Hero Section */}
      <section className="py-20 px-4 overflow-hidden">
        <div className="container mx-auto text-center">
          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <Badge variant="secondary" className="mb-6 bg-orange-100 text-orange-800 animate-pulse">
              🌍 Decentralized Chama (Savings & Credit Platform)
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Build Wealth
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 animate-gradient">
                {" "}
                Together
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join community-driven savings groups, contribute regularly, and access fair loans through democratic
              voting. Powered by Sui blockchain for complete transparency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                asChild
              >
                <Link href="/groups/create">
                  Create a Group
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-orange-600 text-orange-600 hover:bg-orange-50 transform hover:scale-105 transition-all duration-200"
                asChild
              >
                <Link href="/groups">Join a Group</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Stats Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`text-center transform transition-all duration-500 hover:scale-110 ${
                  currentStat === index ? "scale-110 opacity-100" : "scale-100 opacity-75"
                }`}
              >
                <div className="flex justify-center mb-3">
                  <div
                    className={`p-3 rounded-full ${
                      currentStat === index
                        ? "bg-gradient-to-r from-orange-600 to-red-600 text-white"
                        : "bg-gray-100 text-gray-600"
                    } transition-all duration-500`}
                  >
                    {stat.icon}
                  </div>
                </div>
                <div
                  className={`text-3xl md:text-4xl font-bold mb-2 transition-all duration-500 ${
                    currentStat === index ? "text-orange-600" : "text-gray-700"
                  }`}
                >
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section with Staggered Animation */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">How Jamii Fund Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              Experience the power of community-driven finance with our comprehensive platform
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up ${feature.delay} group`}
              >
                <CardHeader>
                  <div className="text-orange-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl group-hover:text-orange-600 transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-orange-100 to-red-100">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Community Says</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real stories from real people building wealth together
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className={`border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 animate-fade-in-up delay-${(index + 1) * 200}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">&quot;{testimonial.content}&quot;</p>
                  <div className="flex mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Floating Animation */}
      <section className="py-20 px-4 bg-gradient-to-r from-orange-600 to-red-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="animate-float">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Financial Journey?</h2>
            <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are building wealth through community savings and fair lending
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="transform hover:scale-105 transition-all duration-200 shadow-lg"
                asChild
              >
                <Link href="/groups/create">Start a Group</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-orange-600 transform hover:scale-105 transition-all duration-200"
                asChild
              >
                <Link href="/dashboard">View Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-bounce-slow">
          <div className="w-4 h-4 bg-white opacity-20 rounded-full"></div>
        </div>
        <div className="absolute top-40 right-20 animate-bounce-slow animation-delay-1000">
          <div className="w-6 h-6 bg-white opacity-15 rounded-full"></div>
        </div>
        <div className="absolute bottom-20 left-1/4 animate-bounce-slow animation-delay-2000">
          <div className="w-3 h-3 bg-white opacity-25 rounded-full"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">J</span>
                </div>
                <span className="text-xl font-bold">JamiiFund</span>
              </div>
              <p className="text-gray-400">Empowering communities through decentralized savings and lending</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/groups" className="hover:text-orange-400 transition-colors">
                    Browse Groups
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-orange-400 transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/loans" className="hover:text-orange-400 transition-colors">
                    Loans
                  </Link>
                </li>
                <li>
                  <Link href="/governance" className="hover:text-orange-400 transition-colors">
                    Governance
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/docs" className="hover:text-orange-400 transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="hover:text-orange-400 transition-colors">
                    Support
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="hover:text-orange-400 transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/discord" className="hover:text-orange-400 transition-colors">
                    Discord
                  </Link>
                </li>
                <li>
                  <Link href="/twitter" className="hover:text-orange-400 transition-colors">
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link href="/github" className="hover:text-orange-400 transition-colors">
                    GitHub
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Jamii Fund. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
