import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, CheckCircle, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Tour {
  id: number;
  title: string;
  price: any;
  duration: string;
  destination: string;
  [key: string]: any;
}

interface BookingFormProps {
  tour: Tour;
  sessionId: string;
  onSuccess: () => void;
}

export default function BookingForm({ tour, sessionId, onSuccess }: BookingFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    date: "",
    travelers: 1,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
    isGuest: true,
  });
  const [selectedAncillaryServices, setSelectedAncillaryServices] = useState<Array<{ type: string; name: string; price: number; quantity: number }>>([]);

  const createBookingMutation = trpc.bookings.create.useMutation();
  const checkoutMutation = trpc.bookings.createCheckoutSession.useMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ancillaryPrice = selectedAncillaryServices.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const totalPrice = parseFloat(tour.price.toString()) * formData.travelers + ancillaryPrice;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "travelers" ? parseInt(value) : value,
    }));
  };

  const handleNextStep = () => {
    if (step === 1 && (!formData.date || formData.travelers < 1)) {
      toast.error("Please select a date and number of travelers");
      return;
    }
    if (step === 2 && (!formData.firstName || !formData.lastName || !formData.email)) {
      toast.error("Please fill in all required fields");
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await createBookingMutation.mutateAsync({
        tourId: tour.id,
        selectedDate: formData.date,
        travelerCount: formData.travelers,
        travelers: [{ name: `${formData.firstName} ${formData.lastName}`, email: formData.email }],
        guestFirstName: formData.firstName,
        guestLastName: formData.lastName,
        guestEmail: formData.email,
        guestPhone: formData.phone || "0000000000",
        specialRequests: formData.specialRequests || undefined,
        selectedAncillaryServices,
      });

      toast.success(`Booking ${result.bookingReference} created — redirecting to payment...`);

      try {
        const origin = window.location.origin;
        const checkout = await checkoutMutation.mutateAsync({
          reference: result.bookingReference,
          successUrl: `${origin}/payment/success`,
          cancelUrl: `${origin}/payment/cancel`,
        });
        if (checkout.url) {
          window.location.href = checkout.url;
          return;
        }
        toast.info("Payment is not yet configured. Your booking is saved — we'll be in touch.");
        onSuccess();
      } catch (err: any) {
        toast.error(err?.message || "Payment unavailable. Your booking is saved as pending.");
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error?.message || "Booking failed. Please try again.");
      console.error("Booking error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                s <= step
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {s < step ? <CheckCircle className="w-6 h-6" /> : s}
            </div>
            {s < 3 && (
              <div
                className={`h-1 w-12 mx-2 transition ${
                  s < step ? "bg-blue-600" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="flex justify-between text-sm font-medium">
        <span className={step >= 1 ? "text-slate-900" : "text-slate-500"}>
          Date & Travelers
        </span>
        <span className={step >= 2 ? "text-slate-900" : "text-slate-500"}>
          Guest Details
        </span>
        <span className={step >= 3 ? "text-slate-900" : "text-slate-500"}>
          Review & Confirm
        </span>
      </div>

      {/* Step 1: Date & Travelers */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Select Tour Date
            </label>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-400" />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Number of Travelers
            </label>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-400" />
              <input
                type="number"
                name="travelers"
                min="1"
                value={formData.travelers}
                onChange={handleInputChange}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Ancillary Services (Add-ons) */}
          {(tour.ancillaryServices && tour.ancillaryServices.length > 0) && (
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Enhance your trip (Optional Add-ons)
              </label>
              <div className="space-y-3">
                {tour.ancillaryServices.map((addon: any, idx: number) => {
                  const selected = selectedAncillaryServices.find(s => s.name === addon.name);
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                      <div>
                        <div className="font-medium text-slate-900">{addon.name}</div>
                        <div className="text-xs text-slate-500">{addon.type}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-blue-600">+${addon.price}</span>
                        {selected ? (
                          <div className="flex items-center gap-2 bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
                            <button 
                              className="text-blue-600 hover:text-blue-800 font-bold px-1"
                              onClick={() => {
                                if (selected.quantity > 1) {
                                  setSelectedAncillaryServices(prev => prev.map(s => s.name === addon.name ? { ...s, quantity: s.quantity - 1 } : s));
                                } else {
                                  setSelectedAncillaryServices(prev => prev.filter(s => s.name !== addon.name));
                                }
                              }}
                            >-</button>
                            <span className="text-sm font-medium text-blue-900 min-w-[1rem] text-center">{selected.quantity}</span>
                            <button 
                              className="text-blue-600 hover:text-blue-800 font-bold px-1"
                              onClick={() => setSelectedAncillaryServices(prev => prev.map(s => s.name === addon.name ? { ...s, quantity: s.quantity + 1 } : s))}
                            >+</button>
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs h-7 border-blue-200 text-blue-700 hover:bg-blue-50"
                            onClick={() => setSelectedAncillaryServices(prev => [...prev, { ...addon, quantity: 1 }])}
                          >
                            Add
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Price Preview */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-slate-700">
                Tour Total ({formData.travelers} × ${parseFloat(tour.price.toString()).toFixed(0)})
                {ancillaryPrice > 0 && ` + Add-ons ($${ancillaryPrice.toFixed(0)})`}
              </span>
              <span className="text-2xl font-bold text-blue-600">
                ${totalPrice.toFixed(0)}
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* Step 2: Guest Details */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                First Name *
              </label>
              <Input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Last Name *
              </label>
              <Input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Email Address *
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Phone Number
            </label>
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Special Requests
            </label>
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleInputChange}
              placeholder="Any dietary restrictions, accessibility needs, or special preferences?"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24"
            />
          </div>

          <Badge className="bg-green-100 text-green-800">
            ✓ No account required - guest checkout available
          </Badge>
        </div>
      )}

      {/* Step 3: Review & Confirm */}
      {step === 3 && (
        <div className="space-y-4">
          <Card className="p-4 bg-slate-50">
            <h3 className="font-semibold text-slate-900 mb-3">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Tour:</span>
                <span className="font-medium text-slate-900">{tour.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Destination:</span>
                <span className="font-medium text-slate-900">{tour.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Date:</span>
                <span className="font-medium text-slate-900">{formData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Travelers:</span>
                <span className="font-medium text-slate-900">{formData.travelers}</span>
              </div>
              {selectedAncillaryServices.length > 0 && (
                <div className="pt-2">
                  <span className="text-slate-600 font-medium block mb-1">Add-ons:</span>
                  {selectedAncillaryServices.map((addon, idx) => (
                    <div key={idx} className="flex justify-between pl-2 text-xs">
                      <span className="text-slate-500">{addon.quantity}x {addon.name}</span>
                      <span className="font-medium text-slate-800">${(addon.price * addon.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between font-semibold">
                <span>Total:</span>
                <span className="text-blue-600">${totalPrice.toFixed(0)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-slate-50">
            <h3 className="font-semibold text-slate-900 mb-3">Guest Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Name:</span>
                <span className="font-medium text-slate-900">
                  {formData.firstName} {formData.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Email:</span>
                <span className="font-medium text-slate-900">{formData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Phone:</span>
                <span className="font-medium text-slate-900">
                  {formData.phone || "Not provided"}
                </span>
              </div>
            </div>
          </Card>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-slate-700">
              ✓ Confirmation email will be sent to <strong>{formData.email}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4">
        {step > 1 && (
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            className="flex-1"
          >
            Back
          </Button>
        )}
        {step < 3 ? (
          <Button
            onClick={handleNextStep}
            className="flex-1 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            Next <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? "Processing..." : "Confirm Booking"}
          </Button>
        )}
      </div>
    </div>
  );
}
