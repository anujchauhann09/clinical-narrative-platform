-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "public_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(320) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" BIGSERIAL NOT NULL,
    "public_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" BIGINT NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "bio" TEXT,
    "date_of_birth" DATE,
    "sex" VARCHAR(40),
    "phone" VARCHAR(32),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "symptom_entries" (
    "id" BIGSERIAL NOT NULL,
    "public_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" BIGINT NOT NULL,
    "severity" SMALLINT NOT NULL,
    "mood" VARCHAR(80),
    "notes" TEXT,
    "logged_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "symptom_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "symptoms" (
    "id" BIGSERIAL NOT NULL,
    "public_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(120) NOT NULL,
    "category" VARCHAR(120) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "symptoms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entry_symptoms" (
    "entry_id" BIGINT NOT NULL,
    "symptom_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entry_symptoms_pkey" PRIMARY KEY ("entry_id","symptom_id")
);

-- CreateTable
CREATE TABLE "triggers" (
    "id" BIGSERIAL NOT NULL,
    "public_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(120) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "triggers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entry_triggers" (
    "entry_id" BIGINT NOT NULL,
    "trigger_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entry_triggers_pkey" PRIMARY KEY ("entry_id","trigger_id")
);

-- CreateTable
CREATE TABLE "ai_summaries" (
    "id" BIGSERIAL NOT NULL,
    "public_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" BIGINT NOT NULL,
    "summary_type" VARCHAR(80) NOT NULL,
    "content" TEXT NOT NULL,
    "generated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_public_id_key" ON "users"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_created_at" ON "users"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_public_id_key" ON "user_profiles"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_profiles_created_at" ON "user_profiles"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "symptom_entries_public_id_key" ON "symptom_entries"("public_id");

-- CreateIndex
CREATE INDEX "idx_symptom_entries_user_logged_at" ON "symptom_entries"("user_id", "logged_at" DESC);

-- CreateIndex
CREATE INDEX "idx_symptom_entries_created_at" ON "symptom_entries"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "symptoms_public_id_key" ON "symptoms"("public_id");

-- CreateIndex
CREATE INDEX "idx_symptoms_category" ON "symptoms"("category");

-- CreateIndex
CREATE INDEX "idx_symptoms_created_at" ON "symptoms"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "uq_symptoms_name_category" ON "symptoms"("name", "category");

-- CreateIndex
CREATE INDEX "idx_entry_symptoms_symptom_id" ON "entry_symptoms"("symptom_id");

-- CreateIndex
CREATE INDEX "idx_entry_symptoms_created_at" ON "entry_symptoms"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "triggers_public_id_key" ON "triggers"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "triggers_name_key" ON "triggers"("name");

-- CreateIndex
CREATE INDEX "idx_triggers_created_at" ON "triggers"("created_at");

-- CreateIndex
CREATE INDEX "idx_entry_triggers_trigger_id" ON "entry_triggers"("trigger_id");

-- CreateIndex
CREATE INDEX "idx_entry_triggers_created_at" ON "entry_triggers"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "ai_summaries_public_id_key" ON "ai_summaries"("public_id");

-- CreateIndex
CREATE INDEX "idx_ai_summaries_user_generated_at" ON "ai_summaries"("user_id", "generated_at" DESC);

-- CreateIndex
CREATE INDEX "idx_ai_summaries_summary_type" ON "ai_summaries"("summary_type");

-- CreateIndex
CREATE INDEX "idx_ai_summaries_created_at" ON "ai_summaries"("created_at");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "symptom_entries" ADD CONSTRAINT "symptom_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entry_symptoms" ADD CONSTRAINT "entry_symptoms_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "symptom_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entry_symptoms" ADD CONSTRAINT "entry_symptoms_symptom_id_fkey" FOREIGN KEY ("symptom_id") REFERENCES "symptoms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entry_triggers" ADD CONSTRAINT "entry_triggers_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "symptom_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entry_triggers" ADD CONSTRAINT "entry_triggers_trigger_id_fkey" FOREIGN KEY ("trigger_id") REFERENCES "triggers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_summaries" ADD CONSTRAINT "ai_summaries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
