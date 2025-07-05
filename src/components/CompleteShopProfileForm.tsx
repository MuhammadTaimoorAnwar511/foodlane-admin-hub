
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Store, Phone, Globe, MapPin, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import colors from "@/theme/colors";
import { useCompleteShopProfile, useUpdateCompleteShopProfile, ContactNumber, SocialLink, Location } from "@/hooks/useShopProfileNew";

const CompleteShopProfileForm = () => {
  const { data: shopData, isLoading } = useCompleteShopProfile();
  const updateShopProfile = useUpdateCompleteShopProfile();

  const [profile, setProfile] = useState({
    id: "",
    shop_name: "",
    tagline: "",
    short_desc: "",
    about_desc: ""
  });

  const [contacts, setContacts] = useState<ContactNumber[]>([]);
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [location, setLocation] = useState<Location>({
    address: "",
    latitude: undefined,
    longitude: undefined,
    google_maps_url: ""
  });

  useEffect(() => {
    if (shopData) {
      setProfile(shopData.profile);
      setContacts(shopData.contacts);
      setSocials(shopData.socials);
      setLocation(shopData.location || {
        address: "",
        latitude: undefined,
        longitude: undefined,
        google_maps_url: ""
      });
    }
  }, [shopData]);

  const handleSave = () => {
    if (!profile.shop_name.trim()) {
      toast.error("Shop name is required");
      return;
    }

    const filteredContacts = contacts.filter(contact => contact.number.trim() !== "");
    const filteredSocials = socials.filter(social => social.url.trim() !== "" && social.platform.trim() !== "");
    const finalLocation = location.address.trim() ? location : null;

    updateShopProfile.mutate({
      profile,
      contacts: filteredContacts,
      socials: filteredSocials,
      location: finalLocation
    });
  };

  const addContact = () => {
    setContacts([...contacts, { type: 'phone', label: '', number: '' }]);
  };

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const updateContact = (index: number, field: keyof ContactNumber, value: string) => {
    const updated = contacts.map((contact, i) => 
      i === index ? { ...contact, [field]: value } : contact
    );
    setContacts(updated);
  };

  const addSocial = () => {
    setSocials([...socials, { platform: '', url: '' }]);
  };

  const removeSocial = (index: number) => {
    setSocials(socials.filter((_, i) => i !== index));
  };

  const updateSocial = (index: number, field: keyof SocialLink, value: string) => {
    const updated = socials.map((social, i) => 
      i === index ? { ...social, [field]: value } : social
    );
    setSocials(updated);
  };

  if (isLoading) {
    return (
      <Card style={{ backgroundColor: colors.backgrounds.card }}>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading shop profile...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card style={{ backgroundColor: colors.backgrounds.card }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5 text-orange-500" />
          Complete Shop Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Basic Shop Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Store className="h-4 w-4" />
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shopName">Shop Name *</Label>
              <Input
                id="shopName"
                value={profile.shop_name}
                onChange={(e) => setProfile({...profile, shop_name: e.target.value})}
                placeholder="Your Shop Name"
                required
              />
            </div>
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={profile.tagline || ""}
                onChange={(e) => setProfile({...profile, tagline: e.target.value})}
                placeholder="Your shop's tagline"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="shortDesc">Short Description</Label>
            <Textarea
              id="shortDesc"
              value={profile.short_desc || ""}
              onChange={(e) => setProfile({...profile, short_desc: e.target.value})}
              placeholder="Brief description for cards and listings"
              rows={2}
            />
          </div>
          
          <div>
            <Label htmlFor="aboutDesc">About Description</Label>
            <Textarea
              id="aboutDesc"
              value={profile.about_desc || ""}
              onChange={(e) => setProfile({...profile, about_desc: e.target.value})}
              placeholder="Detailed description for About Us page"
              rows={4}
            />
          </div>
        </div>

        <Separator />

        {/* Contact Numbers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact Numbers
            </h3>
            <Button type="button" variant="outline" size="sm" onClick={addContact}>
              <Plus className="h-4 w-4 mr-1" />
              Add Contact
            </Button>
          </div>
          
          {contacts.map((contact, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-3">
                <Label>Type</Label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={contact.type}
                  onChange={(e) => updateContact(index, 'type', e.target.value as 'phone' | 'whatsapp')}
                >
                  <option value="phone">Phone</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
              <div className="col-span-3">
                <Label>Label</Label>
                <Input
                  value={contact.label || ""}
                  onChange={(e) => updateContact(index, 'label', e.target.value)}
                  placeholder="e.g. Main, Support"
                />
              </div>
              <div className="col-span-5">
                <Label>Number</Label>
                <Input
                  value={contact.number}
                  onChange={(e) => updateContact(index, 'number', e.target.value)}
                  placeholder="+92-300-1234567"
                />
              </div>
              <div className="col-span-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeContact(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Social Links */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Social Links
            </h3>
            <Button type="button" variant="outline" size="sm" onClick={addSocial}>
              <Plus className="h-4 w-4 mr-1" />
              Add Social
            </Button>
          </div>
          
          {socials.map((social, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-4">
                <Label>Platform</Label>
                <Input
                  value={social.platform}
                  onChange={(e) => updateSocial(index, 'platform', e.target.value)}
                  placeholder="facebook, instagram, twitter"
                />
              </div>
              <div className="col-span-7">
                <Label>URL</Label>
                <Input
                  value={social.url}
                  onChange={(e) => updateSocial(index, 'url', e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
              <div className="col-span-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeSocial(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Location */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </h3>
          
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={location.address}
              onChange={(e) => setLocation({...location, address: e.target.value})}
              placeholder="Full address with area and city"
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={location.latitude || ""}
                onChange={(e) => setLocation({...location, latitude: e.target.value ? parseFloat(e.target.value) : undefined})}
                placeholder="24.8607"
              />
            </div>
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={location.longitude || ""}
                onChange={(e) => setLocation({...location, longitude: e.target.value ? parseFloat(e.target.value) : undefined})}
                placeholder="67.0011"
              />
            </div>
            <div>
              <Label htmlFor="mapsUrl">Google Maps URL</Label>
              <Input
                id="mapsUrl"
                value={location.google_maps_url || ""}
                onChange={(e) => setLocation({...location, google_maps_url: e.target.value})}
                placeholder="https://maps.google.com/..."
              />
            </div>
          </div>
        </div>

        <div className="flex space-x-2 pt-4">
          <Button 
            onClick={handleSave} 
            style={{ backgroundColor: colors.primary[500] }}
            disabled={updateShopProfile.isPending}
          >
            {updateShopProfile.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save Shop Profile'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompleteShopProfileForm;
