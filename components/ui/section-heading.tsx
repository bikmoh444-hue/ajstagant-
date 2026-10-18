export function SectionHeading({ title, description, light = false }: {
  title: string; description?: string; light?: boolean;
}) {
  return <>
    <div className={`section-heading ${light ? 'light' : ''}`}><h2>{title}</h2><span /></div>
    {description && <p className="section-caption">{description}</p>}
  </>;
}
