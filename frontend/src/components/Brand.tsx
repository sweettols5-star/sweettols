import Link from './Link';

/**
 * The cake drawing from the client's logo + the name set in type. The logo
 * file itself spells « SWEETTOLS », so only its drawing is reused.
 */
export default function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`brand${light ? ' brand--light' : ''}`} aria-label="SweetTools — accueil">
      <img src="/brand/emblem.png" alt="" width={44} height={44} className="brand__mark" />
      <span className="brand__name">
        Sweet<span>Tools</span>
      </span>
    </Link>
  );
}
