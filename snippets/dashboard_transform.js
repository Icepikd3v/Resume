export function toDashboardCard(deal) {
  return {
    id: deal.id,
    owner: deal.owner,
    stage: deal.stage,
    amountLabel: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(deal.amount),
    updatedAt: new Date(deal.updatedAt).toLocaleDateString()
  };
}
