import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Calendar, Users, Eye } from "lucide-react";
import TourDetailModal from "@/components/TourDetailModal";
import { motion } from "framer-motion";

interface Tour {
  id: number;
  title: string;
  description?: string;
  destination: string;
  duration: string;
  price: any;
  currency: string;
  imageUrl: string;
  rating: any;
  reviewCount: number | null;
  activityType: string;
  [key: string]: any;
}

interface TourGridProps {
  tours: Tour[];
  sessionId: string;
}

export default function TourGrid({ tours, sessionId }: TourGridProps) {
  const [selectedTourId, setSelectedTourId] = useState<number | null>(null);
  const selectedTour = tours.find((t) => t.id === selectedTourId);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tours.map((tour, index) => (
          <motion.div
            key={tour.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
          <Card
            className="overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer h-full"
            onClick={() => setSelectedTourId(tour.id)}
          >
            {/* Image */}
            <div className="relative h-48 overflow-hidden bg-slate-200">
              <img
                src={tour.imageUrl}
                alt={tour.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3">
                <Badge className="bg-blue-600 text-white">{tour.activityType}</Badge>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full bg-white/90 hover:bg-white text-slate-900"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTourId(tour.id);
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Quick View
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Title */}
              <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                {tour.title}
              </h3>

              {/* Destination */}
              <div className="flex items-center gap-2 text-slate-600 mb-3">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{tour.destination}</span>
              </div>

              {/* Details */}
              <div className="flex gap-4 mb-4 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {tour.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Group
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(parseFloat(tour.rating.toString()))
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  {parseFloat(tour.rating.toString()).toFixed(1)}
                </span>
                <span className="text-sm text-slate-500">({tour.reviewCount})</span>
              </div>

              {/* Price and CTA */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div>
                  <span className="text-2xl font-bold text-slate-900">
                    ${parseFloat(tour.price.toString()).toFixed(0)}
                  </span>
                  <span className="text-sm text-slate-500 ml-1">per person</span>
                </div>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTourId(tour.id);
                  }}
                >
                  Book Now
                </Button>
              </div>
            </div>
          </Card>
          </motion.div>
        ))}
      </div>

      {/* Tour Detail Modal */}
      {selectedTour && (
        <TourDetailModal
          tour={selectedTour}
          isOpen={selectedTourId !== null}
          onClose={() => setSelectedTourId(null)}
          sessionId={sessionId}
        />
      )}
    </>
  );
}
