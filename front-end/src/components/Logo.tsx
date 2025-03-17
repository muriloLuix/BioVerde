export default function Logo() {
  return (
    <div className="flex items-center mb-4 justify-center gap-5">
      <img
        src="/logo-bioverde.png"
        alt="Bioverde Logo"
        className="h-15 w-15 md:w-20 md:h-20 md:mr-4"
      />
      <h1 className="shadow-title font-[koulen] md:text-5xl text-4xl tracking-wide text-verdePigmento">
        BIOVERDE
      </h1>
    </div>
  );
}
