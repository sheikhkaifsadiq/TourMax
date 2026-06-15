import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Search, MessageCircle, MapPin, Calendar, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import SearchBar from "@/components/SearchBar";
import TourGrid from "@/components/TourGrid";
import ChatbotWidget from "@/components/ChatbotWidget";
import RecommendationsSection from "@/components/RecommendationsSection";
import Footer from "@/components/Footer";
import { FEATURED_TOURS } from "@/data/featuredTours";
import { useResponsiveCount } from "@/hooks/useResponsiveCount";

export default function Home() {
  const { user } = useAuth();
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [showChatbot, setShowChatbot] = useState(false);

  const visibleCount = useResponsiveCount();

  // Always use the curated FEATURED_TOURS list to guarantee distinct content
  // from Personalized Recommendations (which uses RECOMMENDED_TOURS).
  const toursLoading = false;
  const tours = FEATURED_TOURS.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation sessionId={sessionId} />

      {/* Hero Section */}
      <HeroSection />

      {/* Search Section */}
      <section className="py-12 bg-gradient-to-b from-slate-50 to-white">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-slate-900">
              Discover Your Next Adventure
            </h2>
            <SearchBar sessionId={sessionId} />
          </div>
        </div>
      </section>

      {/* Featured Tours Section */}
      <section id="tours" className="py-20 bg-white">
        <div className="container px-4 mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Featured Tours</h2>
            <p className="text-lg text-slate-600">
              Explore our carefully curated selection of premium travel experiences
            </p>
          </div>

          {toursLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-slate-200 rounded-lg h-96 animate-pulse" />
              ))}
            </div>
          ) : (
            <TourGrid tours={tours} sessionId={sessionId} />
          )}
        </div>
      </section>

      {/* Recommendations Section */}
      <RecommendationsSection sessionId={sessionId} />

      {/* Why Choose Us Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container px-4 mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Why Choose TourMax</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Search</h3>
              <p className="text-slate-300">
                Natural language search that understands exactly what you're looking for
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Reviews</h3>
              <p className="text-slate-300">
                Real feedback from real travelers to help you make informed decisions
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-slate-300">
                AI chatbot and human support available whenever you need assistance
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Explore?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Start planning your dream vacation with TourMax today
          </p>
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
          >
            Browse All Tours
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer sessionId={sessionId} />

      {/* Chatbot Widget */}
      <ChatbotWidget
        sessionId={sessionId}
        isOpen={showChatbot}
        onToggle={() => setShowChatbot(!showChatbot)}
      />
    </div>
  );
}
