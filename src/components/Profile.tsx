import Image from "next/image";

export const UserImage: React.FC<{ url: string; userName: string | null }> = ({
  url,
  userName,
}) => {
  if (!url) return null;
  return (
    <Image
      src={url}
      alt={`${userName}-profile-image`}
      className="h-16 w-16 rounded-full"
      width="64"
      height="64"
    />
  );
};
