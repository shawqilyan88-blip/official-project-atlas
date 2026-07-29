/**
 * The muted "(Optional)" / "(Optional • Recommended)" suffix on a field label.
 *
 * Centralised so every form says it the same way: optional fields are never a
 * mystery, and the ones that materially improve Atlas's matching are marked as
 * recommended without becoming required.
 */
export type OptionalLevel = 'optional' | 'recommended';

export function OptionalBadge({ level }: { level: OptionalLevel }) {
  return (
    <span className="ml-1.5 text-xs font-normal text-muted-foreground">
      ({level === 'recommended' ? 'Optional • Recommended' : 'Optional'})
    </span>
  );
}
