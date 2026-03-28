SELECT owner_id,
       COUNT(*) AS open_pipeline,
       SUM(amount) AS open_pipeline_value
FROM opportunities
WHERE stage NOT IN ('closed_won', 'closed_lost')
GROUP BY owner_id
ORDER BY open_pipeline_value DESC;
