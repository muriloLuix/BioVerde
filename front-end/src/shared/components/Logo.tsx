interface LogoProps {
  src?: string; 
  imgClassName?: string; 
  titleClassName?: string; 
  gap?: string;
}

const Logo = ({
  src,
  imgClassName,
  titleClassName,
  gap
}: LogoProps) => {
  return (
    <div className={`flex items-center mb-4 justify-center p-5 pb-0 ${gap}`}>
      <img src={src} alt="Bioverde Logo" className={imgClassName} />
      <h1 className={`shadow-title font-[koulen] text-verdePigmento ${titleClassName}`}>
        BIOVERDE
      </h1>
    </div>
  );
};

export default Logo;
