interface LogoProps {
  src?: string;
  imgClassName?: string;
  titleClassName?: string;
  gap?: string;
}

const Logo = ({ src, imgClassName, titleClassName, gap }: LogoProps) => {
  return (
    <div className={`lg:h-1/8 h-16 w-full flex items-center justify-center ${gap} lg:p-4 pr-3 relative`}>
      <img src={src} alt="Bioverde Logo" className={imgClassName} />
      <h1
        className={`shadow-title font-[koulen] text-verdePigmento py-3 ${titleClassName}`}
      >
        BIOVERDE
      </h1>
    </div>
  );
};

export default Logo;
