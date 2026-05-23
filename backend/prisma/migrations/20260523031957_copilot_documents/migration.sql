-- CreateTable
CREATE TABLE "copilot_documents" (
    "id" BIGSERIAL NOT NULL,
    "public_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" BIGINT NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(120) NOT NULL,
    "byte_size" INTEGER NOT NULL,
    "chunk_count" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(40) NOT NULL DEFAULT 'processing',
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "copilot_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "copilot_documents_public_id_key" ON "copilot_documents"("public_id");

-- CreateIndex
CREATE INDEX "idx_copilot_documents_user_created_at" ON "copilot_documents"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_copilot_documents_status" ON "copilot_documents"("status");

-- AddForeignKey
ALTER TABLE "copilot_documents" ADD CONSTRAINT "copilot_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
