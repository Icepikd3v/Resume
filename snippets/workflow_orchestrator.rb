class WorkflowOrchestrator
  def initialize(crm_client:, notifier:)
    @crm_client = crm_client
    @notifier = notifier
  end

  def run(deal_payload)
    deal_id = @crm_client.push_deal(deal_payload)
    @notifier.send("Deal synced: #{deal_id}")
    :ok
  rescue StandardError => e
    @notifier.send("Sync failed: #{e.message}")
    :retry
  end
end
