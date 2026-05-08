import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  date,
  time,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── ENUMS ───────────────────────────────────────────────────────────────────

export const planEnum = pgEnum("plan", ["free", "starter", "pro", "elite"]);

export const globalRoleEnum = pgEnum("global_role", [
  "super_admin",
  "club_admin",
  "staff",
  "player",
]);

export const teamRoleEnum = pgEnum("team_role", [
  "head_coach",
  "assistant",
  "analyst",
  "fitness",
  "delegate",
  "team_manager",
]);

export const staffDeptEnum = pgEnum("staff_dept", [
  "medical",
  "udia",
  "gr_coach",
]);

export const positionEnum = pgEnum("position", [
  "goalkeeper",
  "defender",
  "midfielder",
  "forward",
]);

export const eventTypeEnum = pgEnum("event_type", [
  "training",
  "match",
  "rest",
  "friendly",
  "cup",
  "tournament",
  "cryo",
  "cohesion",
  "stage",
]);

export const questionnaireTypeEnum = pgEnum("questionnaire_type", [
  "psr",
  "pse",
  "post_match",
]);

export const medicalRecordTypeEnum = pgEnum("medical_record_type", [
  "injury",
  "physio",
  "cryo",
  "massage",
  "other",
]);

export const severityEnum = pgEnum("severity", [
  "minor",
  "moderate",
  "severe",
]);

// ─── CLUBS ───────────────────────────────────────────────────────────────────

export const clubs = pgTable("clubs", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").default("#1a56db"),
  plan: planEnum("plan").notNull().default("free"),
  maxTeams: integer("max_teams").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── SEASONS ─────────────────────────────────────────────────────────────────

export const seasons = pgTable("seasons", {
  id: uuid("id").primaryKey().defaultRandom(),
  clubId: uuid("club_id")
    .notNull()
    .references(() => clubs.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // "2026/27"
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── TEAMS ───────────────────────────────────────────────────────────────────

export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  seasonId: uuid("season_id")
    .notNull()
    .references(() => seasons.id, { onDelete: "cascade" }),
  clubId: uuid("club_id")
    .notNull()
    .references(() => clubs.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // "Infantis A"
  ageGroup: text("age_group"), // "Sub-12"
  color: text("color").default("#1a56db"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── USERS ───────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clubId: uuid("club_id").references(() => clubs.id, { onDelete: "set null" }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  hashedPassword: text("hashed_password"),
  globalRole: globalRoleEnum("global_role").notNull().default("staff"),
  staffDept: staffDeptEnum("staff_dept"), // medical, udia, gr_coach
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").notNull().default(true),
  emailVerified: timestamp("email_verified"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── INVITES ─────────────────────────────────────────────────────────────────

export const invites = pgTable("invites", {
  id: uuid("id").primaryKey().defaultRandom(),
  clubId: uuid("club_id")
    .notNull()
    .references(() => clubs.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  globalRole: globalRoleEnum("global_role").notNull().default("staff"),
  staffDept: staffDeptEnum("staff_dept"),
  teamId: uuid("team_id").references(() => teams.id),
  teamRole: teamRoleEnum("team_role"),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── TEAM MEMBERS ────────────────────────────────────────────────────────────

export const teamMembers = pgTable("team_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: teamRoleEnum("role").notNull().default("assistant"),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── PLAYERS ─────────────────────────────────────────────────────────────────

export const players = pgTable("players", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  clubId: uuid("club_id")
    .notNull()
    .references(() => clubs.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  number: integer("number"),
  position: positionEnum("position").notNull().default("midfielder"),
  birthDate: date("birth_date"),
  nationality: text("nationality").default("PT"),
  phone: text("phone"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── EVENTS (Planeamento) ─────────────────────────────────────────────────────

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  type: eventTypeEnum("type").notNull().default("training"),
  title: text("title").notNull(),
  date: date("date").notNull(),
  startTime: time("start_time"),
  endTime: time("end_time"),
  arrivalTime: time("arrival_time"),
  location: text("location"),
  opponent: text("opponent"),
  isHome: boolean("is_home"),
  competition: text("competition"),
  matchday: integer("matchday"),
  trainingUnitNumber: integer("training_unit_number"),
  weekNumber: integer("week_number"),
  notes: text("notes"),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── QUESTIONNAIRE RESPONSES ─────────────────────────────────────────────────

export const questionnaireResponses = pgTable("questionnaire_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  playerId: uuid("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  type: questionnaireTypeEnum("type").notNull(),
  eventId: uuid("event_id").references(() => events.id, {
    onDelete: "set null",
  }),
  sequenceNumber: integer("sequence_number"),
  date: date("date").notNull(),
  answers: jsonb("answers").notNull(), // { q1: value, q2: value, ... }
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

// ─── MEDICAL RECORDS ─────────────────────────────────────────────────────────

export const medicalRecords = pgTable("medical_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  playerId: uuid("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  clubId: uuid("club_id")
    .notNull()
    .references(() => clubs.id, { onDelete: "cascade" }),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  type: medicalRecordTypeEnum("type").notNull(),
  description: text("description").notNull(),
  bodyPart: text("body_part"),
  severity: severityEnum("severity"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── UDIA SESSIONS ───────────────────────────────────────────────────────────

export const udiaSessions = pgTable("udia_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  clubId: uuid("club_id")
    .notNull()
    .references(() => clubs.id, { onDelete: "cascade" }),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  date: date("date").notNull(),
  startTime: time("start_time"),
  objectives: text("objectives"),
  notes: text("notes"),
  clipUrls: jsonb("clip_urls").default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const udiaSessionPlayers = pgTable("udia_session_players", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => udiaSessions.id, { onDelete: "cascade" }),
  playerId: uuid("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  feedback: text("feedback"),
  clipUrls: jsonb("clip_urls").default([]),
});

// ─── GR SESSIONS ─────────────────────────────────────────────────────────────

export const grSessions = pgTable("gr_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  clubId: uuid("club_id")
    .notNull()
    .references(() => clubs.id, { onDelete: "cascade" }),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  date: date("date").notNull(),
  startTime: time("start_time"),
  ageGroupFilter: text("age_group_filter"),
  objectives: text("objectives"),
  notes: text("notes"),
  clipUrls: jsonb("clip_urls").default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const grSessionPlayers = pgTable("gr_session_players", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => grSessions.id, { onDelete: "cascade" }),
  playerId: uuid("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  feedback: text("feedback"),
  clipUrls: jsonb("clip_urls").default([]),
});

// ─── CLIPS ───────────────────────────────────────────────────────────────────

export const clips = pgTable("clips", {
  id: uuid("id").primaryKey().defaultRandom(),
  clubId: uuid("club_id")
    .notNull()
    .references(() => clubs.id, { onDelete: "cascade" }),
  playerId: uuid("player_id").references(() => players.id, {
    onDelete: "cascade",
  }),
  eventId: uuid("event_id").references(() => events.id, {
    onDelete: "set null",
  }),
  url: text("url").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── ATTENDANCES ─────────────────────────────────────────────────────────────

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present",
  "absent",
  "justified",
  "injured",
  "late",
]);

export const attendances = pgTable("attendances", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  playerId: uuid("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  status: attendanceStatusEnum("status").notNull().default("present"),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── RELATIONS ───────────────────────────────────────────────────────────────

export const clubsRelations = relations(clubs, ({ many }) => ({
  seasons: many(seasons),
  teams: many(teams),
  users: many(users),
  players: many(players),
}));

export const seasonsRelations = relations(seasons, ({ one, many }) => ({
  club: one(clubs, { fields: [seasons.clubId], references: [clubs.id] }),
  teams: many(teams),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  season: one(seasons, { fields: [teams.seasonId], references: [seasons.id] }),
  club: one(clubs, { fields: [teams.clubId], references: [clubs.id] }),
  members: many(teamMembers),
  players: many(players),
  events: many(events),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  club: one(clubs, { fields: [users.clubId], references: [clubs.id] }),
  teamMemberships: many(teamMembers),
}));

export const playersRelations = relations(players, ({ one, many }) => ({
  user: one(users, { fields: [players.userId], references: [users.id] }),
  team: one(teams, { fields: [players.teamId], references: [teams.id] }),
  club: one(clubs, { fields: [players.clubId], references: [clubs.id] }),
  questionnaireResponses: many(questionnaireResponses),
  medicalRecords: many(medicalRecords),
  attendances: many(attendances),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  team: one(teams, { fields: [events.teamId], references: [teams.id] }),
  questionnaireResponses: many(questionnaireResponses),
  clips: many(clips),
  attendances: many(attendances),
}));

// ─── TYPES ───────────────────────────────────────────────────────────────────

export type Club = typeof clubs.$inferSelect;
export type NewClub = typeof clubs.$inferInsert;
export type Season = typeof seasons.$inferSelect;
export type NewSeason = typeof seasons.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type QuestionnaireResponse = typeof questionnaireResponses.$inferSelect;
export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type UdiaSession = typeof udiaSessions.$inferSelect;
export type GrSession = typeof grSessions.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type Clip = typeof clips.$inferSelect;
export type Attendance = typeof attendances.$inferSelect;
export type Invite = typeof invites.$inferSelect;
