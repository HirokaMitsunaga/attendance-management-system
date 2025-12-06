-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "gender" "Gender",
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" TEXT NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "deleted_by" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_conditions" (
    "id" TEXT NOT NULL,
    "form_type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url_params" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" TEXT NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "deleted_by" TEXT,

    CONSTRAINT "search_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE INDEX "search_conditions_deleted_at_idx" ON "search_conditions"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "search_conditions_form_type_name_key" ON "search_conditions"("form_type", "name");
