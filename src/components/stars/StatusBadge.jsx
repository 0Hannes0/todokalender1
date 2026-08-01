/**
 * StatusBadge — color-coded reward/punishment card.
 *
 * Props:
 *   status  {'neutral' | 'strafe-mild' | 'strafe-leicht' | 'strafe-mittel' | 'strafe-schwer' | 'belohnung' | 'sonderbelohnung'}
 *   totalStars {number}
 *   kasse   {number}
 *   kassePct {number}
 *   bonusTage {number}
 */
export function StatusBadge({ status, totalStars, kasse, kassePct, bonusTage }) {
  if (status === 'neutral') {
    return (
      <div className="rounded-xl px-4 py-3 bg-surface-3 border border-border text-sm text-text-2 flex items-center gap-2">
        <span>✅</span>
        <span>Auf Kurs — weiter so!</span>
      </div>
    )
  }

  if (status === 'sonderbelohnung') {
    return (
      <div className="rounded-xl px-4 py-3 border text-sm flex items-center gap-2 bg-accent/10 border-accent/30">
        <span>🎁</span>
        <div>
          <p className="font-semibold text-accent">Sonderbelohnung!</p>
          <p className="text-text-2 text-xs mt-0.5">Gezahltes Geld zurückerhalten (max. 2 Monate)</p>
        </div>
      </div>
    )
  }

  if (status === 'belohnung') {
    return (
      <div className="rounded-xl px-4 py-3 border text-sm flex items-center gap-2 bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800">
        <span>🏆</span>
        <div>
          <p className="font-semibold text-green-700 dark:text-green-400">Belohnung erreicht!</p>
          <p className="text-text-2 text-xs mt-0.5">+1 freier Tag nächsten Monat wählbar</p>
        </div>
      </div>
    )
  }

  if (status === 'strafe-mild') {
    return (
      <div className="rounded-xl px-4 py-3 border text-sm flex items-center gap-2 bg-surface-3 border-border">
        <span>⚠️</span>
        <div>
          <p className="font-semibold text-text">25–26 Sterne</p>
          <p className="text-text-2 text-xs mt-0.5">−1 freier Tag im nächsten Monat</p>
        </div>
      </div>
    )
  }

  if (status === 'strafe-leicht') {
    return (
      <div className="rounded-xl px-4 py-3 border text-sm flex items-center gap-2 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800">
        <span>💸</span>
        <div>
          <p className="font-semibold text-orange-700 dark:text-orange-400">€10 in die Kasse</p>
          <p className="text-text-2 text-xs mt-0.5">unter 24 Sterne</p>
        </div>
      </div>
    )
  }

  if (status === 'strafe-mittel') {
    return (
      <div className="rounded-xl px-4 py-3 border text-sm flex items-center gap-2 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800">
        <span>💸</span>
        <div>
          <p className="font-semibold text-red-700 dark:text-red-400">€20 in die Kasse</p>
          <p className="text-text-2 text-xs mt-0.5">unter 20 Sterne · max. {kassePct}% rückholbar</p>
        </div>
      </div>
    )
  }

  if (status === 'strafe-schwer') {
    return (
      <div className="rounded-xl px-4 py-3 border text-sm flex items-center gap-2 bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700">
        <span>💸</span>
        <div>
          <p className="font-semibold text-red-800 dark:text-red-300">€40 in die Kasse</p>
          <p className="text-text-2 text-xs mt-0.5">unter 10 Sterne · max. {kassePct}% rückholbar</p>
        </div>
      </div>
    )
  }

  return null
}
