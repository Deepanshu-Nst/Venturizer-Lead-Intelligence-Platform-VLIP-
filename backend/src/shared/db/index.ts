// Database layer — re-exports pool and all repositories
export { pool, query, getClient } from "./pool.js";

export * as usersRepository from "./repositories/users.repository.js";
export * as leadsRepository from "./repositories/leads.repository.js";
export * as founderProfilesRepository from "./repositories/founderProfiles.repository.js";
export * as investorProfilesRepository from "./repositories/investorProfiles.repository.js";
export * as leadScoresRepository from "./repositories/leadScores.repository.js";
export * as documentsRepository from "./repositories/documents.repository.js";
export * as activityLogsRepository from "./repositories/activityLogs.repository.js";

export {
  paginatedQuery,
  findOne,
  insertOne,
} from "./repositories/base.repository.js";
