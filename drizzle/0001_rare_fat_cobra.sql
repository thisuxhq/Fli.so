ALTER TABLE "customers" ADD COLUMN "created_at" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "updated_at" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "domains" ADD COLUMN "verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "domains" ADD COLUMN "created_at" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "domains" ADD COLUMN "updated_at" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "created_at" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "updated_at" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "created_at" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "updated_at" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "urls" ADD COLUMN "created_at" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "urls" ADD COLUMN "updated_at" timestamp with time zone NOT NULL;