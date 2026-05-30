-- CreateTable
CREATE TABLE "pattern_insights" (
    "id" BIGSERIAL NOT NULL,
    "public_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" BIGINT NOT NULL,
    "pattern_key" VARCHAR(80) NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "observation" TEXT NOT NULL,
    "discussion_topics" JSONB NOT NULL,
    "severity" VARCHAR(40) NOT NULL DEFAULT 'informational',
    "confidence" VARCHAR(40) NOT NULL DEFAULT 'low',
    "evidence_count" INTEGER NOT NULL DEFAULT 0,
    "window_start" TIMESTAMPTZ(6) NOT NULL,
    "window_end" TIMESTAMPTZ(6) NOT NULL,
    "dismissed_at" TIMESTAMPTZ(6),
    "feedback" VARCHAR(40),
    "expires_at" TIMESTAMPTZ(6),
    "generated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "pattern_insights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pattern_insights_public_id_key" ON "pattern_insights"("public_id");

-- CreateIndex
CREATE INDEX "idx_pattern_insights_user_generated_at" ON "pattern_insights"("user_id", "generated_at" DESC);

-- CreateIndex
CREATE INDEX "idx_pattern_insights_dismissed_at" ON "pattern_insights"("dismissed_at");

-- CreateIndex
CREATE UNIQUE INDEX "uq_pattern_insights_user_key_window" ON "pattern_insights"("user_id", "pattern_key", "window_start");

-- AddForeignKey
ALTER TABLE "pattern_insights" ADD CONSTRAINT "pattern_insights_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
