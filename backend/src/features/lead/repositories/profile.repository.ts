import type {
  FounderProfile,
  InvestorProfile,
  CreateFounderProfileInput,
  CreateInvestorProfileInput,
} from "../../../shared/types/index.js";
import * as founderRepo from "../../../shared/db/repositories/founderProfiles.repository.js";
import * as investorRepo from "../../../shared/db/repositories/investorProfiles.repository.js";

export async function findFounderProfile(leadId: string): Promise<FounderProfile | null> {
  return founderRepo.findByLeadId(leadId);
}

export async function findInvestorProfile(leadId: string): Promise<InvestorProfile | null> {
  return investorRepo.findByLeadId(leadId);
}

export async function createFounderProfile(
  input: CreateFounderProfileInput
): Promise<FounderProfile> {
  return founderRepo.create(input);
}

export async function createInvestorProfile(
  input: CreateInvestorProfileInput
): Promise<InvestorProfile> {
  return investorRepo.create(input);
}

export { type FounderProfile, type InvestorProfile };
