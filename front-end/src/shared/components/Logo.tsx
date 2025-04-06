interface LogoProps {
  src?: string;
  imgClassName?: string;
  titleClassName?: string;
  gap?: string;
}

const Logo = ({ src, imgClassName, titleClassName, gap }: LogoProps) => {
  return (
    <div className={`h-1/8 w-full flex items-center justify-center ${gap} p-4`}>
      <img src={src} alt="Bioverde Logo" className={imgClassName} />
      <h1
        className={`shadow-title font-[koulen] text-verdePigmento ${titleClassName}`}
      >
        BIOVERDE
      </h1>
    </div>
  );
};

export default Logo;
