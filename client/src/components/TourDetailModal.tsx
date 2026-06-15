import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Check, X, Share2, Sparkles, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import BookingForm from "@/components/BookingForm";
import { toast } from "sonner";

// Tour type is defined in TourGrid.tsx to avoid duplication
type Tour = any;

interface TourDetailModalProps {
  tour: Tour;
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

export default function TourDetailModal({
  tour,
  isOpen,
  onClose,
  sessionId,
}: TourDetailModalProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showBooking, setShowBooking] = useState(false);
  const { data: reviews = [] } = trpc.reviews.getByTourId.useQuery({
    tourId: tour.id,
    limit: 5,
  });
  const { data: aiHighlights, isLoading: aiLoading } = trpc.reviews.summarize.useQuery(
    { tourId: tour.id },
    { enabled: isOpen },
  );

  const highlights = (tour.highlights as string[] | undefined) || [];
  const inclusions = (tour.inclusions as string[] | undefined) || [];
  const exclusions = (tour.exclusions as string[] | undefined) || [];
  const galleryImages = (tour.galleryImages as string[] | undefined) || [tour.imageUrl];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-2xl">{tour.title}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="booking">Booking</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Gallery */}
            <div className="grid grid-cols-2 gap-2">
              <img
                src={galleryImages[0] || tour.imageUrl}
                alt={tour.title}
                className="col-span-2 w-full h-64 object-cover rounded-lg"
              />
              {galleryImages.slice(1, 3).map((img: string, i: number) => (
                <img
                  key={i}
                  src={img}
                  alt={`${tour.title} ${i + 2}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              ))}
            </div>

            {/* Key Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Destination</p>
                <p className="font-semibold text-slate-900">{tour.destination}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Duration</p>
                <p className="font-semibold text-slate-900">{tour.duration}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Price</p>
                <p className="font-semibold text-slate-900">
                  ${parseFloat(tour.price.toString()).toFixed(0)}/person
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Rating</p>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <p className="font-semibold text-slate-900">
                    {parseFloat(tour.rating.toString()).toFixed(1)}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            {tour.description && (
              <div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">About This Tour</h3>
                <p className="text-slate-600 leading-relaxed">{tour.description}</p>
              </div>
            )}

            {/* Highlights */}
            {highlights && highlights.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg text-slate-900 mb-3">Highlights</h3>
                <ul className="space-y-2">
                  {highlights.map((highlight: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            {/* Inclusions */}
            {inclusions && inclusions.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg text-slate-900 mb-3 flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  Inclusions
                </h3>
                <ul className="space-y-2">
                  {inclusions.map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-slate-700">
                      <Check className="w-4 h-4 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Exclusions */}
            {exclusions && exclusions.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg text-slate-900 mb-3 flex items-center gap-2">
                  <X className="w-5 h-5 text-red-500" />
                  Exclusions
                </h3>
                <ul className="space-y-2">
                  {exclusions.map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-slate-700">
                      <X className="w-4 h-4 text-red-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Operator Info */}
            {tour.operatorName && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">Tour Operator</h3>
                <p className="text-slate-700">{tour.operatorName}</p>
              </div>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4">
            {/* AI Review Highlights */}
            <div className="p-4 rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h4 className="font-semibold text-slate-900">AI Review Highlights</h4>
              </div>
              {aiLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Loader2 className="w-4 h-4 animate-spin" /> Analyzing reviews...
                </div>
              ) : aiHighlights && aiHighlights.available ? (
                <div className="space-y-3">
                  {aiHighlights.summary && (
                    <p className="text-sm text-slate-700 italic">"{aiHighlights.summary}"</p>
                  )}
                  <div className="grid md:grid-cols-2 gap-3">
                    {aiHighlights.pros.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-green-700 flex items-center gap-1 mb-1">
                          <ThumbsUp className="w-3 h-3" /> Pros
                        </p>
                        <ul className="space-y-1">
                          {aiHighlights.pros.map((p: string, i: number) => (
                            <li key={i} className="text-sm text-slate-700 flex gap-1">
                              <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {aiHighlights.cons.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-red-700 flex items-center gap-1 mb-1">
                          <ThumbsDown className="w-3 h-3" /> Cons
                        </p>
                        <ul className="space-y-1">
                          {aiHighlights.cons.map((c: string, i: number) => (
                            <li key={i} className="text-sm text-slate-700 flex gap-1">
                              <X className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Based on {aiHighlights.totalReviews} reviews · Avg ★
                    {aiHighlights.avgRating.toFixed(1)}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-600">
                  AI highlights will appear once this tour has reviews.
                </p>
              )}
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <div key={review.id} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-slate-900">{review.authorName}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-slate-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.verifiedPurchase && (
                        <Badge className="bg-green-100 text-green-800">Verified</Badge>
                      )}
                    </div>
                    <p className="font-semibold text-slate-900 mb-1">{review.title}</p>
                    <p className="text-slate-700 text-sm">{review.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 text-center py-8">No reviews yet. Be the first to review!</p>
            )}
          </TabsContent>

          {/* Booking Tab */}
          <TabsContent value="booking" className="space-y-4">
            {!showBooking ? (
              <div className="text-center py-8">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Ready to Book?</h3>
                <p className="text-slate-600 mb-6">
                  Price: <span className="font-bold text-blue-600">
                    ${parseFloat(tour.price.toString()).toFixed(0)}/person
                  </span>
                </p>
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowBooking(true)}
                >
                  Proceed to Booking
                </Button>
              </div>
            ) : (
              <BookingForm tour={tour} sessionId={sessionId} onSuccess={onClose} />
            )}
          </TabsContent>
        </Tabs>

        {/* Share Button */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/tours`);
              toast.success("Tour link copied to clipboard!");
            }}
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              setActiveTab("booking");
              setShowBooking(true);
            }}
          >
            Book Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
