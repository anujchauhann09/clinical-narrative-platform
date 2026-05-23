-- AlterTable
ALTER TABLE "copilot_documents" ADD COLUMN     "deleted_at" TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "last_login_at" TIMESTAMPTZ(6),
ADD COLUMN     "locked_until" TIMESTAMPTZ(6);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" BIGSERIAL NOT NULL,
    "public_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_public_id" UUID,
    "action" VARCHAR(80) NOT NULL,
    "resource_type" VARCHAR(80),
    "resource_id" VARCHAR(128),
    "ip" VARCHAR(64),
    "user_agent" VARCHAR(512),
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "audit_logs_public_id_key" ON "audit_logs"("public_id");

-- CreateIndex
CREATE INDEX "idx_audit_logs_user_created_at" ON "audit_logs"("user_public_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_audit_logs_action_created_at" ON "audit_logs"("action", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_audit_logs_resource" ON "audit_logs"("resource_type", "resource_id");

-- CreateIndex
CREATE INDEX "idx_copilot_documents_deleted_at" ON "copilot_documents"("deleted_at");
