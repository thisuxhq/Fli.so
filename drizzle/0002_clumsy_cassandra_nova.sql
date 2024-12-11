CREATE TABLE "urls_to_tags" (
	"url_id" text NOT NULL,
	"tag_id" text NOT NULL,
	CONSTRAINT "urls_to_tags_url_id_tag_id_pk" PRIMARY KEY("url_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "urls_to_tags" ADD CONSTRAINT "urls_to_tags_url_id_urls_id_fk" FOREIGN KEY ("url_id") REFERENCES "public"."urls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "urls_to_tags" ADD CONSTRAINT "urls_to_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tags_created_by_idx" ON "tags" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "urls_created_by_idx" ON "urls" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "urls_slug_idx" ON "urls" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "urls" DROP COLUMN "tags";