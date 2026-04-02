/**
 * Fitship Formula: (Monthly Fee / 30) * 2
 */
export function calculateSessionCost(monthlyFee: number): number {
  return Math.floor((monthlyFee / 30) * 2);
}

/**
 * Payout Split: 80% to Gym Owner, 20% to Fitship
 */
export function calculatePayoutSplit(sessionCost: number) {
  const ownerShare = Math.floor(sessionCost * 0.8);
  const commission = sessionCost - ownerShare;
  return { ownerShare, commission };
}

/**
 * Format currency to INR
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
