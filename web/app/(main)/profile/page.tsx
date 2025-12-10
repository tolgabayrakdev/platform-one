"use client";

import { useCallback } from "react";
import { useProfile } from "@/hooks/use-profile";
import { useBadges } from "@/hooks/use-badges";
import { useNotifications } from "@/hooks/use-notifications";
import { useLocations } from "@/hooks/use-locations";
import ProfileHeader from "@/components/profile/profile-header";
import BadgesSection from "@/components/profile/badges-section";
import ProfileInfoSection from "@/components/profile/profile-info-section";
import NotificationSettings from "@/components/profile/notification-settings";
import ThemeSelector from "@/components/profile/theme-selector";
import LogoutButton from "@/components/profile/logout-button";

export default function ProfilePage() {
  const { profile, loading, updateCity, updateVehicle } = useProfile();
  const { badgeData } = useBadges();
  const { notificationPermission, requestingPermission, requestNotificationPermission } = useNotifications();
  const { cities, brands, models, fetchModels, setModels } = useLocations();

  const handleCityUpdate = useCallback(async (cityId: number) => {
    return await updateCity(cityId);
  }, [updateCity]);

  const handleVehicleUpdate = useCallback(async (brandId: number | null, modelId: number | null) => {
    return await updateVehicle(brandId, modelId);
  }, [updateVehicle]);

  const handleModelsFetch = useCallback((brandId: number) => {
    fetchModels(brandId);
  }, [fetchModels]);

  const handleModelsReset = useCallback(() => {
      setModels([]);
  }, [setModels]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="max-w-xl mx-auto px-4 h-12 flex items-center">
          <span className="font-semibold">Profil</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-xl mx-auto px-4 py-6">
        <ProfileHeader profile={profile} />
        <BadgesSection badgeData={badgeData} />
        <ProfileInfoSection
          profile={profile}
          cities={cities}
          brands={brands}
          models={models}
          onCityUpdate={handleCityUpdate}
          onVehicleUpdate={handleVehicleUpdate}
          onModelsFetch={handleModelsFetch}
          onModelsReset={handleModelsReset}
        />
        <NotificationSettings
          notificationPermission={notificationPermission}
          requestingPermission={requestingPermission}
          onRequestPermission={requestNotificationPermission}
        />
        <ThemeSelector />
        <LogoutButton />
      </main>
    </div>
  );
}
