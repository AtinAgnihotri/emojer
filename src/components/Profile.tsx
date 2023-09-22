import Image from "next/image";

type TUserImage = {
  url: string;
  userName: string | null;
  size?: number;
  className?: string;
};

export const UserImage: React.FC<TUserImage> = ({
  url,
  userName,
  size,
  className,
}) => {
  if (!url) return null;
  const imgSize: `${number}` = `${size ?? 64}`;
  console.log("Image size", imgSize);
  return (
    <Image
      src={url}
      alt={`${userName}-profile-image`}
      className={`rounded-full ${className}`}
      width={imgSize}
      height={imgSize}
    />
  );
};
