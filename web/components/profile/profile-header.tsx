import { Profile } from "@/lib/types/profile";

interface ProfileHeaderProps {
  profile: Profile | null;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center mb-8">
      <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl font-semibold mb-3">
        {profile?.first_name?.charAt(0)}
      </div>
      <h1 className="text-xl font-semibold">
        {profile?.first_name} {profile?.last_name}
      </h1>
      {profile?.city && (
        <p className="text-sm text-muted-foreground mt-1">
          📍 {profile.city.name}
        </p>
      )}
      {profile?.vehicle && (
        <p className="text-sm text-muted-foreground mt-1">
          🚗 {profile.vehicle.brand.name}
          {profile.vehicle.model ? ` ${profile.vehicle.model.name}` : ""}
        </p>
      )}
    </div>
  );
}
