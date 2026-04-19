type Props = {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark";
  showText?: boolean;
  id?: string;
};

const widths = { sm: 130, md: 160, lg: 195, xl: 245 };

export function GravityLogo({ size = "md", variant = "dark", id = "gl" }: Props) {
  const src = variant === "light" ? "/GymmanagementLogoDark.png" : "/GymmanagementLogoLight.png";
  return (
    <img
      id={id}
      src={src}
      alt="Gym Management"
      width={widths[size]}
      style={{ objectFit: "contain", display: "inline-block" }}
    />
  );
}
