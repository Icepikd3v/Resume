"""Lead scoring helper for CRM qualification workflows."""

from dataclasses import dataclass


@dataclass
class LeadProfile:
    company_size: int
    engagement: str
    has_budget: bool
    industry_match: bool


def score_lead(profile: LeadProfile) -> int:
    score = 0

    if profile.company_size >= 50:
        score += 25
    if profile.engagement == "high":
        score += 35
    if profile.has_budget:
        score += 20
    if profile.industry_match:
        score += 20

    return min(score, 100)


if __name__ == "__main__":
    sample = LeadProfile(120, "high", True, True)
    print({"lead_score": score_lead(sample)})
