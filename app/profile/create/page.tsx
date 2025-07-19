"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ProfileFormData } from "@/database.types";

export default function CreateProfilePage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const supabase = createClient();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sundharan, setSundharan] = useState<boolean | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    display_name: "",
    college_name: "",
    favourite_hobby: "",
    favourite_dish: "",
    favourite_sportsperson: "",
    best_movie: "",
    relationship_status: undefined,
    additional_description: "",
    gemini_api_key: "",
  });

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateDescription = () => {
    const parts = [];
    
    // DO NOT include the name in the description - it should only be in the display_name column
    if (formData.college_name) parts.push(`I studied at ${formData.college_name}.`);
    if (formData.favourite_hobby) parts.push(`My favorite hobby is ${formData.favourite_hobby}.`);
    if (formData.favourite_dish) parts.push(`My favorite dish is ${formData.favourite_dish}.`);
    if (formData.favourite_sportsperson) parts.push(`My favorite sportsperson is ${formData.favourite_sportsperson}.`);
    if (formData.best_movie) parts.push(`The best movie I've ever seen is ${formData.best_movie}.`);
    if (formData.relationship_status) parts.push(`I am currently ${formData.relationship_status.toLowerCase()}.`);
    if (formData.additional_description) parts.push(formData.additional_description);
    
    return parts.join(" ");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a profile.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.display_name.trim()) {
      toast({
        title: "Error",
        description: "Display name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.gemini_api_key.trim()) {
      toast({
        title: "Error",
        description: "Gemini API key is required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const description = generateDescription();
      
      // Always insert a new profile with a new UUID (generated automatically)
      const { error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          display_name: formData.display_name.trim(),
          description: description,
          gemini_api_key: formData.gemini_api_key.trim(),
          points: 0,
        });

      if (error) {
        // If we get a unique constraint error, it means the database still has the constraint
        if (error.code === '23505') {
          throw new Error('You already have a profile. Please remove the unique constraint from the database to create multiple profiles.');
        }
        throw error;
      }

      toast({
        title: "Success!",
        description: "Your profile has been created successfully.",
      });

      router.push('/');
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push('/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container max-w-3xl mx-auto py-6 md:py-8 px-4">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="text-4xl md:text-5xl mb-4">👤</div>
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Create Your Profile
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              Tell us about yourself so others can try to guess who you are! 
              The more details you provide, the more fun the game becomes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">🎯 How it works</h3>
              <p className="text-blue-700 text-sm leading-relaxed">
                Your information will be used by AI to pretend to be you in conversations with other players. 
                They&apos;ll ask questions and try to figure out who you are based on your answers!
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="relationship_status" className="text-sm font-medium">
                Are you സുന്ദരൻ?
              </label>
              <select
                id="relationship_status"
                onChange={(e) => setSundharan(e.target.value === "Yes")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Maybe" selected>അറിയില്ല</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option> 
              </select>
              {sundharan === true && (
                <p className="text-gray-500">
                  എടാ സുന്ദരാ....
                </p>
              )}
              {sundharan === false && (
                <p>
                  <a href="https://www.youtube.com/watch?v=u1L154H3nOI" target="_blank" className="text-blue-500 hover:underline mt-6" rel="noopener noreferrer">
                  Watch This Video
                  </a>
                  </p>
              )}
            </div>
            
            {/* Display Name - Required */}
            <div className="space-y-3">
              <label htmlFor="display_name" className="text-base font-semibold text-gray-800 flex items-center space-x-2">
                <span>🏷️</span>
                <span>ആരാ അവിടെ ???, Display Name *</span>
              </label>
              <input
                id="display_name"
                type="text"
                value={formData.display_name}
                onChange={(e) => handleInputChange('display_name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="What should people call you?"
                required
              />
              <p className="text-sm text-gray-500">This is how you&apos;ll appear on the leaderboard</p>
            </div>

            {/* College Name - Optional */}
            <div className="space-y-2">
              <label htmlFor="college_name" className="text-sm font-medium">
                College Name, 70% attendence ഇണ്ടെങ്കിൽ പറഞ്ഞാ മതി 
              </label>
              <input
                id="college_name"
                type="text"
                value={formData.college_name}
                onChange={(e) => handleInputChange('college_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your college name"
              />
            </div>

            {/* Favourite Hobby - Optional */}
            <div className="space-y-2">
              <label htmlFor="favourite_hobby" className="text-sm font-medium">
              വെറുതെ ഇരിക്കുമ്പോ തൻ എന്താ ചെയ്യാ? ( Hobby )
              </label>
              <input
                id="favourite_hobby"
                type="text"
                value={formData.favourite_hobby}
                onChange={(e) => handleInputChange('favourite_hobby', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What do you love doing in your free time?"
              />
            </div>

            {/* Favourite Dish - Optional */}
            <div className="space-y-2">
              <label htmlFor="favourite_dish" className="text-sm font-medium">
              കഴിക്കാൻ കൊതി ഇല്ലെ Food
              </label>
              <input
                id="favourite_dish"
                type="text"
                value={formData.favourite_dish}
                onChange={(e) => handleInputChange('favourite_dish', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What's your favorite food?"
              />
            </div>

            {/* Favourite Sportsperson - Optional */}
            <div className="space-y-2">
              <label htmlFor="favourite_sportsperson" className="text-sm font-medium">
              നിനക്ക് കായികപരമായി വല്ല കഴിവും ഉണ്ടോ 
              </label>
              <input
                id="favourite_sportsperson"
                type="text"
                value={formData.favourite_sportsperson}
                onChange={(e) => handleInputChange('favourite_sportsperson', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Who's your favorite athlete?"
              />
            </div>

            {/* Best Movie - Optional */}
            <div className="space-y-2">
              <label htmlFor="best_movie" className="text-sm font-medium">
              പെരുത്ത് ഇഷ്ട്ടായ സിനിമ 
              </label>
              <input
                id="best_movie"
                type="text"
                value={formData.best_movie}
                onChange={(e) => handleInputChange('best_movie', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What's the best movie you've watched?"
              />
            </div>

            {/* Relationship Status - Optional Dropdown */}
            <div className="space-y-2">
              <label htmlFor="relationship_status" className="text-sm font-medium">
                Relationship Status
              </label>
              <select
                id="relationship_status"
                value={formData.relationship_status || ""}
                onChange={(e) => handleInputChange('relationship_status', e.target.value as 'Single' | 'Committed')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select your status</option>
                <option value="Single">Single</option>
                <option value="Committed">Committed</option>
                <option value="Looking">നോക്കി കിട്ടിയില്ല </option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="best_movie" className="text-sm font-medium">
              Favourite Vibecodding Instagrammer Who only makes incredibly adipoli content. 
              </label>
              <input
                type="text"
                value="@truevibecoder"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What's the best movie you've watched?"
              />
            </div>

            {/* Additional Description - Optional */}
            <div className="space-y-2">
              <label htmlFor="additional_description" className="text-sm font-medium">
              നിങ്ങളെ കുറിച്ച കുറേ കൂടി തള്ള് 
              </label>
              <textarea
                id="additional_description"
                value={formData.additional_description}
                onChange={(e) => handleInputChange('additional_description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                placeholder="Tell us anything else about yourself..."
              />
            </div>

            {/* Gemini API Key - Required */}
            <div className="space-y-2">
              <label htmlFor="gemini_api_key" className="text-sm font-medium">
                Gemini API Key *
              </label>
              <input
                id="gemini_api_key"
                type="password"
                value={formData.gemini_api_key}
                onChange={(e) => handleInputChange('gemini_api_key', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your Gemini API key"
                required
              />
              <p className="text-xs text-muted-foreground">
                Get your API key from{" "}
                <a 
                  href="https://makersuite.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Creating Profile..." : "Create Profile"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}