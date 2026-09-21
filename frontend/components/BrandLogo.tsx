import Image from 'next/image';
import Link from 'next/link';

type BrandLogoProps = {
  href?: string;
  compact?: boolean;
  priority?: boolean;
  className?: string;
};

export default function BrandLogo({
  href = '/',
  compact = true,
  priority = false,
  className = '',
}: BrandLogoProps) {
  const logo = compact ? (
    <span className={`soulsync-brand-inline ${className}`.trim()}>
      <Image
        src="/soulsync-mark.png"
        alt=""
        width={48}
        height={40}
        className="soulsync-brand-mark"
        priority={priority}
      />

      <span className="soulsync-brand-name">
        <span>Soul</span>
        <span>Sync</span>
      </span>
    </span>
  ) : (
    <Image
      src="/soulsync-logo.png"
      alt="SoulSync — Meaningful connections for a brighter tomorrow"
      width={420}
      height={420}
      className={`soulsync-brand-full ${className}`.trim()}
      priority={priority}
    />
  );

  return href ? (
    <Link
      href={href}
      className="soulsync-brand-link"
      aria-label="SoulSync home"
    >
      {logo}
    </Link>
  ) : (
    logo
  );
}