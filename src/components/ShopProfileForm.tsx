import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Save, Facebook, Instagram, Twitter, MessageCircle, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";
import colors from "@/theme/colors";

interface PhoneNumber {
  id: string;
  number: string;
  label: string;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  customLabel?: string;
}

interface ShopProfileData {
  shopName: string;
  tagline: string;
  description: string;
  shortDescription: string;
  address: string;
  coordinates: {
    lat: string;
    lng: string;
  };
  phoneNumbers: PhoneNumber[];
  whatsappNumbers: PhoneNumber[];
  socialLinks: SocialLink[];
}

const socialPlatforms = [
  { value: "facebook", label: "Facebook", icon: Facebook },
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "twitter", label: "Twitter/X", icon: Twitter },
  { value: "telegram", label: "Telegram", icon: MessageCircle },
  { value: "whatsapp-group", label: "WhatsApp Group", icon: MessageCircle },
  { value: "email", label: "Email", icon: Mail },
  { value: "custom", label: "Custom", icon: MapPin },
];

const ShopProfileForm = () => {
  const [formData, setFormData] = useState<ShopProfileData>(() => {
    const saved = localStorage.getItem("shopProfile");
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      shopName: "FastFood Delight",
      tagline: "Delicious food delivered fast",
      description: "We serve the best fast food in town with fresh ingredients and quick delivery.",
      shortDescription: "Best fast food in town",
      address: "123 Main Street, City Center",
      coordinates: {
        lat: "",
        lng: ""
      },
      phoneNumbers: [{ id: "1", number: "", label: "Main" }],
      whatsappNumbers: [{ id: "1", number: "", label: "Support" }],
      socialLinks: []
    };
  });

  const { register, handleSubmit, formState: { errors } } = useForm<ShopProfileData>({
    defaultValues: formData
  });

  const addPhoneNumber = () => {
    setFormData(prev => ({
      ...prev,
      phoneNumbers: [...prev.phoneNumbers, { id: Date.now().toString(), number: "", label: "" }]
    }));
  };

  const removePhoneNumber = (id: string) => {
    setFormData(prev => ({
      ...prev,
      phoneNumbers: prev.phoneNumbers.filter(phone => phone.id !== id)
    }));
  };

  const addWhatsappNumber = () => {
    setFormData(prev => ({
      ...prev,
      whatsappNumbers: [...prev.whatsappNumbers, { id: Date.now().toString(), number: "", label: "" }]
    }));
  };

  const removeWhatsappNumber = (id: string) => {
    setFormData(prev => ({
      ...prev,
      whatsappNumbers: prev.whatsappNumbers.filter(whatsapp => whatsapp.id !== id)
    }));
  };

  const addSocialLink = () => {
    setFormData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { id: Date.now().toString(), platform: "facebook", url: "" }]
    }));
  };

  const removeSocialLink = (id: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter(link => link.id !== id)
    }));
  };

  const updatePhoneNumber = (id: string, field: keyof PhoneNumber, value: string) => {
    setFormData(prev => ({
      ...prev,
      phoneNumbers: prev.phoneNumbers.map(phone => 
        phone.id === id ? { ...phone, [field]: value } : phone
      )
    }));
  };

  const updateWhatsappNumber = (id: string, field: keyof PhoneNumber, value: string) => {
    setFormData(prev => ({
      ...prev,
      whatsappNumbers: prev.whatsappNumbers.map(whatsapp => 
        whatsapp.id === id ? { ...whatsapp, [field]: value } : whatsapp
      )
    }));
  };

  const updateSocialLink = (id: string, field: keyof SocialLink, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map(link => 
        link.id === id ? { ...link, [field]: value } : link
      )
    }));
  };

  const extractCoordinatesFromUrl = (url: string) => {
    // Extract coordinates from Google Maps URL
    const coordMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (coordMatch) {
      setFormData(prev => ({
        ...prev,
        coordinates: {
          lat: coordMatch[1],
          lng: coordMatch[2]
        }
      }));
    }
  };

  const onSubmit = (data: ShopProfileData) => {
    const profileData = { ...data, ...formData };
    console.log("Saving shop profile:", profileData);
    
    // Store in localStorage
    localStorage.setItem("shopProfile", JSON.stringify(profileData));
    
    // Emit shop-profile-updated event
    window.dispatchEvent(new CustomEvent('shop-profile-updated', {
      detail: profileData
    }));
    
    toast.success("Shop profile updated successfully!");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card style={{ backgroundColor: colors.backgrounds.card }}>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shopName">Shop Name</Label>
              <Input
                id="shopName"
                {...register("shopName", { required: "Shop name is required" })}
                value={formData.shopName}
                onChange={(e) => setFormData(prev => ({ ...prev, shopName: e.target.value }))}
              />
              {errors.shopName && <p className="text-sm text-red-500">{errors.shopName.message}</p>}
            </div>
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                placeholder="e.g., Delicious food delivered fast"
                value={formData.tagline}
                onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="shortDescription">Short Description</Label>
            <Input
              id="shortDescription"
              placeholder="Brief description for listings"
              value={formData.shortDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="description">About / Description</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Tell customers about your restaurant..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card style={{ backgroundColor: colors.backgrounds.card }}>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Phone Numbers */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Phone Numbers</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPhoneNumber}>
                <Plus className="h-4 w-4 mr-1" />
                Add Phone
              </Button>
            </div>
            <div className="space-y-2">
              {formData.phoneNumbers.map((phone) => (
                <div key={phone.id} className="flex gap-2">
                  <Input
                    placeholder="Label (e.g., Main, Orders)"
                    value={phone.label}
                    onChange={(e) => updatePhoneNumber(phone.id, 'label', e.target.value)}
                    className="w-1/3"
                  />
                  <Input
                    placeholder="Phone number"
                    value={phone.number}
                    onChange={(e) => updatePhoneNumber(phone.id, 'number', e.target.value)}
                    className="flex-1"
                  />
                  {formData.phoneNumbers.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removePhoneNumber(phone.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* WhatsApp Numbers */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>WhatsApp Numbers</Label>
              <Button type="button" variant="outline" size="sm" onClick={addWhatsappNumber}>
                <Plus className="h-4 w-4 mr-1" />
                Add WhatsApp
              </Button>
            </div>
            <div className="space-y-2">
              {formData.whatsappNumbers.map((whatsapp) => (
                <div key={whatsapp.id} className="flex gap-2">
                  <Input
                    placeholder="Label (e.g., Support, Orders)"
                    value={whatsapp.label}
                    onChange={(e) => updateWhatsappNumber(whatsapp.id, 'label', e.target.value)}
                    className="w-1/3"
                  />
                  <Input
                    placeholder="WhatsApp number"
                    value={whatsapp.number}
                    onChange={(e) => updateWhatsappNumber(whatsapp.id, 'number', e.target.value)}
                    className="flex-1"
                  />
                  {formData.whatsappNumbers.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeWhatsappNumber(whatsapp.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card style={{ backgroundColor: colors.backgrounds.card }}>
        <CardHeader>
          <CardTitle>Social Media & Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <Label>Social Links</Label>
            <Button type="button" variant="outline" size="sm" onClick={addSocialLink}>
              <Plus className="h-4 w-4 mr-1" />
              Add Link
            </Button>
          </div>
          <div className="space-y-2">
            {formData.socialLinks.map((link) => (
              <div key={link.id} className="flex gap-2">
                <select
                  value={link.platform}
                  onChange={(e) => updateSocialLink(link.id, 'platform', e.target.value)}
                  className="w-1/3 rounded-md border border-input bg-background px-3 py-2"
                >
                  {socialPlatforms.map((platform) => (
                    <option key={platform.value} value={platform.value}>
                      {platform.label}
                    </option>
                  ))}
                </select>
                {link.platform === 'custom' && (
                  <Input
                    placeholder="Custom label"
                    value={link.customLabel || ''}
                    onChange={(e) => updateSocialLink(link.id, 'customLabel', e.target.value)}
                    className="w-1/4"
                  />
                )}
                <Input
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) => updateSocialLink(link.id, 'url', e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeSocialLink(link.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card style={{ backgroundColor: colors.backgrounds.card }}>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address">Physical Address</Label>
            <Textarea
              id="address"
              rows={2}
              placeholder="Full address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                placeholder="e.g., 40.7128"
                value={formData.coordinates.lat}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  coordinates: { ...prev.coordinates, lat: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="lng">Longitude</Label>
              <Input
                id="lng"
                placeholder="e.g., -74.0060"
                value={formData.coordinates.lng}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  coordinates: { ...prev.coordinates, lng: e.target.value }
                }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="mapUrl">Or paste Google Maps URL</Label>
            <Input
              id="mapUrl"
              placeholder="Paste Google Maps URL to auto-extract coordinates"
              onBlur={(e) => extractCoordinatesFromUrl(e.target.value)}
            />
            <p className="text-sm text-gray-500 mt-1">
              Paste a Google Maps link and coordinates will be extracted automatically
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" style={{ backgroundColor: colors.primary[600] }}>
          <Save className="h-4 w-4 mr-2" />
          Save Shop Profile
        </Button>
      </div>
    </form>
  );
};

export default ShopProfileForm;
